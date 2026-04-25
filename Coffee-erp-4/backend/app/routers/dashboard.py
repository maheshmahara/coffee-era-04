from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

@router.get("/kpis")
def get_kpis(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_batches = db.query(func.count(models.InputParameter.id)).scalar() or 0
    confirmed_batches = db.query(func.count(models.InputParameter.id)).filter(
        models.InputParameter.status == "confirmed"
    ).scalar() or 0

    costing = db.query(models.CostingResult).all()
    total_roasted = sum(float(c.roasted_output_kg or 0) for c in costing)
    total_cups = sum(float(c.cups_produced or 0) for c in costing)
    total_revenue = sum(float(c.cup_sales_revenue or 0) for c in costing)
    total_variable_cost = sum(float(c.total_variable_cost or 0) for c in costing)
    total_net_profit = sum(float(c.net_profit or 0) for c in costing)

    inventory = db.query(models.Inventory).all()
    inv_summary = {i.item_type: float(i.quantity_kg) for i in inventory}

    # Sales actuals
    actual_cups = db.query(func.sum(models.Sale.quantity_cups)).scalar() or 0
    actual_revenue = db.query(
        func.sum(models.Sale.quantity_cups * models.Sale.unit_price)
    ).scalar() or 0

    # Expenses
    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0

    return {
        "batches": {
            "total": total_batches,
            "confirmed": confirmed_batches,
            "draft": total_batches - confirmed_batches,
        },
        "production": {
            "total_roasted_kg": round(total_roasted, 2),
            "total_cups_capacity": round(total_cups, 0),
        },
        "financials": {
            "total_projected_revenue": round(total_revenue, 2),
            "total_variable_cost": round(total_variable_cost, 2),
            "total_net_profit": round(total_net_profit, 2),
            "actual_sales_cups": int(actual_cups),
            "actual_revenue": round(float(actual_revenue), 2),
            "total_expenses_logged": round(float(total_expenses), 2),
        },
        "inventory": inv_summary,
    }

@router.get("/profit-by-source")
def profit_by_source(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    results = db.query(models.CostingResult).all()
    agg = {}
    for r in results:
        s = r.source_type
        if s not in agg:
            agg[s] = {
                "source_type": s,
                "total_batches": 0,
                "total_revenue": 0,
                "total_cost": 0,
                "total_profit": 0,
                "avg_cost_per_kg": 0,
                "avg_cost_per_cup": 0,
            }
        agg[s]["total_batches"] += 1
        agg[s]["total_revenue"] += float(r.cup_sales_revenue or 0)
        agg[s]["total_cost"] += float(r.total_variable_cost or 0)
        agg[s]["total_profit"] += float(r.net_profit or 0)
        agg[s]["avg_cost_per_kg"] += float(r.cost_per_roasted_kg or 0)
        agg[s]["avg_cost_per_cup"] += float(r.coffee_cost_per_cup or 0)

    for s in agg:
        n = agg[s]["total_batches"]
        agg[s]["avg_cost_per_kg"] = round(agg[s]["avg_cost_per_kg"] / n, 2)
        agg[s]["avg_cost_per_cup"] = round(agg[s]["avg_cost_per_cup"] / n, 2)

    return list(agg.values())

@router.get("/annual-pnl")
def annual_pnl(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Mirrors the Excel Annual_PnL sheet"""
    results = db.query(models.CostingResult).all()
    pnl = {}
    for r in results:
        s = r.source_type
        if s not in pnl:
            pnl[s] = {
                "source_type": s,
                "cup_sales_revenue": 0,
                "coffee_variable_cost": 0,
                "cafe_variable_cost": 0,
                "contribution_before_fixed": 0,
                "fixed_cost": 0,
                "net_profit": 0,
                "net_margin": 0,
            }
        pnl[s]["cup_sales_revenue"] += float(r.cup_sales_revenue or 0)
        pnl[s]["coffee_variable_cost"] += float(r.total_variable_cost or 0)
        pnl[s]["cafe_variable_cost"] += float(r.cafe_variable_cost or 0)
        pnl[s]["contribution_before_fixed"] += float(r.contribution_before_fixed or 0)
        pnl[s]["fixed_cost"] += float(r.annual_fixed_cost or 0)
        pnl[s]["net_profit"] += float(r.net_profit or 0)

    for s in pnl:
        rev = pnl[s]["cup_sales_revenue"]
        pnl[s]["net_margin"] = round(pnl[s]["net_profit"] / rev, 6) if rev > 0 else 0

    return list(pnl.values())
