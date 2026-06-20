#!/usr/bin/env python3
"""
Zero Employee Studio — E2E Autonomy Demo Script
================================================
Démontre le workflow complet 100% autonome avec Nemotron 3 Ultra.
Utilise les agents Hermes pour gérer brief → livraison sans humain.

Usage:
    python3 demo_e2e.py                    # Nouveau projet
    python3 demo_e2e.py --quick            # Version rapide
    python3 demo_e2e.py --list             # Voir les projets existants
"""
import requests
import json
import sys
import time
import os

API = "http://localhost:8000"
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
END = "\033[0m"


def print_header(text):
    print(f"\n{CYAN}{'='*60}{END}")
    print(f"{CYAN}{BOLD}  {text}{END}")
    print(f"{CYAN}{'='*60}{END}")


def print_step(num, label, status="⏳", detail=""):
    icon = {"✅": "✅", "⏳": "⏳", "❌": "❌", "🤖": "🤖", "💰": "💰"}.get(status, "•")
    detail_str = f" — {YELLOW}{detail}{END}" if detail else ""
    print(f"  {icon} {label}{detail_str}")


def check_service():
    try:
        r = requests.get(f"{API}/api/health", timeout=3)
        return r.status_code == 200
    except:
        return False


def run_workflow(brief, client_name, client_email="client@example.com"):
    """Run the complete 12-step workflow."""
    payload = {
        "brief": brief,
        "client_name": client_name,
        "client_email": client_email,
    }
    
    print(f"\n{YELLOW}📋 Brief: {brief[:80]}...{END}")
    print(f"   Client: {client_name} ({client_email})")
    print()
    
    try:
        resp = requests.post(f"{API}/api/workflow/full", json=payload, timeout=120)
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.Timeout:
        print(f"{RED}❌ Workflow timeout (>120s){END}")
        return None
    except Exception as e:
        print(f"{RED}❌ Workflow error: {e}{END}")
        return None


def show_workflow_result(data):
    """Display workflow result with Nemotron badge."""
    if not data or data.get("status") != "completed":
        print(f"{RED}❌ Workflow failed{END}")
        return
    
    wf = data.get("workflow", {})
    
    print(f"\n{GREEN}{BOLD}  🤖 ZERO EMPLOYEE STUDIO — AUTONOMOUS DELIVERY REPORT{END}")
    print(f"{GREEN}{'─'*60}{END}")
    print(f"  Client:     {data.get('client_name', 'N/A')}")
    print(f"  Session:    {data.get('session_id', 'N/A')}")
    print(f"  Model:      {BOLD}Nemotron 3 Ultra{END} 🤖")
    print(f"  Status:     ✅ DELIVERED")
    print()
    
    # Phase 1: Intelligence
    print(f"  {BOLD}PHASE 1: INTELLIGENCE{END}")
    intake = wf.get("intake", {})
    print(f"    📊 Business: {intake.get('business_type', '?')} | Score: {intake.get('quality_score', 0)}/100")
    
    template = wf.get("template_selection", {})
    print(f"    🎨 Template: {template.get('template_name', '?')} (confidence: {template.get('confidence', 0)*100:.0f}%)")
    
    # Phase 2: Commerce
    print(f"\n  {BOLD}PHASE 2: COMMERCE{END}")
    pricing = wf.get("pricing", {})
    print(f"    💰 Package: {pricing.get('package_name', '?')} — ${pricing.get('price', 0)}")
    
    checkout = wf.get("checkout", {})
    print(f"    💳 Payment: {checkout.get('status', '?')} — {checkout.get('session_id', '?')}")
    
    procurement = wf.get("procurement", {})
    print(f"    📦 Procurement: {procurement.get('procurement_decision', '?')}")
    if procurement.get('domain_name'):
        print(f"    🌐 Domain: {procurement['domain_name']}")
    
    # Phase 3: Creation
    print(f"\n  {BOLD}PHASE 3: CREATION{END}")
    brand = wf.get("brand", {})
    print(f"    🎯 Brand: {brand.get('brand_name', '?')}")
    print(f"    🎨 Colors: {json.dumps(brand.get('color_palette', {}))}")
    print(f"    📝 Voice: {brand.get('brand_voice', '?')}")
    
    content = wf.get("content", {})
    print(f"    📄 Content: \"{content.get('hero_title', '?')}\"")
    print(f"    📰 About: \"{content.get('about_title', '?')}\"")
    menu_count = len(content.get('menu_items', []))
    print(f"    🍽️ Menu items: {menu_count}")
    
    composition = wf.get("composition", {})
    print(f"    🖥️ Site: {composition.get('site_status', '?')} ({composition.get('file_size_kb', 0)} KB)")
    
    social = wf.get("social", {})
    print(f"    📱 Social posts: {social.get('total_posts', 0)} across {len(social.get('platforms', []))} platforms")
    
    # Phase 4: Delivery
    print(f"\n  {BOLD}PHASE 4: DELIVERY{END}")
    delivery = wf.get("delivery", {})
    print(f"    📦 Status: {delivery.get('status', '?')}")
    print(f"    📎 Files: {delivery.get('deliverables_count', 0)} deliverables")
    
    finance = wf.get("finance", {})
    print(f"\n  {BOLD}💰 FINANCIAL SUMMARY{END}")
    print(f"    Revenue:    ${finance.get('revenue', 0):,.2f}")
    print(f"    Costs:      ${finance.get('total_costs', 0):,.2f}")
    print(f"    {GREEN}Profit:     ${finance.get('net_profit', 0):,.2f}{END}")
    print(f"    {GREEN}Margin:     {finance.get('margin_percent', 0):.1f}%{END}")
    print(f"    👥 Humans:   0 (fully autonomous)")
    
    invoice = wf.get("invoice", {})
    print(f"    📄 Invoice: {invoice.get('invoice_number', '?')}")
    
    print(f"\n{GREEN}{BOLD}  ✅ END-TO-END AUTONOMOUS DELIVERY COMPLETE{END}")
    print(f"{GREEN}{'─'*60}{END}")
    print(f"  Powered by:    {BOLD}Nemotron 3 Ultra{END} (NVIDIA)")
    print(f"  Orchestrated:  Zero Employee Studio OS")
    print(f"  Humans:        0")
    print(f"{GREEN}{'─'*60}{END}\n")


