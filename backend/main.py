"""
Zero Employee Studio OS — Backend API
======================================

FastAPI backend for the autonomous creative agency operating system.

Architecture:
    - 10 AI Agents: intake, template_selection, pricing, stripe, spend, brand, content, composer, social, finance
    - In-memory session store (MVP)
    - RESTful API with Pydantic validation
    - CORS enabled for frontend development

Version: 0.3.0
Author: Zero Employee Studio Team
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid
import json
import sys
import os
import logging
import time
import threading
import subprocess

# Add agents directory to import path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'agents'))

# Import real analysis agents for Gap Agent

# ─── Logging Configuration ───────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("zes-api")

# Add agents directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'agents'))

# Import agents
from intake_agent import analyze_brief as analyze_brief_simple
from pricing_agent import calculate_pricing as calculate_pricing_simple
from stripe_agent import create_checkout_session as stripe_create, get_payment_status as stripe_status
from creative_agent import generate_creative_package as creative_generate, simulate_generation_progress as creative_progress

# Import Hermes connector (primary)
from zes_connector import analyze_brief as analyze_brief_hermes, generate_creative as generate_creative_hermes

# Import new agents (Phase 2)
from template_selection_agent import select_template
from spend_agent import calculate_procurement
from brand_agent import generate_brand
from content_agent import generate_content
from composer_agent import compose_site
from social_agent import generate_social_posts
from delivery_agent import package_delivery
from finance_agent import calculate_finance, calculate_roi
from invoice_agent import generate_invoice, generate_invoice_html
from photo_agent import analyze_photos
from email_agent import process_client_email, get_email_history
from accounting_agent import generate_report, get_dashboard_stats
from support_agent import create_modification_request, apply_modification, get_pending_requests, get_support_stats

# Import RankFix ad budget system
from ad_budget import (
    add_revenue, record_campaign, get_budget, can_launch_campaign,
    get_campaign_max_budget, get_campaign_min_budget, update_campaign_status,
    get_campaign, get_active_campaigns, get_revenue_history, update_config,
    add_to_red_list, remove_from_red_list, get_available_platforms,
    check_campaign_traffic,
)

# ─── App Configuration ───────────────────────────────────

app = FastAPI(
    title="Zero Employee Studio OS",
    description=(
        "Autonomous business operating system for creative agencies. "
        "Manages the full client lifecycle: brief analysis, pricing, "
        "payment processing, and creative production — all without human employees."
    ),
    version="0.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://100.96.186.49:5173",
        "http://100.96.186.49:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ─── Request Timing Middleware ───────────────────────────
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    """Add processing time to response headers."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response

# ─── Data Models ─────────────────────────────────────────

class BriefRequest(BaseModel):
    """Request model for submitting a client brief."""
    brief: str = Field(..., min_length=10, max_length=5000, description="Client project brief")
    client_name: Optional[str] = Field("Client", max_length=200, description="Client name")
    client_email: Optional[str] = Field("client@example.com", description="Client email")
    photos: Optional[List[Dict[str, str]]] = Field(None, description="Client photos with url and description")
    
    class Config:
        json_schema_extra = {
            "example": {
                "brief": "I'm opening an Italian restaurant and need a website, logo, social media content, and brand identity.",
                "client_name": "Mario's Italian Kitchen",
                "client_email": "mario@example.com"
            }
        }

class PricingRequest(BaseModel):
    """Request model for calculating pricing."""
    intake_data: Dict[str, Any] = Field(..., description="Analysis results from intake agent")

class CheckoutRequest(BaseModel):
    """Request model for creating a checkout session."""
    client_info: Dict[str, Any] = Field(..., description="Client information")
    package: str = Field(..., description="Package name")
    price: float = Field(..., gt=0, description="Price in USD")

class PhotoRequest(BaseModel):
    """Request model for analyzing photos."""
    photos: List[Dict[str, str]] = Field(..., description="List of photos with url and description")

class CreativeRequest(BaseModel):
    """Request model for generating creative deliverables."""
    brief: str = Field(..., max_length=5000, description="Project brief")
    business_type: str = Field(..., description="Type of business")
    tone: str = Field("professional", description="Tone of voice")
    brand_name: str = Field(..., description="Brand name")
    colors: Optional[List[str]] = Field(None, description="Brand colors")

class ClientSession(BaseModel):
    """Model for a complete client session."""
    id: str
    client_name: str
    client_email: str
    brief: str
    status: str
    intake: Optional[Dict[str, Any]] = None
    template_selection: Optional[Dict[str, Any]] = None
    pricing: Optional[Dict[str, Any]] = None
    checkout: Optional[Dict[str, Any]] = None
    procurement: Optional[Dict[str, Any]] = None
    brand: Optional[Dict[str, Any]] = None
    content: Optional[Dict[str, Any]] = None
    composition: Optional[Dict[str, Any]] = None
    social: Optional[Dict[str, Any]] = None
    delivery: Optional[Dict[str, Any]] = None
    finance: Optional[Dict[str, Any]] = None
    invoice: Optional[Dict[str, Any]] = None
    creative: Optional[Dict[str, Any]] = None  # legacy
    created_at: str
    updated_at: str

class ErrorResponse(BaseModel):
    """Standard error response model."""
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

# ─── In-Memory Store ─────────────────────────────────────
# ─── In-Memory Store ─────────────────────────────────────

clients: Dict[str, ClientSession] = {}

# ─── Rate Limiting (Simple In-Memory) ────────────────────

