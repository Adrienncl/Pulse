"""
Invoice Agent — Génère des factures professionnelles après paiement
"""
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any


# Company info (Zero Employee Studio)
COMPANY = {
    "name": "Zero Employee Studio",
    "address": "123 AI Boulevard",
    "city": "San Francisco, CA 94102",
    "country": "United States",
    "email": "billing@zeroemployee.studio",
    "phone": "+1 (555) 000-0000",
    "tax_id": "US-000000000",
    "website": "https://zeroemployee.studio"
}


def generate_invoice_number() -> str:
    """Generate unique invoice number: ZES-YYYYMMDD-XXXX"""
    date_str = datetime.now().strftime("%Y%m%d")
    short_id = uuid.uuid4().hex[:4].upper()
    return f"ZES-{date_str}-{short_id}"


def calculate_payment_details(price: float) -> Dict[str, Any]:
    """Calculate payment breakdown with Stripe fees"""
    stripe_fee = round(price * 0.029 + 0.30, 2)  # 2.9% + $0.30
    net_amount = round(price - stripe_fee, 2)
    return {
        "gross_amount": price,
        "stripe_fee": stripe_fee,
        "net_amount": net_amount,
        "currency": "USD"
    }


def generate_invoice_html(invoice_data: Dict[str, Any]) -> str:
    """Generate a professional HTML invoice"""
    invoice_number = invoice_data.get("invoice_number", generate_invoice_number())
    client = invoice_data.get("client", {})
    items = invoice_data.get("items", [])
    payment = invoice_data.get("payment", {})
    due_date = invoice_data.get("due_date", datetime.now().strftime("%Y-%m-%d"))
    issue_date = invoice_data.get("issue_date", datetime.now().strftime("%Y-%m-%d"))
    
    # Build items HTML
    items_html = ""
    subtotal = 0
    for item in items:
        qty = item.get("quantity", 1)
        price = item.get("price", 0)
        total = qty * price
        subtotal += total
        items_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{item.get('description', 'Service')}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">{qty}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${price:,.2f}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${total:,.2f}</td>
        </tr>
        """
    
    tax = round(subtotal * 0.0, 2)  # No tax for now
    total = subtotal + tax
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {invoice_number}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f9fafb; color: #111827; line-height: 1.6; }}
        .invoice-container {{ max-width: 800px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #7c3aed, #2563eb); color: white; padding: 40px; }}
        .header-top {{ display: flex; justify-content: space-between; align-items: flex-start; }}
        .company-name {{ font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }}
        .company-tagline {{ font-size: 14px; opacity: 0.8; margin-top: 4px; }}
        .invoice-badge {{ background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }}
        .invoice-meta {{ display: flex; justify-content: space-between; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.2); }}
        .meta-item {{ text-align: left; }}
        .meta-label {{ font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }}
        .meta-value {{ font-size: 16px; font-weight: 600; margin-top: 4px; }}
        .content {{ padding: 40px; }}
        .section {{ margin-bottom: 32px; }}
        .section-title {{ font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; font-weight: 600; }}
        .client-info {{ background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; }}
        .client-name {{ font-size: 18px; font-weight: 600; color: #111827; }}
        .client-detail {{ color: #6b7280; font-size: 14px; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th {{ background: #f9fafb; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 600; }}
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {{ text-align: right; }}
        .totals {{ display: flex; justify-content: flex-end; margin-top: 24px; }}
        .totals-box {{ background: #f9fafb; padding: 24px; border-radius: 8px; min-width: 280px; }}
        .total-row {{ display: flex; justify-content: space-between; padding: 8px 0; }}
        .total-row.grand {{ border-top: 2px solid #7c3aed; margin-top: 8px; padding-top: 16px; font-size: 20px; font-weight: 700; color: #7c3aed; }}
        .payment-info {{ background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 24px; border-radius: 8px; border: 1px solid #a7f3d0; }}
        .payment-status {{ display: inline-flex; align-items: center; gap: 8px; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }}
        .payment-status::before {{ content: "✓"; }}
        .footer {{ background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }}
        .footer-text {{ color: #6b7280; font-size: 13px; }}
        .footer-links {{ margin-top: 8px; }}
        .footer-links a {{ color: #7c3aed; text-decoration: none; font-size: 13px; }}
        .footer-links a:hover {{ text-decoration: underline; }}
        .notes {{ background: #fffbeb; border: 1px solid #fcd34d; padding: 16px; border-radius: 8px; margin-top: 24px; }}
        .notes-title {{ font-weight: 600; color: #92400e; margin-bottom: 8px; }}
        .notes-text {{ color: #78350f; font-size: 14px; }}
        @media print {{
            body {{ background: white; }}
            .invoice-container {{ box-shadow: none; margin: 0; }}
            .no-print {{ display: none; }}
        }}
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="header-top">
                <div>
                    <div class="company-name">{COMPANY['name']}</div>
                    <div class="company-tagline">AI-Powered Creative Studio</div>
                </div>
                <div class="invoice-badge">INVOICE</div>
            </div>
            <div class="invoice-meta">
                <div class="meta-item">
                    <div class="meta-label">Invoice Number</div>
                    <div class="meta-value">{invoice_number}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Issue Date</div>
                    <div class="meta-value">{issue_date}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Due Date</div>
                    <div class="meta-value">{due_date}</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="section-title">Bill To</div>
                <div class="client-info">
                    <div class="client-name">{client.get('name', 'Client')}</div>
                    <div class="client-detail">{client.get('email', 'client@example.com')}</div>
                    <div class="client-detail">{client.get('business', 'Business Name')}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Services Provided</div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="totals-box">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>${subtotal:,.2f}</span>
                        </div>
                        <div class="total-row">
                            <span>Tax (0%)</span>
                            <span>${tax:,.2f}</span>
                        </div>
                        <div class="total-row grand">
                            <span>Total Due</span>
                            <span>${total:,.2f}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="payment-info">
                    <div class="payment-status">Payment Received</div>
                    <div style="margin-top: 12px; color: #065f46;">
                        <strong>Payment Method:</strong> Credit Card (Stripe)<br>
                        <strong>Transaction ID:</strong> {invoice_data.get('transaction_id', 'N/A')}<br>
                        <strong>Amount Paid:</strong> ${total:,.2f} USD
                    </div>
                </div>
            </div>
            
            <div class="notes">
                <div class="notes-title">📋 Order Details</div>
                <div class="notes-text">
                    <strong>Package:</strong> {invoice_data.get('package_name', 'Creative Package')}<br>
                    <strong>Project ID:</strong> {invoice_data.get('project_id', 'N/A')}<br>
                    <strong>Delivery:</strong> Digital files delivered via email and dashboard
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Thank you for your business! This invoice was generated automatically by {COMPANY['name']}.
            </div>
            <div class="footer-links">
                <a href="{COMPANY['website']}">{COMPANY['website']}</a> • 
                <a href="mailto:{COMPANY['email']}">{COMPANY['email']}</a>
            </div>
        </div>
    </div>
</body>
</html>"""
    
    return html


