"""
Finance Agent
=============

Calculates revenue, costs, profit, and margin for the project.
Provides final financial summary for the delivery dashboard.
"""

from typing import Dict, Any


def calculate_finance(
    pricing_data: Dict[str, Any],
    procurement_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Calculate final finance summary.
    
    Args:
        pricing_data: Output from pricing agent
        procurement_data: Output from spend agent
    
    Returns:
        Dict with revenue, costs, profit, margin, status
    """
    # Revenue from pricing
    revenue = pricing_data.get("price", pricing_data.get("client_price", 499))
    
    # Costs from procurement
    costs = {}
    resources = procurement_data.get("resources", [])
    total_costs = 0.0
    
    for resource in resources:
        cost_type = resource.get("type", "unknown")
        cost_amount = resource.get("cost", 0)
        costs[cost_type] = cost_amount
        total_costs += cost_amount
    
    total_costs = round(total_costs, 2)
    net_profit = round(revenue - total_costs, 2)
    margin_percent = round((net_profit / revenue) * 100, 2) if revenue > 0 else 0
    
    return {
        "revenue": revenue,
        "costs": costs,
        "total_costs": total_costs,
        "net_profit": net_profit,
        "margin_percent": margin_percent,
        "human_employees": 0,
        "status": "Autonomous delivery complete",
        "summary": {
            "revenue_display": f"${revenue:,.2f}",
            "costs_display": f"${total_costs:,.2f}",
            "profit_display": f"${net_profit:,.2f}",
            "margin_display": f"{margin_percent:.1f}%",
            "employees_display": "0 (Zero)"
        }
    }


def calculate_roi(finance_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate additional ROI metrics."""
    revenue = finance_data.get("revenue", 0)
    total_costs = finance_data.get("total_costs", 0)
    
    if total_costs > 0:
        roi = ((revenue - total_costs) / total_costs) * 100
    else:
        roi = 0
    
    # Estimate time saved (assuming 40 hours of human work)
    hours_saved = 40
    hourly_rate = 75  # Average creative agency rate
    value_of_time_saved = hours_saved * hourly_rate
    
    return {
        "roi_percent": round(roi, 1),
        "hours_saved": hours_saved,
        "hourly_rate": hourly_rate,
        "value_of_time_saved": value_of_time_saved,
        "cost_per_hour_automated": round(total_costs / hours_saved, 2) if hours_saved > 0 else 0,
        "efficiency_gain": f"{hours_saved} hours of human work automated"
    }


# ─── Test ──────────────────────────────────────────────────

if __name__ == "__main__":
    test_pricing = {"client_price": 499}
    test_procurement = {
        "resources": [
            {"type": "domain", "cost": 12},
            {"type": "hosting", "cost": 20},
            {"type": "image_generation", "cost": 0.24},
            {"type": "llm_usage", "cost": 0.18},
            {"type": "deployment", "cost": 2},
            {"type": "stripe_fees", "cost": 14.77},
        ]
    }
    
    result = calculate_finance(test_pricing, test_procurement)
    print("Finance summary:")
    for key, value in result.items():
        if key != "summary":
            print(f"  {key}: {value}")
    
    roi = calculate_roi(result)
    print("\nROI:")
    for key, value in roi.items():
        print(f"  {key}: {value}")