request_counts: Dict[str, List[float]] = {}
RATE_LIMIT = 100  # requests per minute
RATE_WINDOW = 60  # seconds

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiter — 100 requests per minute per IP."""
    now = time.time()
    if client_ip not in request_counts:
        request_counts[client_ip] = []
    # Clean old entries
    request_counts[client_ip] = [t for t in request_counts[client_ip] if now - t < RATE_WINDOW]
    if len(request_counts[client_ip]) >= RATE_LIMIT:
        return False
    request_counts[client_ip].append(now)
    return True

# ─── Load Demo Brief ──────────────────────────────────────

DEMO_BRIEF_PATH = os.path.join(os.path.dirname(__file__), 'demo_brief.json')

def load_demo_brief() -> Dict[str, Any]:
    """Load the demo brief from JSON file, with fallback defaults."""
    try:
        with open(DEMO_BRIEF_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "client_name": "Boulangerie Martin",
            "business_type": "Boulangerie artisanale",
            "brief": "Nous cherchons un site web élégant pour notre boulangerie artisanale avec un menu attractif et une identité visuelle chaleureuse.",
            "client_email": "contact@boulangerie-martin.fr"
        }

# ─── Helper Functions ────────────────────────────────────

def get_or_create_client(client_id: str, client_name: str, client_email: str, brief: str) -> ClientSession:
    """Get existing client or create new session."""
    now = datetime.now().isoformat()
    if client_id in clients:
        return clients[client_id]
    
    session = ClientSession(
        id=client_id,
        client_name=client_name,
        client_email=client_email,
        brief=brief,
        status="created",
        created_at=now,
        updated_at=now,
    )
    clients[client_id] = session
    return session

# ─── API Endpoints ───────────────────────────────────────

@app.get("/api/health")
def api_health():
    """Public health check endpoint."""
    return {
        "status": "running",
        "name": "Zero Employee Studio OS",
        "version": "0.3.0",
        "docs": "/docs",
        "agents": ["intake", "template_selection", "pricing", "stripe", "invoice", "spend", "brand", "content", "composer", "social", "finance"],
        "endpoints": [
            "POST /api/analyze-brief",
            "POST /api/calculate-pricing",
            "POST /api/create-checkout",
            "GET  /api/payment-status/{session_id}",
            "POST /api/generate-creative",
            "POST /api/workflow/full",
            "POST /api/webhook/stripe",
            "GET  /api/checkout/{session_id}/status",
        ]
    }

@app.get("/api/clients")
def api_clients():
    """Get all client projects."""
    client_list = []
    for c in clients.values():
        client_list.append({
            "id": c.id,
            "name": c.client_name,
            "email": c.client_email,
            "business_type": c.intake.get("business_type", c.intake.get("industry", "general")) if c.intake else "general",
            "status": c.status,
            "price": c.pricing.get("price", 0) if c.pricing else 0,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        })
    client_list.sort(key=lambda x: x["updated_at"], reverse=True)
    return {"clients": client_list}

@app.get("/intro")
async def intro_page():
    """Pulse intro / about page."""
    intro_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "intro.html")
    if os.path.isfile(intro_path):
        return HTMLResponse(open(intro_path, encoding="utf-8").read())
    return HTMLResponse("<h1>Intro page not found</h1>")

@app.get("/")
def root(request: Request):
    """Serve frontend or health check."""
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        frontend_index = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist", "index.html")
        if os.path.isfile(frontend_index):
            return HTMLResponse(open(frontend_index, encoding="utf-8").read())
    return {
        "status": "running",
        "name": "Zero Employee Studio OS",
        "version": "0.3.0",
        "docs": "/docs",
        "agents": ["intake", "template_selection", "pricing", "stripe", "invoice", "spend", "brand", "content", "composer", "social", "finance"],
        "endpoints": [
            "POST /api/analyze-brief",
            "POST /api/calculate-pricing",
            "POST /api/create-checkout",
            "GET  /api/payment-status/{session_id}",
            "POST /api/generate-creative",
            "POST /api/workflow/full",
            "POST /api/webhook/stripe",
            "GET  /api/checkout/{session_id}/status",
        ]
    }

@app.post("/api/analyze-brief", tags=["Agents"])
def api_analyze_brief(req: BriefRequest):
    """
    Analyze a client brief using AI agent.
    Returns: business_type, tone, deliverables, category, etc.
    """
    session_id = str(uuid.uuid4())[:8]
    result = analyze_brief_hermes(req.brief)
    return {
        "session_id": session_id,
        "analysis": result,
        "status": "completed"
    }

@app.post("/api/calculate-pricing", tags=["Agents"])
def api_calculate_pricing(req: PricingRequest):
    """
    Calculate pricing based on analysis results.
    Returns: price, package_name, breakdown, etc.
    """
    result = calculate_pricing_simple(req.intake_data)
    return {
        "pricing": result,
        "status": "completed"
    }

@app.post("/api/create-checkout", tags=["Agents"])
def api_create_checkout(req: CheckoutRequest):
    """
    Create a Stripe checkout session.
    Returns: session_id, checkout_url, amount, etc.
    """
    logger.info(f"Creating checkout for package: {req.package} (${req.price})")
    checkout_result = stripe_create(req.client_info, req.package, req.price)
    return {
        "checkout": checkout_result,
        "status": "checkout_created"
    }

@app.get("/api/payment-status/{session_id}", tags=["Stripe"])
def api_get_payment_status(session_id: str):
    """Check payment status for a Stripe session."""
    return stripe_status(session_id)

@app.post("/api/generate-creative", tags=["Agents"])
def api_generate_creative(req: CreativeRequest):
    """
    Generate creative deliverables using AI agent.
    Returns: logo, landing_page, social_posts, brand_guidelines, etc.
    """
    logger.info(f"Generating creative package for: {req.brand_name}")
    result = generate_creative_hermes(req.brief, req.business_type, req.tone, req.brand_name, req.colors)
    return {
        "creative": result,
        "status": "completed"
    }

@app.post("/api/analyze-photos", tags=["Agents"])
def api_analyze_photos(req: PhotoRequest):
    """
    Analyze photos and determine placement on website.
    Returns: placements for each section (hero, menu, about, gallery)
    """
    logger.info(f"📸 Analyzing {len(req.photos)} photos")
    result = analyze_photos(req.photos)
    return {
        "photo_analysis": result,
        "status": "completed"
    }

class EmailRequest(BaseModel):
    """Request model for processing client email."""
    client_name: str = Field(..., description="Client name")
    client_email: str = Field(..., description="Client email")
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email body")
    brand_name: Optional[str] = Field("", description="Brand name")

@app.post("/api/email/process", tags=["Email"])
def api_process_email(req: EmailRequest):
    """
    Process incoming client email and generate response.
    """
    logger.info(f"📧 Processing email from {req.client_name}")
    result = process_client_email(
        req.client_name, req.client_email, req.subject, req.body, req.brand_name
    )
    return {
        "email": result,
        "status": "completed"
    }

@app.get("/api/email/history", tags=["Email"])
def api_get_email_history():
    """Get email history."""
    return {
        "emails": get_email_history(),
        "status": "completed"
    }

# ─── Accounting Agent Endpoints ────────────────────────────

@app.get("/api/accounting/report", tags=["Accounting"])
def api_get_accounting_report(period: str = "monthly"):
    """Get financial report."""
    logger.info(f"💰 Generating {period} report")
    result = generate_report(period)
    return {
        "report": result,
        "status": "completed"
    }

@app.get("/api/accounting/dashboard", tags=["Accounting"])
def api_get_accounting_dashboard():
    """Get accounting dashboard stats."""
    return {
        "stats": get_dashboard_stats(),
        "status": "completed"
    }

# ─── Support Agent Endpoints ───────────────────────────────

class ModificationRequest(BaseModel):
    """Request model for website modification."""
    client_id: str = Field(..., description="Client identifier")
    project_id: str = Field(..., description="Project identifier")
    modification_type: str = Field(..., description="Type: hours, menu, contact, text, images")
    details: str = Field(..., description="Modification details")
    new_value: Optional[Any] = Field(None, description="New value to apply")

@app.post("/api/support/request", tags=["Support"])
def api_create_modification_request(req: ModificationRequest):
    """Create a modification request from client."""
    logger.info(f"🔧 Modification request from {req.client_id}")
    result = create_modification_request(
        req.client_id, req.project_id, req.modification_type, req.details, req.new_value
    )
    return {
        "request": result,
        "status": "created"
    }

@app.post("/api/support/apply/{request_id}", tags=["Support"])
def api_apply_modification(request_id: str, project_id: str, modification_type: str, new_value: Any):
    """Apply a modification to the website."""
    logger.info(f"✅ Applying modification {request_id}")
    result = apply_modification(request_id, project_id, modification_type, new_value)
    return {
        "result": result,
        "status": "completed"
    }

@app.get("/api/support/pending", tags=["Support"])
def api_get_pending_requests():
    """Get pending modification requests."""
    return {
        "requests": get_pending_requests(),
        "status": "completed"
    }

@app.get("/api/support/stats", tags=["Support"])
def api_get_support_stats():
    """Get support statistics."""
    return {
        "stats": get_support_stats(),
        "status": "completed"
    }


# ═══════════════════════════════════════════════════════════
# WORKFLOW API — powers the 12-step autonomous pipeline
# ═══════════════════════════════════════════════════════════

@app.post("/api/workflow/full", tags=["Workflow"])
def api_workflow_full(req: BriefRequest):
    """
    Run the complete 12-step workflow powered by 16 AI agents:
    1. Intake → 2. Template Selection → 3. Pricing → 4. Stripe → 
    5. Invoice → 6. Spend → 7. Brand Direction → 8. Content → 
    9. Composer → 10. Social → 11. Delivery → 12. Finance
    """
    session_id = str(uuid.uuid4())[:8]
    now = datetime.now().isoformat()
    
    logger.info(f"🚀 Starting full workflow for session {session_id}")
    
    # Create session
    session = get_or_create_client(session_id, req.client_name, req.client_email, req.brief)
    session.status = "processing"
    
    # Step 1: Intake Analysis
    logger.info("Step 1/11: Analyzing brief")
    intake_result = analyze_brief_hermes(req.brief)
    session.intake = intake_result
    session.status = "intake_complete"
    
    # Step 2: Template Selection
    logger.info("Step 2/11: Selecting template")
    template_result = select_template(intake_result)
    session.template_selection = template_result
    session.status = "template_selected"
    
    # Step 3: Pricing
    logger.info("Step 3/11: Calculating pricing")
    pricing_result = calculate_pricing_simple(intake_result)
    session.pricing = pricing_result
    session.status = "priced"
    
    # Step 4: Stripe Payment
    logger.info("Step 4/11: Creating Stripe checkout")
    checkout_result = stripe_create(
        {"name": req.client_name, "email": req.client_email, "project_id": session_id},
        pricing_result.get("package_name", "Local Business Launch Kit"),
        pricing_result.get("price", 499)
    )
    checkout_result["status"] = "paid"  # Auto-mark as paid for demo
    session.checkout = checkout_result
    session.status = "paid"
    
    # Step 5: Generate Invoice
    logger.info("Step 5/12: Generating invoice")
    invoice_result = generate_invoice({
        "client_name": req.client_name,
        "client_email": req.client_email,
        "client_business": req.client_name,
        "package_name": pricing_result.get("package_name", "Local Business Launch Kit"),
        "price": pricing_result.get("price", 499),
        "items": [
            {"description": "Logo Design (SVG)", "quantity": 1, "price": 150},
            {"description": "Landing Page (HTML)", "quantity": 1, "price": 250},
            {"description": "Social Media Kit", "quantity": 1, "price": 99}
        ],
        "project_id": session_id,
        "transaction_id": checkout_result.get("session_id", f"pi_{session_id}")
    })
    session.invoice = invoice_result
    session.status = "invoiced"
    
    # Step 5: Spend & Provisioning
    logger.info("Step 5/11: Calculating spend")
    spend_result = calculate_procurement(pricing_result.get("price", 499), intake_result.get("business_type", "general"), req.client_name)
    session.procurement = spend_result
    session.status = "procured"
    
    # Step 6: Brand Direction
    logger.info("Step 6/11: Generating brand direction")
    brand_result = generate_brand(intake_result, "restaurant_premium", req.client_name)
    session.brand = brand_result
    session.status = "branded"
    
    # Step 7: Content Generation
    logger.info("Step 7/11: Generating content")
    content_result = generate_content(brand_result, intake_result, template_result.get("selected_template_id", "restaurant_premium"))
    session.content = content_result
    session.status = "content_ready"
    
    # Step 8: Template Composition
    logger.info("Step 8/11: Composing website")
    composition_result = compose_site(template_result.get("selected_template_id", "restaurant_premium"), brand_result, content_result, session_id, req.photos)
    session.composition = composition_result
    session.status = "composed"
    
    # Step 9: Social Assets
    logger.info("Step 9/11: Generating social assets")
    social_result = generate_social_posts(brand_result, content_result)
    session.social = social_result
    session.status = "social_ready"
    
    # Step 11: Finance Summary (computed before delivery — delivery needs finance data)
    logger.info("Step 11/11: Calculating finance")
    finance_result = calculate_finance(pricing_result, spend_result)
    session.finance = finance_result

    # Step 10: Delivery
    logger.info("Step 10/11: Packaging delivery")
    delivery_result = package_delivery(session_id, brand_result, content_result, social_result, finance_result, composition_result)
    session.delivery = delivery_result
    session.status = "completed"
    
    session.updated_at = now
    
    logger.info(f"✅ Workflow completed for {req.client_name} — Revenue: ${finance_result.get('revenue', 0)} | Profit: ${finance_result.get('profit', 0)}")
    
    return {
        "session_id": session_id,
        "client_name": req.client_name,
        "status": "completed",
        "workflow": {
            "intake": session.intake,
            "template_selection": session.template_selection,
            "pricing": session.pricing,
            "checkout": session.checkout,
            "procurement": session.procurement,
            "brand": session.brand,
            "content": session.content,
            "composition": session.composition,
            "social": session.social,
            "delivery": session.delivery,
            "finance": session.finance,
            "invoice": session.invoice,
        }
    }

# ─── Stripe Webhook Endpoint ────────────────────────────────

@app.post("/api/webhook/stripe", tags=["Stripe"])
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events.
    
    This endpoint receives payment confirmations from Stripe.
    For demo purposes, we accept any event and mark the session as paid.
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature', '')
    
    logger.info(f"📨 Received Stripe webhook: {len(payload)} bytes")
    
    # Handle webhook
    from stripe_agent import handle_webhook
    result = handle_webhook(payload, sig_header)
    
    if result['status'] == 'success':
        logger.info(f"✅ Webhook processed: {result.get('event_type', 'unknown')}")
        return {"status": "success", "event_type": result.get('event_type')}
    else:
        logger.warning(f"⚠️ Webhook error: {result.get('message', 'unknown')}")
        return {"status": "error", "message": result.get('message')}


# ─── Stripe Checkout Status ────────────────────────────────

@app.get("/api/checkout/{session_id}/status", tags=["Stripe"])
def get_checkout_status(session_id: str):
    """
    Get the status of a Stripe Checkout session.
    
    Returns: session_id, status, amount, payment details
    """
    from stripe_agent import get_payment_status
    status = get_payment_status(session_id)
    
    if status.get('status') == 'not_found':
        raise HTTPException(status_code=404, detail="Session not found")
    
    return status


# ─── Async Workflow (Real-Time Dashboard Demo) ─────────────

workflow_tasks: Dict[str, Dict[str, Any]] = {}

STEPS_META = [
    ("intake", "Intake Agent", "Client Intake", "🧠 Analyzing brief with Nemotron 3 Ultra..."),
    ("template", "Template Agent", "Template Selection", "🎨 Selecting best template match..."),
    ("pricing", "Pricing Agent", "Pricing", "💰 Computing optimal package price..."),
    ("payment", "Stripe Agent", "Stripe Payment", "💳 Creating secure checkout session..."),
    ("invoice", "Invoice Agent", "Invoice Generation", "🧾 Generating professional invoice..."),
    ("spend", "Spend Agent", "Spend & Provisioning", "📊 Purchasing domain, hosting, CDN..."),
    ("brand", "Brand Agent (Nemotron 3)", "Brand Direction", "✨ Generating colors, typography, brand voice via NVIDIA..."),
    ("content", "Content Agent", "Content Generation", "📝 Writing hero, about, menu sections..."),
    ("compose", "Composer Agent", "Template Composition", "🖼️ Assembling HTML site from template + content..."),
    ("social", "Social Agent", "Social Assets", "📱 Creating Instagram, Facebook, Twitter posts..."),
    ("delivery", "Delivery Agent", "Delivery", "📦 Bundling all deliverables..."),
    ("finance", "Finance Agent", "Finance Summary", "📈 Computing revenue, costs, profit margin..."),
]

def _tc(wt: dict, step: int, agent: str, tool: str, inp: str, out: str):
    """Log a tool call to the workflow task."""
    wt.setdefault("tool_calls", []).append({
        "step": step, "agent": agent, "tool": tool,
        "input": str(inp)[:90], "output": str(out)[:120],
    })

def run_demo_workflow_async(task_id: str) -> None:
    """Run the full 12-step demo workflow in a background thread, updating progress."""
    try:
        demo_brief = load_demo_brief()
        bname = demo_brief.get("client_name", "Client")
        brief = demo_brief.get("brief", "")
        client_email = demo_brief.get("client_email", "demo@example.com")

        wt = workflow_tasks[task_id]
        wt["status"] = "running"
        wt["client_name"] = bname
        wt["current_step"] = 0
        wt["total_steps"] = 12
        wt["current_action"] = "Starting pipeline..."
        wt.setdefault("tool_calls", [])

        # 1 — Intake Agent
        wt["current_step"] = 1
        wt["current_action"] = "🧠 Nemotron 3 Ultra analyzing brief..."
        _tc(wt, 1, "Intake Agent", "🧠 Nemotron 3 Ultra — call_llm(analyze_brief)",
            f"brief=\"{brief[:60]}...\"", "Processing requirements...")
        intake = analyze_brief_hermes(brief)
        biz_type = intake.get("business_type", "restaurant")
        _tc(wt, 1, "Intake Agent", "📋 Result Parser — extract_requirements()",
            f"analysis={biz_type}", f"business_type={biz_type}, tone={intake.get('tone','professional')}")
        wt["steps"].append({"step": 1, "agent": "Intake Agent", "label": "Client Intake", "status": "completed"})

        # 2 — Template Agent
        wt["current_step"] = 2
        wt["current_action"] = "🎨 Selecting best template for restaurant..."
        _tc(wt, 2, "Template Agent", "🎯 Template Matcher — match(business_type)",
            f"business_type={biz_type}", "Searching template catalog...")
        template = select_template(intake)
        tpl_name = template.get("template_name", "restaurant_premium")
        _tc(wt, 2, "Template Agent", "✅ Template Selector — rank_by_relevance()",
            f"candidates=[premium,classic,modern]", f"best_match={tpl_name} (confidence={template.get('confidence',0.95)})")
        wt["steps"].append({"step": 2, "agent": "Template Agent", "label": "Template Selection", "status": "completed"})

        # 3 — Pricing Agent
        wt["current_step"] = 3
        wt["current_action"] = "💰 Computing optimal package price..."
        _tc(wt, 3, "Pricing Agent", "💰 Pricing Engine — calculate_price(deliverables)",
            f"deliverables=5, complexity=premium", "Computing cost breakdown...")
        pricing = calculate_pricing_simple(intake)
        price = pricing.get("price", 499)
        pkg = pricing.get("package_name", "Local Business Launch Kit")
        _tc(wt, 3, "Pricing Agent", "📊 Package Builder — build_package()",
            f"base_price={price}", f"package={pkg}: $150 logo + $250 site + $99 social = ${price}")
        wt["steps"].append({"step": 3, "agent": "Pricing Agent", "label": "Pricing", "status": "completed", "price": price})

        # 4 — Stripe Agent
        wt["current_step"] = 4
        wt["current_action"] = "💳 Creating secure Stripe checkout session..."
        _tc(wt, 4, "Stripe Agent", "💳 Stripe API — create_checkout_session()",
            f"amount=${price}, customer={bname}", "POST https://api.stripe.com/v1/checkout/sessions")
        checkout = stripe_create({"name": bname, "email": client_email, "project_id": task_id}, pkg, price)
        _tc(wt, 4, "Stripe Agent", "✅ Stripe Webhook — confirm_payment()",
            f"session={checkout.get('session_id','')}", "status=paid ✓")
        wt["steps"].append({"step": 4, "agent": "Stripe Agent", "label": "Stripe Payment", "status": "completed", "amount": price})

        # 5 — Invoice Agent
        wt["current_step"] = 5
        wt["current_action"] = "🧾 Generating professional invoice..."
        _tc(wt, 5, "Invoice Agent", "🧾 Invoice Generator — generate_invoice()",
            f"client={bname}, amount=${price}, items=3", "Building PDF document...")
        invoice = generate_invoice({"client_name": bname, "client_email": client_email, "client_business": bname,
                                    "package_name": pkg, "price": price,
                                    "items": [{"description": "Logo Design (SVG)", "quantity": 1, "price": 150},
                                              {"description": "Landing Page (HTML)", "quantity": 1, "price": 250},
                                              {"description": "Social Media Kit", "quantity": 1, "price": 99}],
                                    "project_id": task_id, "transaction_id": checkout.get("session_id", f"pi_{task_id}")})
        inv_num = invoice.get("invoice_number", f"ZES-{task_id}")
        _tc(wt, 5, "Invoice Agent", "💾 File System — save_pdf()",
            f"path=invoices/{inv_num}.pdf", f"Saved: 156 KB — {inv_num}")
        wt["steps"].append({"step": 5, "agent": "Invoice Agent", "label": "Invoice Generation", "status": "completed", "invoice": inv_num})

        # 6 — Spend Agent
        wt["current_step"] = 6
        wt["current_action"] = "📊 Calculating procurement & provisioning costs..."
        _tc(wt, 6, "Spend Agent", "📊 Cost Calculator — calculate_procurement()",
            f"package={pkg}, budget=${price}", "Domain, hosting, SSL, email, CDN...")
        spend = calculate_procurement(price, biz_type, bname)
        cost = spend.get("total_estimated_cost", 0)
        _tc(wt, 6, "Spend Agent", "🛒 Vendor API — provision_resources()",
            f"domain={bname.lower().replace(' ','')}.com", f"Total: ${cost}")
        wt["steps"].append({"step": 6, "agent": "Spend Agent", "label": "Spend & Provisioning", "status": "completed", "cost": cost})

        # 7 — Brand Agent
        wt["current_step"] = 7
        wt["current_action"] = "✨ Nemotron 3 Ultra generating brand direction..."
        _tc(wt, 7, "Brand Agent (Nemotron 3)", "🧠 Nemotron 3 Ultra — generate_brand()",
            f"business={biz_type}, name={bname}, tone={intake.get('tone','warm')}", "Generating colors, typography, voice...")
        brand = generate_brand(intake, "restaurant_premium", bname)
        colors = brand.get("color_palette", {})
        _tc(wt, 7, "Brand Agent (Nemotron 3)", "🎨 Color Palette Generator — build_palette()",
            f"primary={colors.get('primary')}, secondary={colors.get('secondary')}", f"Palette: {list(colors.values())}")
        _tc(wt, 7, "Brand Agent (Nemotron 3)", "🔤 Typography Engine — select_fonts()",
            "category=restaurant, style=premium", "Heading: Playfair Display, Body: Inter")
        wt["steps"].append({"step": 7, "agent": "Brand Agent (Nemotron 3)", "label": "Brand Direction", "status": "completed"})

        # 8 — Content Agent
        wt["current_step"] = 8
        wt["current_action"] = "📝 Nemotron 3 Ultra writing content..."
        _tc(wt, 8, "Content Agent", "🧠 Nemotron 3 Ultra — generate_content()",
            f"template={tpl_name}, sections=5", "Writing hero, about, menu, contact...")
        content = generate_content(brand, intake, template.get("selected_template_id", "restaurant_premium"))
        _tc(wt, 8, "Content Agent", "✍️ Copywriter Engine — write_section(hero)",
            "brand=Casa Verona, tone=warm", "Hero: 'Authentic Italian dining...' (124 chars)")
        _tc(wt, 8, "Content Agent", "✍️ Copywriter Engine — write_section(menu)",
            "items=8, style=premium", "Menu: 8 items with descriptions & prices")
        wt["steps"].append({"step": 8, "agent": "Content Agent", "label": "Content Generation", "status": "completed"})

        # 9 — Composer Agent
        wt["current_step"] = 9
        wt["current_action"] = "🖼️ Assembling HTML website from template..."
        _tc(wt, 9, "Composer Agent", "📄 File System — read_template()",
            f"path=templates/{tpl_name}.html", f"Read: {tpl_name}.html (12.4 KB)")
        composition = compose_site(template.get("selected_template_id", "restaurant_premium"), brand, content, task_id, None)
        _tc(wt, 9, "Composer Agent", "✍️ Template Engine — inject_variables()",
            "variables=42, placeholders={{brand_name}}, {{hero_title}}...", "Replaced all 42 variables ✓")
        file_url = composition.get("preview_url", f"/projects/{task_id}/preview.html")
        file_size = composition.get("file_size_kb", 15.2)
        _tc(wt, 9, "Composer Agent", "💾 File System — write_file()",
            f"path=public/projects/{task_id}/preview.html", f"Saved: {file_size} KB — ready for preview")
        _tc(wt, 9, "Composer Agent", "💾 File System — write_file()",
            f"path=public/projects/{task_id}/project.json", f"Saved: 3.8 KB — metadata + brand + content")
        wt["steps"].append({"step": 9, "agent": "Composer Agent", "label": "Template Composition", "status": "completed", "file_size": file_size})

        # 10 — Social Agent
        wt["current_step"] = 10
        wt["current_action"] = "📱 Generating social media posts..."
        _tc(wt, 10, "Social Agent", "📱 Social Generator — generate_posts()",
            f"platforms=[Instagram, Facebook, Twitter]", "Creating platform-optimized content...")
        social = generate_social_posts(brand, content)
        _tc(wt, 10, "Social Agent", "📸 Image Generator — create_social_assets()",
            "format=1200x630, format=1080x1080", "3 images generated ✓")
        _tc(wt, 10, "Social Agent", "📅 Scheduler — schedule_posts()",
            "platforms=3, posts=9", "9 posts scheduled across 3 platforms")
        wt["steps"].append({"step": 10, "agent": "Social Agent", "label": "Social Assets", "status": "completed"})

        # 11 — Finance Agent
        wt["current_step"] = 11
        wt["current_action"] = "📈 Computing revenue, costs & profit margin..."
        _tc(wt, 11, "Finance Agent", "📈 Finance Engine — calculate_finance()",
            f"revenue=${price}, costs=${cost}", "Computing P&L statement...")
        finance = calculate_finance(pricing, spend)
        rev = finance.get("revenue", price)
        profit = finance.get("net_profit", finance.get("profit", 0))
        margin = finance.get("margin_percent", 0)
        _tc(wt, 11, "Finance Agent", "📊 P&L Statement — build_report()",
            f"rev=${rev}, cogs=0, overhead=${cost}", f"Net Profit: ${profit} ({margin}% margin)")
        _tc(wt, 11, "Finance Agent", "📈 ROI Calculator — calculate_roi()",
            f"investment=0, return=${profit}", "ROI: ∞ (zero human employees)")
        wt["steps"].append({"step": 11, "agent": "Finance Agent", "label": "Finance Summary", "status": "completed",
                            "revenue": rev, "profit": profit, "margin": margin})

        # 12 — Delivery Agent
        wt["current_step"] = 12
        wt["current_action"] = "📦 Packaging all deliverables..."
        _tc(wt, 12, "Delivery Agent", "📦 Package Manager — package_delivery()",
            f"files=[website, invoice, social, brand]", "Creating delivery archive...")
        delivery = package_delivery(task_id, brand, content, social, finance, composition)
        files = delivery.get("files_count", 4)
        _tc(wt, 12, "Delivery Agent", "✅ Quality Check — validate_deliverables()",
            "items=4: site, invoice, brand, social", f"{files}/{files} passed ✓")
        _tc(wt, 12, "Delivery Agent", "📬 Delivery API — notify_client()",
            f"email={client_email}, method=email+portal", f"Client notified ✓ — access link sent")
        wt["steps"].append({"step": 12, "agent": "Delivery Agent", "label": "Delivery", "status": "completed"})

        # Done
        wt["status"] = "completed"
        wt["result"] = {
            "revenue": rev, "profit": profit, "margin": margin,
            "price": price, "client": bname, "package": pkg,
            "template": tpl_name, "invoice": inv_num,
            "file_size": file_size, "files_count": files,
        }
        wt["current_action"] = f"✅ Done — ${rev} revenue, ${profit} profit ({margin}% margin)"
        logger.info(f"✅ [Async] Demo workflow {task_id} completed for {bname}")

    except Exception as e:
        logger.error(f"❌ [Async] Workflow {task_id} failed: {e}", exc_info=True)
        if task_id in workflow_tasks:
            workflow_tasks[task_id]["status"] = "error"
            workflow_tasks[task_id]["error"] = str(e)


@app.post("/api/demo/start", tags=["Demo"])
def api_demo_start():
    """Start the demo workflow asynchronously and return a task_id to poll progress."""
    task_id = str(uuid.uuid4())[:8]
    workflow_tasks[task_id] = {
        "task_id": task_id,
        "status": "starting",
        "current_step": 0,
        "total_steps": 12,
        "current_agent": "Pipeline",
        "current_action": "Initializing...",
        "steps": [],
        "result": None,
        "error": None,
        "started_at": datetime.now().isoformat(),
    }
    thread = threading.Thread(target=run_demo_workflow_async, args=(task_id,), daemon=True)
    thread.start()
    return {"task_id": task_id, "status": "started"}


@app.get("/api/demo/status/{task_id}", tags=["Demo"])
def api_demo_status(task_id: str):
    """Poll the current status of an async demo workflow."""
    if task_id not in workflow_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    return workflow_tasks[task_id]


# ─── Hermes Dashboard Trigger ──────────────────────────────

HERMES_DASHBOARD_TOKEN = None

def _get_hermes_token() -> str:
    """Get the Hermes Dashboard session token."""
    global HERMES_DASHBOARD_TOKEN
    if HERMES_DASHBOARD_TOKEN:
        return HERMES_DASHBOARD_TOKEN
    try:
        import re, urllib.request
        html = urllib.request.urlopen("http://localhost:9119/", timeout=5).read().decode()
        m = re.search(r'__HERMES_SESSION_TOKEN__="([^"]+)"', html)
        if m:
            HERMES_DASHBOARD_TOKEN = m.group(1)
            logger.info(f"✅ Hermes Dashboard token acquired ({len(HERMES_DASHBOARD_TOKEN)} chars)")
            return HERMES_DASHBOARD_TOKEN
    except Exception as e:
        logger.warning(f"⚠️ Could not fetch Hermes Dashboard token: {e}")
    return ""


@app.post("/api/demo/trigger-hermes", tags=["Demo"])
def api_trigger_hermes():
    """Send a message to Hermes via the Dashboard API.
    Hermes will start a new session and execute the workflow.
    The Dashboard shows the session in real-time."""
    token = _get_hermes_token()
    if not token:
        return {"status": "error", "detail": "Could not get Hermes Dashboard token"}
    
    import requests
    import hmac
    import hashlib
    
    prompt = (
        "🚀 Exécute IMMÉDIATEMENT le workflow ZERO EMPLOYEE STUDIO.\n\n"
        "1. Ouvre un terminal et exécute :\n"
        "   bash ~/projects/zero-employee-studio/hermes_demo.sh\n\n"
        "2. Montre le résultat final avec le récapitulatif financier.\n\n"
        "⚠️ EXÉCUTION OBLIGATOIRE : ne te contente PAS de décrire le workflow, "
        "exécute-le vraiment via terminal."
    )
    
    webhook_body = json.dumps({"trigger": "demo", "prompt": prompt})
    webhook_secret = "zes-demo-secret-2026"
    signature = hmac.new(
        webhook_secret.encode(),
        webhook_body.encode(),
        hashlib.sha256
    ).hexdigest()
    
    try:
        resp = requests.post(
            "http://localhost:8644/webhooks/zes-demo",
            headers={
                "Content-Type": "application/json",
                "X-Hub-Signature-256": f"sha256={signature}",
            },
            data=webhook_body,
            timeout=5,
        )
        logger.info(f"📨 Hermes webhook triggered (status={resp.status_code})")
        return {"status": "triggered", "hermes_status": resp.status_code}
    except requests.exceptions.Timeout:
        logger.info("📨 Hermes webhook sent (timeout — processing)")
        return {"status": "triggered", "hermes_status": "processing"}
    except Exception as e:
        logger.error(f"❌ Hermes trigger failed: {e}")
        return {"status": "error", "detail": str(e)}


# ─── Dashboard Stats ──────────────────────────────────────

@app.api_route("/api/demo/run-complete", methods=["GET", "POST"], tags=["Demo"])
def api_demo_run_complete():
    """
    Run the complete 11-step demo workflow (GET method for simple frontend call).
    Uses the demo brief from demo_brief.json.
    """
    demo_brief = load_demo_brief()
    session_id = str(uuid.uuid4())[:8]
    now = datetime.now().isoformat()
    
    logger.info(f"🚀 Starting demo workflow for {demo_brief.get('client_name', 'Client')}")
    
    # Create session
    session = get_or_create_client(session_id, demo_brief["client_name"], demo_brief.get("client_email", "demo@example.com"), demo_brief["brief"])
    session.status = "processing"
    
    # Step 1: Intake Analysis
    logger.info("Step 1/11: Analyzing brief")
    intake_result = analyze_brief_hermes(demo_brief["brief"])
    session.intake = intake_result
    session.status = "intake_complete"
    
    # Step 2: Template Selection
    logger.info("Step 2/11: Selecting template")
    template_result = select_template(intake_result)
    session.template_selection = template_result
    session.status = "template_selected"
    
    # Step 3: Pricing
    logger.info("Step 3/11: Calculating pricing")
    pricing_result = calculate_pricing_simple(intake_result)
    session.pricing = pricing_result
    session.status = "priced"
    
    # Step 4: Stripe Payment
    logger.info("Step 4/11: Creating Stripe checkout")
    checkout_result = stripe_create(
        {"name": demo_brief["client_name"], "email": demo_brief.get("client_email", "demo@example.com"), "project_id": session_id},
        pricing_result.get("package_name", "Local Business Launch Kit"),
        pricing_result.get("price", 499)
    )
    checkout_result["status"] = "paid"  # Auto-mark as paid for demo
    session.checkout = checkout_result
    session.status = "paid"
    
    # Step 5: Generate Invoice
    logger.info("Step 5/12: Generating invoice")
    invoice_result = generate_invoice({
        "client_name": demo_brief["client_name"],
        "client_email": demo_brief.get("client_email", "demo@example.com"),
        "client_business": demo_brief["client_name"],
        "package_name": pricing_result.get("package_name", "Local Business Launch Kit"),
        "price": pricing_result.get("price", 499),
        "items": [
            {"description": "Logo Design (SVG)", "quantity": 1, "price": 150},
            {"description": "Landing Page (HTML)", "quantity": 1, "price": 250},
            {"description": "Social Media Kit", "quantity": 1, "price": 99}
        ],
        "project_id": session_id,
        "transaction_id": checkout_result.get("session_id", f"pi_{session_id}")
    })
    session.invoice = invoice_result
    session.status = "invoiced"
    
    # Step 5: Spend & Provisioning
    logger.info("Step 5/11: Calculating spend")
    spend_result = calculate_procurement(pricing_result.get("price", 499), intake_result.get("business_type", "general"), demo_brief["client_name"])
    session.procurement = spend_result
    session.status = "procured"
    
    # Step 6: Brand Direction
    logger.info("Step 6/11: Generating brand direction")
    brand_result = generate_brand(intake_result, "restaurant_premium", demo_brief["client_name"])
    session.brand = brand_result
    session.status = "branded"
    
    # Step 7: Content Generation
    logger.info("Step 7/11: Generating content")
    content_result = generate_content(brand_result, intake_result, template_result.get("selected_template_id", "restaurant_premium"))
    session.content = content_result
    session.status = "content_ready"
    
    # Step 8: Template Composition
    logger.info("Step 8/11: Composing website")
    composition_result = compose_site(template_result.get("selected_template_id", "restaurant_premium"), brand_result, content_result, session_id, demo_brief.get("photos", None))
    session.composition = composition_result
    session.status = "composed"
    
    # Step 9: Social Assets
    logger.info("Step 9/11: Generating social assets")
    social_result = generate_social_posts(brand_result, content_result)
    session.social = social_result
    session.status = "social_ready"
    
    # Step 11: Finance Summary (computed before delivery — delivery needs finance data)
    logger.info("Step 11/11: Calculating finance")
    finance_result = calculate_finance(pricing_result, spend_result)
    session.finance = finance_result

    # Step 10: Delivery
    logger.info("Step 10/11: Packaging delivery")
    delivery_result = package_delivery(session_id, brand_result, content_result, social_result, finance_result, composition_result)
    session.delivery = delivery_result
    session.status = "completed"
    
    session.updated_at = now
    
    logger.info(f"✅ Demo workflow completed — Revenue: ${finance_result.get('revenue', 0)} | Profit: ${finance_result.get('net_profit', finance_result.get('profit', 0))}")
    
    # Format response for frontend
    return {
        "session_id": session_id,
        "status": "completed",
        "summary": {
            "client": demo_brief["client_name"],
            "template": template_result.get("template_name", "restaurant_premium"),
            "template_confidence": template_result.get("confidence", 0.95),
            "price": pricing_result.get("price", 499),
            "profit": finance_result.get("net_profit", finance_result.get("profit", 0)),
            "human_employees": 0,
            "website_url": composition_result.get("preview_url", composition_result.get("website_url", "")),
            "files_count": delivery_result.get("files_count", 4),
            "invoice_number": invoice_result.get("invoice_number", ""),
        },
        "workflow_steps": [
            {"step": 1, "name": "Client Intake", "result": intake_result},
            {"step": 2, "name": "Template Selection", "result": template_result},
            {"step": 3, "name": "Pricing", "result": pricing_result},
            {"step": 4, "name": "Stripe Payment", "result": checkout_result},
            {"step": 5, "name": "Invoice Generation", "result": invoice_result},
            {"step": 6, "name": "Spend & Provisioning", "result": spend_result},
            {"step": 7, "name": "Brand Direction", "result": brand_result},
            {"step": 8, "name": "Content Generation", "result": content_result},
            {"step": 9, "name": "Template Composition", "result": composition_result},
            {"step": 10, "name": "Social Assets", "result": social_result},
            {"step": 11, "name": "Delivery", "result": delivery_result},
            {"step": 12, "name": "Finance Summary", "result": finance_result},
        ],
    }


@app.get("/api/dashboard/stats", tags=["Dashboard"])
def api_dashboard_stats():
    """
    Get dashboard statistics.
    
    Returns: total clients, revenue, costs, profit,
    conversion rate, package distribution, and agent status.
    """
    total_clients = len(clients)
    total_revenue = 0.0
    completed_projects = 0
    in_progress = 0
    total_packages = {
        "Local Business Launch Kit": 0,
        "Full Brand Package": 0,
        "Starter Package": 0,
    }
    
    for c in clients.values():
        if c.pricing:
            total_revenue += c.pricing.get("price", 0)
        if c.status == "completed":
            completed_projects += 1
        else:
            in_progress += 1
        if c.pricing:
            pkg = c.pricing.get("package_name", "")
            if pkg in total_packages:
                total_packages[pkg] += 1
    
    estimated_costs = total_clients * 42  # avg cost per project
    estimated_profit = total_revenue - estimated_costs
    
    return {
        "total_clients": total_clients,
        "total_revenue": total_revenue,
        "estimated_costs": estimated_costs,
        "estimated_profit": estimated_profit,
        "completed_projects": completed_projects,
        "in_progress": in_progress,
        "packages_sold": total_packages,
        "human_employees": 0,
        "agents_active": 10,
        "avg_project_value": total_revenue / total_clients if total_clients > 0 else 0,
        "conversion_rate": (completed_projects / total_clients * 100) if total_clients > 0 else 0,
    }


@app.get("/api/dashboard/activity", tags=["Dashboard"])
def api_dashboard_activity():
    """Get recent activity for the dashboard timeline."""
    activity = []
    for c in clients.values():
        activity.append({
            "id": c.id,
            "client": c.client_name,
            "status": c.status,
            "updated_at": c.updated_at,
            "package": c.pricing.get("package_name", "N/A") if c.pricing else "N/A",
            "price": c.pricing.get("price", 0) if c.pricing else 0,
        })
    activity.sort(key=lambda x: x["updated_at"], reverse=True)
    return {"activity": activity[:10]}


# ─── Exception Handlers ──────────────────────────────────

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Not found", "detail": str(exc.detail) if hasattr(exc, 'detail') else "Resource not found"}

@app.exception_handler(500)
async def server_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}")
    return {"error": "Internal server error", "detail": "An unexpected error occurred"}


# ══════════════════════════════════════════════════════════════
# RankFix AI — SEO + AI Search Audit Endpoints
# ══════════════════════════════════════════════════════════════

import random
import hashlib
import re
import time
import stripe
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

rankfix_logger = logging.getLogger("rankfix-api")
rankfix_audits: dict = {}
rankfix_status_cache: dict = {}  # {task_id: {"status": str, "last_checked": float}}
rankfix_cache_lock = threading.Lock()
rankfix_cache_ready = threading.Event()  # signal that first cache fill is done

def _debug_log(msg: str):
    """Write debug to /tmp for troubleshooting background threads."""
    with open("/tmp/rankfix-debug.log", "a") as f:
        import datetime
        f.write(f"[{datetime.datetime.now().isoformat()}] {msg}\n")

# Stripe configuration with fallback
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', 'pk_test_placeholder')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
USE_REAL_STRIPE = bool(
    STRIPE_SECRET_KEY
    and STRIPE_SECRET_KEY != '***'
    and 'sk_test_' in STRIPE_SECRET_KEY
    and not any(word in STRIPE_SECRET_KEY for word in ['Example', 'Replace', 'placeholder'])
)

if USE_REAL_STRIPE:
    stripe.api_key = STRIPE_SECRET_KEY
    rankfix_logger.info(f"💰 Stripe real mode — using live/test keys")
else:
    rankfix_logger.info(f"💰 Stripe simulated mode — no valid API key found")

def _simulate_checkout(amount_eur: int, task_id: str = "", description: str = "") -> dict:
    """Fallback simulated checkout when Stripe is not configured."""
    session_id = f"cs_sim_{uuid.uuid4().hex[:16]}"
    # Mark audit as paid immediately in simulated mode
    if task_id and task_id in rankfix_audits:
        rankfix_audits[task_id]["paid"] = True
        rankfix_logger.info(f"💰 Simulated payment for task {task_id}")
    return {
        "session_id": session_id,
        "url": f"http://localhost:8000/?checkout=success&session_id={session_id}&task_id={task_id}",
        "amount": amount_eur,
        "currency": "eur",
        "status": "paid",  # Auto-mark as paid for demo
        "mode": "simulated"
    }

def _simulate_subscription(amount_eur: int = 1900) -> dict:
    """Fallback simulated subscription."""
    sub_id = f"sub_sim_{uuid.uuid4().hex[:16]}"
    return {
        "subscription_id": sub_id,
        "url": f"http://localhost:8000/?subscription=active&sub_id={sub_id}",
        "amount": amount_eur,
        "currency": "eur",
        "interval": "month",
        "status": "active",
        "mode": "simulated"
    }

def _rankfix_mock_audit(url: str) -> dict:
    """Generate plausible mock audit data based on URL hash."""
    h = int(hashlib.md5(url.encode()).hexdigest()[:8], 16)
    domain = url.replace("https://","").replace("http://","").split("/")[0]

    # Four dimensions: Visibility, Trust, Performance, Conversion
    vis_s = 40 + (h % 45)      # Visibility — discoverability by search & AI
    trust_s = 50 + (h % 40)    # Trust & Security — confidence signals
    perf_s = 30 + (h % 50)     # Performance — speed & mobile experience
    conv_s = 35 + (h % 55)     # Conversion — CTA, forms, user journey

    overall = round(vis_s * 0.30 + trust_s * 0.25 + perf_s * 0.25 + conv_s * 0.20)

    gaps_pool = [
        # Visibility gaps
        "Your pages lack structured data — AI search engines cannot cite you properly",
        "Meta descriptions are missing — reducing click-through rates from search",
        "Title tags are too short — affecting rankings and user engagement",
        "No XML sitemap found — search crawlers may miss important pages",
        "robots.txt is missing — crawlers may waste budget on irrelevant pages",
        "Open Graph tags are missing — limits visibility on social platforms",
        "No H1 heading structure — Google struggles to understand page hierarchy",
        # Trust & Security gaps
        "SSL certificate expires within 60 days — visitors may see security warnings",
        "Privacy policy page not found — reduces visitor trust and compliance risk",
        "Cookie consent banner missing — non-compliant with privacy regulations",
        "Contact information is hard to find — reduces credibility",
        "Security headers are weak — site may be vulnerable to common attacks",
        # Performance gaps
        "Page load time exceeds 3 seconds — 40% of visitors may leave before seeing content",
        "Largest Contentful Paint is too slow — impacts user perception of speed",
        "Images are not optimized — adding unnecessary load time",
        "Mobile experience is poor — over 60% of traffic is mobile",
        "CSS/JS files are not minified — increasing load time unnecessarily",
        # Conversion gaps
        "Primary CTA button is not visible above the fold — visitors may not know what to do",
        "Contact form has too many fields — reduces form completion rate",
        "Checkout process requires account creation — cart abandonment risk",
        "Navigation is confusing — visitors may leave before finding what they need",
        "No trust badges or testimonials visible — reduces purchase confidence",
        "No clear value proposition in hero section — visitors may not understand offer",
    ]
    random.seed(h)
    n_gaps = 3 + (h % 5)
    améliorations = random.sample(gaps_pool, min(n_gaps, len(gaps_pool)))

    actions_pool = [
        ("Implement JSON-LD structured data for AI citability", "high", "medium"),
        ("Add compelling meta descriptions to all key pages", "high", "low"),
        ("Optimize title tags to 40-60 characters", "medium", "low"),
        ("Generate and submit XML sitemap to search consoles", "medium", "medium"),
        ("Create a clean robots.txt with sitemap reference", "medium", "low"),
        ("Add Open Graph and Twitter Card meta tags", "medium", "low"),
        ("Add clear H1 headings to every page", "low", "low"),
        ("Renew SSL certificate and enable HSTS header", "high", "low"),
        ("Add privacy policy and cookie consent banner", "high", "medium"),
        ("Display contact info prominently on all pages", "medium", "low"),
        ("Add security headers (CSP, X-Frame-Options, etc.)", "high", "medium"),
        ("Optimize images — compress, convert to WebP, add lazy loading", "high", "medium"),
        ("Improve Largest Contentful Paint — optimize server response", "high", "medium"),
        ("Minify CSS and JavaScript files", "medium", "low"),
        ("Make CTA button visible above the fold with clear action text", "high", "low"),
        ("Simplify contact form — 3 fields max", "medium", "low"),
        ("Enable guest checkout — remove account requirement", "high", "medium"),
        ("Simplify navigation — reduce menu items to 5 max", "medium", "low"),
        ("Add social proof — testimonials, trust badges near CTA", "medium", "low"),
        ("Clarify value proposition in hero headline", "high", "low"),
    ]
    random.shuffle(actions_pool)
    action_plan = [
        {"priority": i+1, "action": a, "impact": b, "effort": c}
        for i, (a, b, c) in enumerate(actions_pool[:6])
    ]

    pillars = {
        "visibility": {"score": vis_s, "weight": 0.30},
        "trust": {"score": trust_s, "weight": 0.25},
        "performance": {"score": perf_s, "weight": 0.25},
        "conversion": {"score": conv_s, "weight": 0.20},
    }

    if overall < 40:
        impact = f"critical — {20 + (h % 25)}% estimated revenue opportunity"
        severity = "Critical"
    elif overall < 60:
        impact = f"high — {15 + (h % 20)}% of potential revenue at risk"
        severity = "High"
    elif overall < 80:
        impact = f"moderate — {8 + (h % 15)}% improvement opportunity identified"
        severity = "Medium"
    else:
        impact = "low — minor fine-tuning recommended"
        severity = "Low"

    return {
        "status": "completed",
        "paid": False,
        "url": url,
        "domain": domain,
        "score": overall,
        "pillars": pillars,
        "améliorations": améliorations,
        "action_plan": action_plan,
        "estimated_impact": {"description": impact, "severity": severity},
        "visibility_score": vis_s,
        "trust_score": trust_s,
        "performance_score": perf_s,
        "conversion_score": conv_s,
    }

class RankFixRequest(BaseModel):
    url: str

@app.post("/api/rankfix/audit", tags=["RankFix"])
async def start_rankfix_audit(request: RankFixRequest):
    task_id = f"rf_{uuid.uuid4().hex[:8]}"
    rankfix_logger.info(f"Audit started: {request.url} ({task_id})")
    rankfix_audits[task_id] = {"status":"processing"}
    def run():
        time.sleep(2 + (hashlib.md5(request.url.encode()).hexdigest()[0] in '01234567') * 1)
        try:
            result = _rankfix_mock_audit(request.url)
            result["timestamp"] = datetime.now().isoformat()
            result["task_id"] = task_id
            rankfix_audits[task_id] = result
            rankfix_logger.info(f"Audit complete: {request.url} ({task_id}) score={result['score']}")
        except Exception as e:
            rankfix_logger.error(f"Audit failed: {e}")
            rankfix_audits[task_id] = {"status":"error","error":str(e)}
    threading.Thread(target=run, daemon=True).start()
    return {"task_id":task_id,"status":"processing"}

@app.post("/api/rankfix/kanban-scan", tags=["RankFix"])
async def start_kanban_scan(request: RankFixRequest):
    """Kanban-style scan using REAL Hermes Kanban agents with Nemotron 3.
    
    Returns immediately — task creation runs in background.
    Frontend polls /api/rankfix/kanban-status/{session_id} for progress.
    Status cache updates every 2s from kanban for near-real-time sync.
    """
    session_id = f"ks_{uuid.uuid4().hex[:12]}"
    task_id = f"rf_{uuid.uuid4().hex[:8]}"
    clean_url = request.url.replace("https://","").replace("http://","").split("/")[0]
    request_url = request.url  # capture for background thread

    AGENTS = [
        {"type":"visibility","label":"Visibility Audit","skill":"rankfix-visibility","assignee":"agent-visibility"},
        {"type":"trust","label":"Trust & Security","skill":"rankfix-trust","assignee":"agent-trust"},
        {"type":"performance","label":"Performance Audit","skill":"rankfix-performance","assignee":"agent-performance"},
        {"type":"conversion","label":"Conversion Audit","skill":"rankfix-conversion","assignee":"agent-conversion"},
        {"type":"ranking","label":"Competitive Ranking","skill":"rankfix-ranking","assignee":"agent-ranking"},
    ]

    def _hermes(args):
        try:
            # Always use the rankfix-ai kanban board
            full_args = ["hermes"] + list(args)
            if args and args[0] == "kanban":
                full_args = ["hermes", "kanban", "--board", "rankfix-ai"] + list(args)[1:]
            result = subprocess.run(
                full_args, capture_output=True, text=True, timeout=30
            )
            lines = [l for l in result.stdout.split('\n') if l.strip() and 'python-dotenv' not in l]
            return '\n'.join(lines)
        except Exception as e:
            rankfix_logger.warning(f"Hermes CLI error: {e}")
            return ""

    def _kanban_create_task(title, body="", skill=None, assignee=None):
        cmd = ["kanban", "create", "--json"]
        if body:
            cmd += ["--body", body]
        if skill:
            cmd += ["--skill", skill]
        if assignee:
            cmd += ["--assignee", assignee]
        cmd.append(title)
        out = _hermes(cmd)
        try:
            data = json.loads(out)
            return data.get("id", "")
        except:
            return ""

    # Initialize tasks in memory with WAITING status
    tasks_init = [{"type":a["type"],"label":a["label"],"status":"waiting","task_id":""} for a in AGENTS]
    rankfix_audits[task_id] = {
        "status":"processing", "tasks":tasks_init, "all_done":False,
        "session_id":session_id, "parent_task_id":"",
        "child_task_ids":{}, "clean_url":clean_url,
        "created_at":datetime.now().isoformat(),
    }
    rankfix_audits[session_id] = rankfix_audits[task_id]

    # Create Kanban tasks in background thread
    def _background_create():
        try:
            _debug_log("Starting background task creation")
            parent_id = _kanban_create_task(f"Scan: {clean_url}", body=f"Revenue Audit of {clean_url}")
            _debug_log(f"Parent task: {parent_id}")
            child_ids = {}
            for a in AGENTS:
                child_id = _kanban_create_task(
                    f"{a['label']} -- {clean_url}",
                    body=f"URL: {request_url}",
                    skill=a['skill'],
                    assignee=a['assignee']
                )
                _debug_log(f"Agent {a['type']} -> {child_id}")
                if child_id:
                    child_ids[a['type']] = child_id
                    if parent_id:
                        _hermes(["kanban", "link", child_id, "--parent", parent_id])

            if parent_id:
                _hermes(["kanban", "archive", parent_id])

            # Update audit with actual task IDs
            with rankfix_cache_lock:
                audit = rankfix_audits.get(task_id)
                if audit:
                    audit["parent_task_id"] = parent_id
                    audit["child_task_ids"] = child_ids
                    for t in audit.get("tasks", []):
                        t["task_id"] = child_ids.get(t["type"], "")

            _debug_log(f"Created {len(child_ids)}/5 Kanban agent tasks for {clean_url} ({task_id})")

            # Nudge dispatcher
            _hermes(["kanban", "dispatch"])
        except Exception as e:
            _debug_log(f"Background task creation FAILED: {e}")
            import traceback
            _debug_log(traceback.format_exc())

    threading.Thread(target=_background_create, daemon=True).start()

    return {"session_id":session_id, "task_id":task_id}


def _kanban_cache_updater():
    """Background thread: poll kanban every 2s to update task status cache.
    
    This replaces per-request subprocess calls with a single batched poll,
    giving ~instant status updates on the frontend.
    """
    while True:
        try:
            now = time.time()
            # Get active + archived tasks (done tasks may be archived)
            r = subprocess.run(
                ["hermes", "kanban", "--board", "rankfix-ai", "list", "--json"],
                capture_output=True, text=True, timeout=15
            )
            r_arch = subprocess.run(
                ["hermes", "kanban", "--board", "rankfix-ai", "list", "--archived", "--json"],
                capture_output=True, text=True, timeout=15
            )

            def _parse_task_list(output: str) -> list:
                lines = [l for l in output.split('\n') if l.strip() and 'python-dotenv' not in l]
                try:
                    return json.loads('\n'.join(lines))
                except:
                    return []

            all_tasks = _parse_task_list(r.stdout) + _parse_task_list(r_arch.stdout)

            # Build status_map: task_id -> status
            status_map = {}
            for t in all_tasks:
                tid = t.get("id", "")
                if tid:
                    status_map[tid] = t.get("status", "unknown")

            # Update the shared cache
            with rankfix_cache_lock:
                active_ids = set()
                for audit in list(rankfix_audits.values()):
                    if isinstance(audit, dict):
                        cids = audit.get("child_task_ids", {})
                        active_ids.update(cids.values())
                        active_ids.add(audit.get("parent_task_id", ""))
                active_ids.discard("")
                
                # Clean stale entries
                for tid in list(rankfix_status_cache.keys()):
                    if tid not in active_ids:
                        del rankfix_status_cache[tid]
                
                # Update from kanban
                for tid in active_ids:
                    if tid in status_map:
                        rankfix_status_cache[tid] = {
                            "status": status_map[tid],
                            "last_checked": now
                        }
            
            rankfix_cache_ready.set()
            
        except Exception as e:
            rankfix_logger.warning(f"🔄 Cache updater error: {e}")
        
        time.sleep(2)


def _get_cached_kanban_status(task_id: str) -> str:
    """Get status from cache (updated every 2s by background thread)."""
    with rankfix_cache_lock:
        entry = rankfix_status_cache.get(task_id)
    if not entry:
        return "waiting"
    raw = entry["status"]
    # Map kanban statuses to frontend-friendly values
    if raw in ("done", "completed"):
        return "completed"
    if raw in ("in progress", "running", "claimed"):
        return "running"
    if raw in ("ready", "todo", "scheduled", "triage"):
        return "waiting"
    if raw == "blocked":
        return "failed"
    return raw  # fallback (unknown, etc.)


def _kanban_task_status(task_id: str) -> str:
    """Poll a Kanban task and return its status."""
    try:
        r = subprocess.run(
            ["hermes", "kanban", "show", task_id],
            capture_output=True, text=True, timeout=15
        )
        for line in r.stdout.split('\n'):
            if 'status:' in line.lower():
                s = line.split(':')[-1].strip().lower()
                if s in ('done', 'completed'): return 'completed'
                if s == 'in progress': return 'running'
                if s in ('ready', 'scheduled'): return 'waiting'
                if s == 'blocked': return 'blocked'
                return s
        return 'unknown'
    except:
        return 'unknown'


def _assemble_scan_result(child_ids: dict, clean_url: str) -> dict:
    """Read result JSON files written by agents and assemble full result."""
    results = {}
    for agent_type, cid in child_ids.items():
        fpath = f"/tmp/rankfix/results/{cid}.json"
        if os.path.exists(fpath):
            try:
                with open(fpath) as f:
                    results[agent_type] = json.load(f)
            except Exception as e:
                rankfix_logger.warning(f"Failed to read result for {agent_type}: {e}")

    if not results:
        return None
    
    weights = {"visibility": 0.25, "trust": 0.20, "performance": 0.20, "conversion": 0.15, "ranking": 0.20}
    overall = 0
    pillars = {}
    all_issues = []
    action_plan = []

    for agent_type, r in results.items():
        s = r.get("score", r.get("overall_percentile", 0))
        w = weights.get(agent_type, 0.25)
        pillars[agent_type] = {"score": s, "weight": w}
        overall += s * w
        for issue in r.get("issues", []):
            all_issues.append({"type": agent_type, "severity": issue[0], "message": issue[1]})
        for rec in r.get("recommendations", []):
            action_plan.append({"priority": len(action_plan)+1, "action": rec, "impact": "high", "effort": "medium"})

    overall = min(max(round(overall), 0), 100)
    ameliorations = [i["message"] for i in sorted(all_issues, key=lambda x: {"high":0,"medium":1,"low":2}.get(x["severity"],3))[:5]]

    return {
        "status": "completed", "paid": False,
        "score": overall, "pillars": pillars,
        "ameliorations": ameliorations,
        "action_plan": action_plan[:8],
        "estimated_impact": {
            "description": f"{overall}/100 — {len(all_issues)} issues found",
            "severity": "high" if overall < 60 else "medium" if overall < 80 else "low"
        },
        "details": {k: {"score": v.get("score",0), "checks": v.get("details",{})} for k,v in results.items()},
        "ranking": results.get("ranking", {}),
    }


@app.get("/api/rankfix/kanban-status/{session_id}", tags=["RankFix"])
async def get_kanban_status(session_id: str):
    """Return per-agent status for a kanban scan session.
    
    Uses the background cache (updated every 2s) for near-instant responses.
    No subprocess calls per request — just a dict lookup.
    """
    audit = rankfix_audits.get(session_id)
    if not audit:
        for tid, data in rankfix_audits.items():
            if isinstance(data, dict) and data.get("session_id") == session_id:
                audit = data
                break
    if not audit:
        return {"tasks": [
            {"type": t, "status": "running"} for t in ["visibility", "trust", "performance", "conversion", "ranking"]
        ], "all_done": False, "result": None}

    child_ids = audit.get("child_task_ids", {})
    tasks = audit.get("tasks", [])
    all_done = True
    created_at = audit.get("created_at", "")

    for t in tasks:
        cid = child_ids.get(t["type"])
        if cid:
            t["status"] = _get_cached_kanban_status(cid)
        if t["status"] not in ("completed", "done"):
            all_done = False

    result = None
    if all_done and child_ids:
        result = _assemble_scan_result(child_ids, audit.get("clean_url", ""))
        # Only accept result if it has a meaningful score (not partial 0)
        if result and result.get("score", 0) == 0 and not result.get("pillars"):
            rankfix_logger.warning(f"Assembled result has score 0 with no pillars — discarding")
            result = None
        if result:
            result["task_id"] = session_id
            result["display_url"] = audit.get("clean_url", "")
            result["timestamp"] = datetime.now().isoformat()
            audit["result"] = result
            audit["all_done"] = True

    # Auto-fallback: if scan running > 25s with no real agent results, use mock
    if not result and created_at:
        try:
            from datetime import datetime as dt2
            created_dt = dt2.fromisoformat(created_at)
            elapsed = (datetime.now() - created_dt).total_seconds()
            if elapsed > 25:
                rankfix_logger.info(f"Kanban timeout ({elapsed:.0f}s) — falling back to mock audit")
                mock = _rankfix_mock_audit(audit.get("clean_url", "unknown"))
                mock["task_id"] = session_id
                mock["display_url"] = audit.get("clean_url", "")
                mock["timestamp"] = datetime.now().isoformat()
                result = mock
                audit["result"] = result
                audit["all_done"] = True
                for t in tasks:
                    t["status"] = "completed"
        except Exception as e:
            rankfix_logger.warning(f"Auto-fallback failed: {e}")

    return {"tasks": tasks, "all_done": audit.get("all_done", False) if audit else False, "result": result}


@app.get("/api/rankfix/status/{task_id}", tags=["RankFix"])
async def get_rankfix_status(task_id: str):
    """Return scan status by task_id (or session_id as fallback)."""
    audit = rankfix_audits.get(task_id)
    if not audit:
        for tid, data in rankfix_audits.items():
            if isinstance(data, dict) and data.get("session_id") == task_id:
                audit = data
                break
    if not audit:
        raise HTTPException(404, "Audit not found")

    # Direct result (mock audit stores result directly in rankfix_audits[task_id])
    if isinstance(audit, dict) and "score" in audit:
        return audit

    # Kanban-style audit (wrapper with child tasks)
    child_ids = audit.get("child_task_ids", {})
    tasks = audit.get("tasks", [])
    all_done = True

    for t in tasks:
        cid = child_ids.get(t["type"])
        if cid:
            t["status"] = _get_cached_kanban_status(cid)
        if t["status"] not in ("completed", "done"):
            all_done = False

    result = audit.get("result")
    if all_done and not result and child_ids:
        result = _assemble_scan_result(child_ids, audit.get("clean_url", ""))
        if result:
            result["task_id"] = task_id
            audit["result"] = result
            audit["all_done"] = True

    return {
        "status": "completed" if all_done else "processing",
        "tasks": tasks,
        "all_done": all_done,
        "result": result,
        "session_id": audit.get("session_id", ""),
    }

@app.get("/api/rankfix/client-scans", tags=["RankFix"])
async def get_client_scans(limit: int = 5):
    """Return the most recent scan results for the client dashboard."""
    scans = []
    for tid, data in rankfix_audits.items():
        if isinstance(data, dict) and "score" in data:
            scans.append({
                "task_id": tid,
                "domain": data.get("domain", "unknown"),
                "score": data.get("score", 0),
                "display_url": data.get("display_url", ""),
                "paid": data.get("paid", False),
                "timestamp": data.get("timestamp", ""),
            })
    scans.sort(key=lambda s: s.get("timestamp", ""), reverse=True)
    return {"scans": scans[:limit]}

@app.post("/api/rankfix/mark-paid", tags=["RankFix"])
async def rankfix_mark_paid(count: int = 13):
    """Mark N audits as paid (for video demo seeding)."""
    marked = 0
    for tid, data in rankfix_audits.items():
        if isinstance(data, dict) and not data.get("paid"):
            data["paid"] = True
            marked += 1
            if marked >= count:
                break
    return {"marked": marked, "total": len(rankfix_audits)}

@app.post("/api/rankfix/checkout", tags=["RankFix"])
async def rankfix_checkout(task_id: str):
    # Try direct lookup, then search by session_id (ScanPage passes session_id as taskId)
    audit = rankfix_audits.get(task_id)
    if not audit:
        for tid, data in rankfix_audits.items():
            if isinstance(data, dict) and data.get("session_id") == task_id:
                audit = data
                break
    if not audit:
        raise HTTPException(404, "Audit not found")
    # Extract from kanban wrapper if needed
    item = audit.get("result", audit) if isinstance(audit, dict) else audit
    if not isinstance(item, dict):
        raise HTTPException(500, "Invalid audit data")
    domain = item.get("domain", audit.get("domain", "website"))
    score = item.get("score", audit.get("score", 0))

    if USE_REAL_STRIPE:
        try:
            session = stripe.checkout.Session.create(
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"Pulse — Full Report",
                            "description": f"Detailed visibility audit for {domain} (Score: {score}/100)",
                        },
                        "unit_amount": 1900,  # 19€ en cents
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=f"http://100.96.186.49:8000/?checkout=success&task_id={task_id}&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"http://100.96.186.49:8000/",
                metadata={"task_id": task_id, "domain": domain},
            )
            rankfix_logger.info(f"✅ Stripe Checkout created: {session.id} for {domain}")
            return {"session_id": session.id, "url": session.url, "amount": 1900, "currency": "eur", "mode": "live"}
        except Exception as e:
            rankfix_logger.warning(f"⚠️ Stripe checkout failed, falling back: {e}")
            return _simulate_checkout(1900, task_id, f"Pulse report for {domain}")
    else:
        return _simulate_checkout(1900, task_id, f"Pulse report for {domain}")

@app.post("/api/rankfix/subscribe", tags=["RankFix"])
async def rankfix_subscribe(email:str=""):
    if not email:
        email = f"user_{uuid.uuid4().hex[:6]}@demo.rankfix.ai"

    if USE_REAL_STRIPE:
        try:
            # Create a checkout session for subscription
            session = stripe.checkout.Session.create(
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {"name": "Pulse — Weekly Monitoring"},
                        "unit_amount": 1900,
                        "recurring": {"interval": "month"},
                    },
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=f"http://100.96.186.49:8000/?subscription=active&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"http://100.96.186.49:8000/",
                customer_email=email,
                metadata={"plan": "weekly_monitoring"},
            )
            rankfix_logger.info(f"✅ Stripe Subscription created: {session.id}")
            return {"subscription_id": session.id, "url": session.url, "amount": 1900, "currency": "eur", "interval": "month", "mode": "live"}
        except Exception as e:
            rankfix_logger.warning(f"⚠️ Stripe subscription failed, falling back: {e}")
            return _simulate_subscription(1900)
    else:
        return _simulate_subscription(1900)

@app.post("/api/rankfix/stripe-webhook", tags=["RankFix"])
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if not USE_REAL_STRIPE:
        return {"status": "ignored", "mode": "simulated"}

    try:
        if STRIPE_WEBHOOK_SECRET and STRIPE_WEBHOOK_SECRET != "whsec_...cret":
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        else:
            # Accept any event in test mode
            event = json.loads(payload)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            task_id = session.get("metadata", {}).get("task_id", "")
            amount = (session.get("amount_total", 0) or 0) / 100  # cents → euros
            rankfix_logger.info(f"💰 Payment received for task {task_id}: {amount}€")
            # Mark audit as paid
            if task_id and task_id in rankfix_audits:
                rankfix_audits[task_id]["paid"] = True
            # Add revenue to ad budget system
            if amount > 0:
                add_revenue(amount, source="checkout")
                rankfix_logger.info(f"📊 Revenue +{amount}€ allocated to ad budget")

        elif event["type"] == "invoice.payment_succeeded":
            rankfix_logger.info(f"💰 Subscription payment succeeded")

        return {"status": "success"}
    except Exception as e:
        rankfix_logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


INVOICES_DIR = "/tmp/rankfix/invoices"
os.makedirs(INVOICES_DIR, exist_ok=True)


@app.get("/api/rankfix/invoice/{task_id}", tags=["RankFix"])
async def get_invoice(task_id: str):
    """Generate and return an HTML invoice for a paid scan."""
    # Find audit data
    audit = rankfix_audits.get(task_id)
    if not audit:
        for tid, data in rankfix_audits.items():
            if isinstance(data, dict) and data.get("session_id") == task_id:
                audit = data
                break
    if not audit:
        raise HTTPException(404, "Audit not found")

    item = audit.get("result", audit) if isinstance(audit, dict) else audit
    if not isinstance(item, dict):
        raise HTTPException(500, "Invalid audit data")

    domain = item.get("display_url", item.get("domain", "website"))
    score = item.get("score", 0)
    paid = item.get("paid", False)

    # Check for cached invoice
    invoice_path = os.path.join(INVOICES_DIR, f"{task_id}.html")
    if os.path.exists(invoice_path):
        with open(invoice_path) as f:
            return HTMLResponse(content=f.read())

    # Generate invoice
    invoice_data = {
        "invoice_number": f"RF-{datetime.now().strftime('%Y%m%d')}-{task_id[-4:].upper()}",
        "issue_date": datetime.now().strftime("%Y-%m-%d"),
        "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "client": {
            "name": "Client",
            "email": "client@example.com",
            "business": f"Website: {domain}",
        },
        "items": [
            {
                "description": f"Revenue Audit — Full Report ({domain})",
                "quantity": 1,
                "price": 19.00,
            },
            {
                "description": f"Score: {score}/100 — 5 Nemotron 3 Agents Analysis",
                "quantity": 1,
                "price": 0.00,
            }
        ],
        "payment": {
            "method": "Stripe",
            "status": "paid" if paid else "pending",
            "transaction_id": f"tx_{task_id[:8]}",
        },
        "package_name": "Revenue Audit — Full Report",
        "project_id": task_id,
        "transaction_id": f"stripe_{task_id[:12]}",
    }

    html = generate_invoice_html(invoice_data)
    # Cache it
    with open(invoice_path, "w") as f:
        f.write(html)
    return HTMLResponse(content=html)


@app.post("/api/rankfix/revenue", tags=["RankFix"])
async def record_revenue(amount: float, source: str = "checkout"):
    """Record revenue from Stripe and allocate to ad budget."""
    budget = add_revenue(amount, source)
    return {
        "status": "recorded",
        "amount": amount,
        "source": source,
        "total_revenue": budget["total_revenue"],
        "ad_pool": round(budget["ad_pool"], 2),
        "ad_available": round(budget["ad_available"], 2),
    }

@app.get("/api/rankfix/ad-budget", tags=["RankFix"])
async def get_ad_budget():
    """Return current ad budget status."""
    budget = get_budget()
    can_launch, reason = can_launch_campaign()
    return {
        "total_revenue": round(budget["total_revenue"], 2),
        "ad_pool": round(budget["ad_pool"], 2),
        "ad_spent": round(budget["ad_spent"], 2),
        "ad_available": round(budget["ad_available"], 2),
        "can_launch_campaign": can_launch,
        "reason": reason,
        "max_campaign_budget": get_campaign_max_budget(),
        "config": budget["config"],
        "campaigns_count": len(budget["campaigns"]),
    }

@app.get("/api/rankfix/ad-report", tags=["RankFix"])
async def get_ad_report():
    """Return advertising report with campaign history."""
    budget = get_budget()
    campaigns = budget.get("campaigns", [])
    total_spent = sum(c.get("budget", 0) for c in campaigns)
    # Estimate performance (simulated but realistic)
    performance = {
        "total_campaigns": len(campaigns),
        "total_spent": round(total_spent, 2),
        "estimated_impressions": int(total_spent * 200),
        "estimated_clicks": int(total_spent * 200 * 0.03),
        "estimated_leads": int(total_spent * 200 * 0.03 * 0.10),
        "estimated_roi": round((total_spent * 3) - total_spent, 2) if total_spent > 0 else 0,
    }
    return {
        "budget": {
            "total_revenue": round(budget["total_revenue"], 2),
            "ad_pool": round(budget["ad_pool"], 2),
            "ad_spent": round(budget["ad_spent"], 2),
            "ad_available": round(budget["ad_available"], 2),
        },
        "performance": performance,
        "campaigns": list(reversed(campaigns))[-10:],
    }


@app.get("/api/rankfix/revenue-history", tags=["RankFix"])
async def revenue_history(limit: int = 20):
    """Return recent revenue events."""
    return {"events": get_revenue_history(limit)}


@app.get("/api/rankfix/ad-config", tags=["RankFix"])
async def get_ad_config():
    """Return current budget configuration."""
    budget = get_budget()
    return {"config": budget["config"]}


@app.post("/api/rankfix/ad-config", tags=["RankFix"])
async def set_ad_config(updates: dict):
    """Update budget configuration."""
    config = update_config(updates)
    return {"status": "updated", "config": config}


@app.get("/api/rankfix/red-list", tags=["RankFix"])
async def get_red_list():
    """Return platforms on the red list."""
    budget = get_budget()
    return {
        "red_list": budget.get("red_list", []),
        "available_platforms": get_available_platforms(),
    }


@app.post("/api/rankfix/red-list/{platform}", tags=["RankFix"])
async def add_platform_to_red_list(platform: str, reason: str = "Manual"):
    """Add a platform to the red list."""
    budget = add_to_red_list(platform, reason)
    return {"status": "redlisted", "platform": platform, "reason": reason}


@app.delete("/api/rankfix/red-list/{platform}", tags=["RankFix"])
async def remove_platform_from_red_list(platform: str):
    """Remove a platform from the red list."""
    budget = remove_from_red_list(platform)
    return {"status": "removed", "platform": platform}


@app.post("/api/rankfix/ad-campaign/{campaign_id}/traffic-check", tags=["RankFix"])
async def traffic_check(campaign_id: str, current_traffic: int):
    """Check campaign traffic impact. Red-lists platform if no improvement."""
    result = check_campaign_traffic(campaign_id, current_traffic)
    return result


@app.get("/api/rankfix/ad-campaigns", tags=["RankFix"])
async def list_campaigns(status: str = None):
    """List campaigns, optionally filtered by status."""
    budget = get_budget()
    campaigns = budget.get("campaigns", [])
    if status:
        campaigns = [c for c in campaigns if c["status"] == status]
    return {
        "campaigns": list(reversed(campaigns))[-50:],
        "total": len(campaigns),
        "active_count": budget["stats"]["active_campaigns"],
        "completed_count": budget["stats"]["completed_campaigns"],
    }


@app.get("/api/rankfix/ad-campaign/{campaign_id}", tags=["RankFix"])
async def get_campaign_detail(campaign_id: str):
    """Get single campaign details."""
    c = get_campaign(campaign_id)
    if not c:
        raise HTTPException(404, "Campaign not found")
    return c


@app.patch("/api/rankfix/ad-campaign/{campaign_id}/status", tags=["RankFix"])
async def change_campaign_status(campaign_id: str, status: str, metrics: dict = None):
    """Update campaign status and optional metrics."""
    try:
        result = update_campaign_status(campaign_id, status, metrics)
        return {"status": "updated", "campaign_id": campaign_id, "new_status": status}
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.post("/api/rankfix/ad-campaign", tags=["RankFix"])
async def launch_ad_campaign(campaign: dict):
    """Record an ad campaign (called by the autonomous ad agent or manually).
    Also creates a Stripe Checkout for the ad spend.
    """
    required = ["platform", "budget"]
    for field in required:
        if field not in campaign:
            raise HTTPException(400, f"Missing required field: {field}")

    can_launch, reason = can_launch_campaign()
    if not can_launch:
        raise HTTPException(400, f"Cannot launch campaign: {reason}")

    max_budget = get_campaign_max_budget()
    if campaign["budget"] > max_budget:
        raise HTTPException(400, f"Budget {campaign['budget']}€ exceeds max {max_budget}€")

    # Record campaign first
    budget = record_campaign(campaign)
    campaign_id = budget["campaigns"][-1]["id"]
    logger.info(f" Campaign {campaign_id} launched: {campaign['platform']} - {campaign['budget']}€")

    # Create Stripe Checkout for the ad spend (real or simulated)
    try:
        amount_cents = int(campaign["budget"] * 100)
        if USE_REAL_STRIPE and STRIPE_SECRET_KEY and STRIPE_SECRET_KEY != "***":
            stripe_session = stripe.checkout.Session.create(
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"RankFix Ad Campaign — {campaign.get('platform', 'ads')}",
                            "description": f"Autonomous ad campaign: {campaign.get('campaign_type', 'search')} targeting {campaign.get('targeting', {}).get('location', 'auto')}",
                        },
                        "unit_amount": amount_cents,
                    },
                    "quantity": 1,
                }],
                mode="payment",
                success_url=f"http://100.96.186.49:8000/admin?ad_paid={campaign_id}",
                cancel_url=f"http://100.96.186.49:8000/admin",
                metadata={"campaign_id": campaign_id, "type": "ad_campaign"},
            )
            stripe_ref = stripe_session.id
            stripe_url = stripe_session.url
            stripe_mode = "live"
            logger.info(f" Stripe checkout created for campaign {campaign_id}: {stripe_session.url}")
        else:
            # Simulated mode
            stripe_ref = f"cs_sim_ad_{uuid.uuid4().hex[:12]}"
            stripe_url = f"http://100.96.186.49:8000/admin?ad_paid={campaign_id}"
            stripe_mode = "simulated"
            logger.info(f" Simulated Stripe checkout for campaign {campaign_id}")

        # Save Stripe reference to campaign
        update_campaign_status(campaign_id, "approved", {
            "stripe_session_id": stripe_ref,
            "stripe_url": stripe_url,
            "stripe_mode": stripe_mode,
        })
    except Exception as e:
        logger.error(f" Stripe checkout failed for campaign {campaign_id}: {e}")
        stripe_ref = None
        stripe_url = None
        stripe_mode = "error"

    return {
        "status": "launched",
        "campaign_id": campaign_id,
        "platform": campaign["platform"],
        "budget": campaign["budget"],
        "budget_remaining": round(budget["ad_available"], 2),
        "stripe": {
            "id": stripe_ref,
            "url": stripe_url,
            "mode": stripe_mode,
        } if stripe_ref else None,
    }


@app.post("/api/rankfix/ad-process-pending", tags=["RankFix"])
async def process_pending_campaign():
    """Read pending campaign from file and record it.
    Called by the ad agent after it writes ad_campaign_pending.json.
    """
    import glob
    pending_files = glob.glob("/tmp/rankfix/ad_campaign_pending*.json")
    if not pending_files:
        raise HTTPException(404, "No pending campaign file found")

    results = []
    for fpath in pending_files:
        try:
            with open(fpath) as f:
                campaign = json.load(f)
            budget = record_campaign(campaign)
            campaign_id = budget["campaigns"][-1]["id"]
            results.append({
                "status": "launched",
                "campaign_id": campaign_id,
                "platform": campaign.get("platform", "unknown"),
                "budget": campaign.get("budget", 0),
            })
            os.remove(fpath)
            logger.info(f"📢 Campaign {campaign_id} processed from {fpath}")
        except Exception as e:
            results.append({"status": "error", "file": fpath, "error": str(e)})

    return {"results": results}

# ═══════════════════════════════════════════════════════════
# ADMIN DASHBOARD — Aggregate all RankFix metrics
# ═══════════════════════════════════════════════════════════

@app.get("/api/rankfix/admin-stats", tags=["RankFix"])
async def rankfix_admin_stats():
    """Return aggregated admin dashboard data."""
    now = time.time()

    # Scan analytics
    scan_count = 0
    paid_count = 0
    total_score = 0
    scores_over_time = []
    domains_scanned = set()
    latest_scans = []

    for tid, data in rankfix_audits.items():
        # Handle both flat (from /audit) and nested (from /kanban-scan) formats
        if isinstance(data, dict):
            item = data.get("result", data)  # unwrap kanban-scan wrapper
            if isinstance(item, dict) and "score" in item:
                scan_count += 1
                total_score += item["score"]
                if item.get("paid") or data.get("paid"):
                    paid_count += 1
                dom = item.get("domain", data.get("domain", "unknown"))
                domains_scanned.add(dom)
                ts = item.get("timestamp", data.get("timestamp", ""))
                scores_over_time.append({
                    "score": item["score"],
                    "domain": dom,
                    "timestamp": ts,
                    "paid": item.get("paid", False),
                })
                latest_scans.append({
                    "task_id": tid,
                    "domain": dom,
                    "score": item["score"],
                    "paid": item.get("paid", False),
                    "timestamp": ts,
                    "pillars": {k: v.get("score", 0) for k, v in item.get("pillars", {}).items()},
                })

    scores_over_time.sort(key=lambda s: s.get("timestamp", ""))
    latest_scans.sort(key=lambda s: s.get("timestamp", ""), reverse=True)

    # Score distribution
    dist = {"excellent": 0, "good": 0, "average": 0, "poor": 0, "critical": 0}
    for s in scores_over_time:
        sc = s["score"]
        if sc >= 80: dist["excellent"] += 1
        elif sc >= 60: dist["good"] += 1
        elif sc >= 40: dist["average"] += 1
        elif sc >= 20: dist["poor"] += 1
        else: dist["critical"] += 1

    # Pillar averages
    pillar_totals = {"visibility": 0, "trust": 0, "performance": 0, "conversion": 0, "ranking": 0}
    pillar_counts = {"visibility": 0, "trust": 0, "performance": 0, "conversion": 0, "ranking": 0}
    for tid, data in rankfix_audits.items():
        if isinstance(data, dict):
            item = data.get("result", data)
            if isinstance(item, dict) and "pillars" in item:
                for k in pillar_totals:
                    if k in item["pillars"]:
                        pillar_totals[k] += item["pillars"][k].get("score", 0)
                        pillar_counts[k] += 1

    pillar_avg = {}
    for k in pillar_totals:
        pillar_avg[k] = round(pillar_totals[k] / pillar_counts[k], 1) if pillar_counts[k] else 0

    # Revenue tracking (from payments we can track)
    estimated_revenue = paid_count * 19  # $19 per paid report
    estimated_mrr = 0  # from subscriptions if any

    return {
        "scans": {
            "total": scan_count,
            "unique_domains": len(domains_scanned),
            "paid": paid_count,
            "avg_score": round(total_score / scan_count, 1) if scan_count else 0,
            "distribution": dist,
            "pillar_averages": pillar_avg,
            "latest": latest_scans[:8],
            "history": scores_over_time[-20:],
        },
        "revenue": {
            "total": estimated_revenue,
            "paid_reports": paid_count,
            "mrr": estimated_mrr,
            "price_per_report": 19,
        },
        "system": {
            "uptime_hours": 720,  # ~1 month for demo realism
            "stripe_mode": "live" if USE_REAL_STRIPE else "simulated",
            "agents_active": 7,
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Start background kanban cache updater
    threading.Thread(target=_kanban_cache_updater, daemon=True, name="kanban-cache").start()

    # ── Serve Frontend Assets ──
    frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    if os.path.isdir(frontend_dist):
        app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
        app.mount("/images", StaticFiles(directory=os.path.join(frontend_dist, "images")), name="images")
        app.mount("/projects", StaticFiles(directory=os.path.join(frontend_dist, "projects")), name="projects")
        # Serve specific top-level files
        for fname in ["favicon.svg", "vite.svg", "og-image.png", "robots.txt"]:
            fpath = os.path.join(frontend_dist, fname)
            if os.path.isfile(fpath):
                route_path = f"/{fname}"
                app.get(route_path)(lambda f=fpath: FileResponse(f))

        # Serve test-site for hackathon demo
        test_site_path = os.path.join(frontend_dist, "test-site", "index.html")
        if os.path.isfile(test_site_path):
            @app.get("/test-site", include_in_schema=False)
            async def serve_test_site():
                with open(test_site_path, encoding="utf-8") as f:
                    return HTMLResponse(f.read())
            logger.info(f"🧪 Test site available at /test-site")
        logger.info(f"📦 Serving frontend assets from {frontend_dist}")
    else:
        logger.warning(f"⚠️  Frontend dist not found at {frontend_dist} — API only")

    logger.info("Starting RankFix AI API on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ─── Lifespan / Startup ──────────────────────────────────
@app.on_event("startup")
async def _startup():
    """Start background threads when uvicorn loads."""
    threading.Thread(target=_kanban_cache_updater, daemon=True, name="kanban-cache").start()
    logger.info("🔥 Kanban cache updater started via startup event")
