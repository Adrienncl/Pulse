#!/usr/bin/env python3
"""Weekly monitoring script — scans a configured URL and stores results.
Configure the URL below, or pass as argument: python3 monitor.py https://example.com
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime

API_BASE = os.environ.get("MONITOR_API", "http://localhost:8000/api/rankfix")
HISTORY_DIR = os.path.expanduser("~/.hermes/monitoring")

def scan_url(url):
    """Trigger a scan for the given URL and poll until complete."""
    req = urllib.request.Request(
        f"{API_BASE}/kanban-scan",
        data=json.dumps({"url": url}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=30)
    data = json.loads(resp.read().decode())
    session_id = data.get("session_id")
    if not session_id:
        print(f"ERROR: No session_id returned for {url}")
        return None
    
    # Poll for completion
    import time
    for _ in range(30):
        time.sleep(2)
        status_req = urllib.request.Request(f"{API_BASE}/kanban-status/{session_id}")
        try:
            status_resp = urllib.request.urlopen(status_req, timeout=10)
            status = json.loads(status_resp.read().decode())
            if status.get("all_done") and status.get("result"):
                result = status["result"]
                result["monitored_at"] = datetime.now().isoformat()
                return result
            elif status.get("status") == "error":
                print(f"ERROR: Scan failed for {url}")
                return None
        except Exception as e:
            print(f"WARNING: Poll error: {e}")
            continue
    
    print(f"ERROR: Timeout waiting for scan of {url}")
    return None

def save_result(url, result):
    """Save scan result to history file."""
    os.makedirs(HISTORY_DIR, exist_ok=True)
    safe_name = url.replace("https://", "").replace("http://", "").replace("/", "_").replace(".", "-")
    history_file = os.path.join(HISTORY_DIR, f"{safe_name}.json")
    
    history = []
    if os.path.exists(history_file):
        with open(history_file) as f:
            history = json.load(f)
    
    history.append({
        "timestamp": result.get("monitored_at", datetime.now().isoformat()),
        "score": result.get("score", 0),
        "pillars": result.get("pillars", {}),
        "améliorations": result.get("améliorations", [])[:3],
    })
    
    # Keep last 20 entries
    history = history[-20:]
    
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2, ensure_ascii=False)
    
    return history

def check_regression(history):
    """Detect score regression compared to previous scan."""
    if len(history) < 2:
        return None
    prev = history[-2]["score"]
    curr = history[-1]["score"]
    diff = curr - prev
    if diff < -5:
        return f"⚠️ Score dropped {abs(diff)} points: {prev} → {curr}"
    elif diff > 5:
        return f"✅ Score improved {diff} points: {prev} → {curr}"
    return None

if __name__ == "__main__":
    # Default demo URL — change this or pass as argument
    url = sys.argv[1] if len(sys.argv) > 1 else "https://www.jcflams.fr"
    
    print(f"🔍 Scanning {url}...")
    result = scan_url(url)
    if not result:
        print("❌ Scan failed")
        sys.exit(1)
    
    score = result.get("score", 0)
    print(f"✅ Score: {score}/100")
    
    history = save_result(url, result)
    print(f"📊 History saved ({len(history)} entries)")
    
    alert = check_regression(history)
    if alert:
        print(f"🔔 {alert}")
    
    print("Done.")