def generate_invoice(project_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate a complete invoice for a project.
    
    Args:
        project_data: {
            "client_name": "Boulangerie Martin",
            "client_email": "contact@boulangerie-martin.fr",
            "client_business": "Boulangerie Martin",
            "package_name": "Local Business Launch Kit",
            "price": 499.00,
            "items": [{"description": "Logo Design", "quantity": 1, "price": 199}, ...],
            "project_id": "abc123"
        }
    
    Returns:
        {
            "invoice_number": "ZES-20260617-A1B2",
            "invoice_html": "<html>...</html>",
            "invoice_path": "projects/abc123/invoice.html",
            "client": {...},
            "payment": {...},
            "status": "paid"
        }
    """
    invoice_number = generate_invoice_number()
    issue_date = datetime.now().strftime("%Y-%m-%d")
    due_date = datetime.now().strftime("%Y-%m-%d")  # Paid immediately
    
    # Build items list
    items = project_data.get("items", [])
    if not items:
        # Default items based on package
        price = project_data.get("price", 499)
        package_name = project_data.get("package_name", "Creative Package")
        items = [{"description": package_name, "quantity": 1, "price": price}]
    
    # Calculate totals
    subtotal = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)
    payment = calculate_payment_details(subtotal)
    
    invoice_data = {
        "invoice_number": invoice_number,
        "issue_date": issue_date,
        "due_date": due_date,
        "client": {
            "name": project_data.get("client_name", "Client"),
            "email": project_data.get("client_email", "client@example.com"),
            "business": project_data.get("client_business", "Business Name")
        },
        "items": items,
        "payment": payment,
        "package_name": project_data.get("package_name", "Creative Package"),
        "project_id": project_data.get("project_id", "N/A"),
        "transaction_id": project_data.get("transaction_id", f"pi_{uuid.uuid4().hex[:16]}"),
        "status": "paid"
    }
    
    # Generate HTML
    invoice_html = generate_invoice_html(invoice_data)
    
    # Save to project directory
    project_id = project_data.get("project_id", "unknown")
    projects_dir = Path(__file__).parent.parent / "frontend" / "dist" / "projects" / project_id
    projects_dir.mkdir(parents=True, exist_ok=True)
    
    invoice_path = projects_dir / "invoice.html"
    invoice_path.write_text(invoice_html, encoding="utf-8")
    
    return {
        "invoice_number": invoice_number,
        "invoice_html": invoice_html,
        "invoice_path": f"/projects/{project_id}/invoice.html",
        "client": invoice_data["client"],
        "payment": payment,
        "status": "paid",
        "issue_date": issue_date,
        "due_date": due_date,
        "items": items
    }


# Example usage
if __name__ == "__main__":
    result = generate_invoice({
        "client_name": "Boulangerie Martin",
        "client_email": "contact@boulangerie-martin.fr",
        "client_business": "Boulangerie Martin",
        "package_name": "Local Business Launch Kit",
        "price": 499.00,
        "items": [
            {"description": "Logo Design (SVG)", "quantity": 1, "price": 150},
            {"description": "Landing Page (HTML)", "quantity": 1, "price": 250},
            {"description": "Social Media Kit", "quantity": 1, "price": 99}
        ],
        "project_id": "test_001"
    })
    print(f"Invoice generated: {result['invoice_number']}")
    print(f"Path: {result['invoice_path']}")