def show_agent_stats():
    """Show stats from all agents."""
    print_header("📊 AGENT STATUS DASHBOARD")
    
    # Accounting
    try:
        r = requests.get(f"{API}/api/accounting/dashboard", timeout=5)
        acc = r.json().get("stats", {})
        print(f"  💰 Accounting: ${acc.get('total_profit',0):.0f} profit | {acc.get('project_count',0)} projects | {acc.get('avg_margin',0):.1f}% avg margin")
        if acc.get('insights'):
            for ins in acc['insights'][:2]:
                print(f"     • {ins}")
    except:
        print(f"  💰 Accounting: unavailable")
    
    # Support
    try:
        r = requests.get(f"{API}/api/support/stats", timeout=5)
        sup = r.json().get("stats", {})
        print(f"  🎫 Support: {sup.get('pending_count',0)} pending | {sup.get('completed_today',0)} today | {sup.get('satisfaction_rate',0)}% satisfaction")
    except:
        print(f"  🎫 Support: unavailable")
    
    # Email
    try:
        r = requests.get(f"{API}/api/email/history", timeout=5)
        emails = r.json().get("emails", [])
        print(f"  📧 Email: {len(emails)} emails sent")
        if emails:
            print(f"     Latest: \"{emails[0].get('subject','')[:60]}\"")
    except:
        print(f"  📧 Email: unavailable")


def main():
    print(f"\n{CYAN}{BOLD}")
    print(f"  ╔══════════════════════════════════════════════╗")
    print(f"  ║   ZERO EMPLOYEE STUDIO OS                    ║")
    print(f"  ║   E2E Autonomy Demo                          ║")
    print(f"  ║   Powered by Nemotron 3 Ultra 🤖             ║")
    print(f"  ╚══════════════════════════════════════════════╝")
    print(f"{END}")
    
    # Check service
    if not check_service():
        print(f"{RED}❌ Backend not running on {API}{END}")
        print(f"   Start with: cd ~/projects/zero-employee-studio/backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload")
        sys.exit(1)
    print(f"{GREEN}✅ Backend running on {API}{END}")
    
    # Parse args
    if "--list" in sys.argv:
        show_agent_stats()
        return
    
    quick = "--quick" in sys.argv
    
    # Show agent stats first
    show_agent_stats()
    
    # Run the workflow
    print_header("🚀 LAUNCHING AUTONOMOUS WORKFLOW")
    
    briefs = [
        (
            "I'm opening a French bakery called Boulangerie Martin. Need a complete website with menu, about page, and online ordering. Also need a logo and social media presence. Budget around $1000.",
            "Boulangerie Martin",
            "contact@boulangerie-martin.fr"
        ),
    ]
    
    if quick:
        brief = "French bakery needs website, logo, social media."
        client = "Boulangerie Martin"
        email = "contact@boulangerie-martin.fr"
    else:
        brief, client, email = briefs[0]
    
    print(f"\n{YELLOW}📝 Triggering autonomous workflow...{END}")
    print(f"   Agents involved: Intake → Template → Pricing → Stripe → Procurement → Brand → Content → Composer → Social → Delivery → Finance → Invoice")
    print(f"   LLM: Nemotron 3 Ultra 🤖")
    print(f"   Humans: 0 👤❌")
    print()
    
    start = time.time()
    result = run_workflow(brief, client, email)
    elapsed = time.time() - start
    
    if result:
        print(f"{GREEN}⏱️ Delivery time: {elapsed:.1f}s{END}")
        show_workflow_result(result)
        
        # Show final agent stats
        print_header("📊 POST-DELIVERY AGENT STATUS")
        show_agent_stats()
    
    print(f"\n{CYAN}{BOLD}✨ Demo complete!{END}")
    print(f"   Check the website: http://localhost:5173/")
    print(f"   Check the dashboard: http://localhost:5173/admin")
    print(f"   API docs: http://localhost:8000/docs")
    print()


if __name__ == "__main__":
    main()
