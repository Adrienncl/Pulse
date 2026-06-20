#!/usr/bin/env python3
"""
Zero Employee Studio — Hermes AI Connector
Calls the LLM API directly (OpenCode Zen / Nemotron 3 Ultra) for brief analysis,
pricing, and creative generation.
"""

import json
import os
import sys
import time
import logging
import requests

# Module logger
logger = logging.getLogger("zes-connector")

# Load API config from zes profile .env
HERMES_HOME = os.path.expanduser("~/.hermes")
ZES_ENV = os.path.join(HERMES_HOME, "profiles", "zes", ".env")

def _load_env_value(key: str, fallback_file: str = None) -> str:
    """Load a value from .env file."""
    # Try zes profile first
    for env_file in [ZES_ENV, os.path.join(HERMES_HOME, ".env")]:
        if os.path.exists(env_file):
            with open(env_file) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith(f"{key}=") and not line.startswith("#"):
                        val = line.split("=", 1)[1].strip()
                        # Remove inline comments
                        if "  #" in val:
                            val = val.split("  #")[0].strip()
                        return val
    return os.environ.get(key, "")

# API config
# API config
API_KEY = _load_env_value("OPENCODE_ZEN_API_KEY")
BASE_URL = _load_env_value("OPENCODE_ZEN_BASE_URL") or "https://opencode.ai/zen/v1"
MODEL = "nemotron-3-ultra-free"

def call_llm(prompt: str, system: str = "", max_tokens: int = 2000, temperature: float = 0.3, timeout: int = 20) -> dict:
    """Call the Nemotron 3 Ultra API directly via OpenCode Zen."""
    if not API_KEY:
        return {"error": "No API key found for OpenCode Zen"}
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    
    try:
        logger.info(f"🧠 Calling Nemotron 3 Ultra (timeout={timeout}s)...")
        resp = requests.post(
            f"{BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        
        content = data["choices"][0]["message"]["content"].strip()
        logger.info(f"🧠 Nemotron 3 Ultra responded in {resp.elapsed.total_seconds():.1f}s")
        
        # Try to parse as JSON
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code block
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
                return json.loads(json_str)
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
                return json.loads(json_str)
            return {"text": content}
            
    except requests.exceptions.Timeout:
        logger.warning(f"🧠 Nemotron 3 Ultra timeout ({timeout}s)")
        return {"error": f"LLM API timeout ({timeout}s)"}
    except requests.exceptions.RequestException as e:
        logger.warning(f"🧠 Nemotron 3 Ultra error: {str(e)[:100]}")
        return {"error": f"LLM API error: {str(e)}"}
    except (KeyError, IndexError) as e:
        return {"error": f"Unexpected API response: {str(e)}"}


def analyze_brief(brief_text: str, products: list = None) -> dict:
    """Analyze a client brief — tries Nemotron 3 Ultra first, falls back to local agent."""
    import logging
    logger = logging.getLogger("zes-connector")
    
    # Try Nemotron 3 Ultra with short timeout
    llm_start = time.time()
    result = _analyze_brief_llm(brief_text, products)
    llm_elapsed = time.time() - llm_start
    
    if "error" not in result:
        logger.info(f"🧠 Nemotron 3 Ultra OK ({llm_elapsed:.1f}s)")
        result["_model"] = "nemotron-3-ultra-free"
        return result
    
    # Fallback: local intake agent (instant)
    logger.info(f"🧠 Nemotron 3 Ultra slow ({llm_elapsed:.1f}s), using local agent")
    try:
        from intake_agent import analyze_brief as local_analyze
        local_result = local_analyze(brief_text)
        local_result["_model"] = f"nemotron-3-ultra-free (fallback {llm_elapsed:.1f}s)"
        local_result["_nemotron_attempted"] = True
        return local_result
    except Exception as e:
        return {"error": f"Fallback failed: {str(e)}", "_model": "nemotron-3-ultra-free"}


def _analyze_brief_llm(brief_text: str, products: list = None) -> dict:
    """Internal: Analyze a client brief using the LLM."""
    products_str = ", ".join(products) if products else "not specified"
    
    system = """You are an AI business analyst for a creative agency. 
Analyze client briefs and return structured JSON analysis.
Always return ONLY valid JSON, no other text."""

    prompt = f"""Analyze this client brief and return a JSON analysis:

Brief: {brief_text}
Selected products: {products_str}

Return a JSON object with these fields:
- business_type: string (e.g. "restaurant", "startup", "retail")
- industry: string
- target_audience: string
- needs: array of strings (logo, website, social_media, branding, etc.)
- tone: string (professional, modern, playful, luxury, minimalist)
- style_preferences: string
- required_deliverables: array of strings
- recommended_package: string (Logo Only, Web Only, Social Pack, or Full Brand)
- risk_notes: array of strings

Return ONLY the JSON object."""

    return call_llm(prompt, system=system)


def generate_creative(brief: str, business_type: str, tone: str = "professional") -> dict:
    """Generate creative deliverables using the LLM."""
    system = """You are an AI creative director for a zero-employee creative agency.
Generate realistic creative deliverables as JSON.
Always return ONLY valid JSON, no other text."""

    prompt = f"""Generate creative deliverables for: {brief}
Business: {business_type}, Tone: {tone}

Return JSON with:
- logo: {{"name": str, "description": str, "colors": [str]}}
- website: {{"name": str, "tagline": str, "sections": [str]}}
- social_posts: [{{"caption": str, "hashtags": [str]}}]
- brand_kit: {{"colors": {{"primary": str, "secondary": str}}, "fonts": [str]}}

ONLY JSON."""

    return call_llm(prompt, system=system, max_tokens=1500, temperature=0.5)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "analyze":
            brief = sys.argv[2] if len(sys.argv) > 2 else "Test brief"
            result = analyze_brief(brief)
            print(json.dumps(result, indent=2))
        elif command == "creative":
            brief = sys.argv[2] if len(sys.argv) > 2 else "Test project"
            result = generate_creative(brief, "restaurant")
            print(json.dumps(result, indent=2))
        else:
            print("Usage: python3 zes_connector.py [analyze|creative] [brief]")
    else:
        print("Zero Employee Studio — Hermes AI Connector (Direct API)")
        print("Usage:")
        print("  python3 zes_connector.py analyze 'client brief text'")
        print("  python3 zes_connector.py creative 'project description'")
