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


# ─── Static Files Serving ──────────────────────────────────

PROJECTS_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'projects')

@app.get("/api/files/{file_path:path}", tags=["Files"])
async def serve_file(file_path: str):
    """Serve generated project files (HTML, SVG, JSON)."""
    # Strip leading 'projects/' if present (since PROJECTS_DIR already includes it)
    if file_path.startswith("projects/"):
        file_path = file_path[9:]
    
    full_path = os.path.join(PROJECTS_DIR, file_path)
    
    # Security: prevent path traversal
    if not os.path.abspath(full_path).startswith(os.path.abspath(PROJECTS_DIR)):
        raise HTTPException(status_code=403, detail="Access denied")
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine content type
    content_type = "text/plain"
    if file_path.endswith(".html"):
        content_type = "text/html"
    elif file_path.endswith(".svg"):
        content_type = "image/svg+xml"
    elif file_path.endswith(".json"):
        content_type = "application/json"
    elif file_path.endswith(".css"):
        content_type = "text/css"
    elif file_path.endswith(".js"):
        content_type = "application/javascript"
    
    from fastapi.responses import FileResponse
    return FileResponse(full_path, media_type=content_type)


# ─── Dashboard Stats ──────────────────────────────────────

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


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Zero Employee Studio OS API on port 8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
