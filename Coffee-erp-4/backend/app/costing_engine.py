"""
Coffee Costing Engine
Replicates the Excel value chain calculations:
  Fresh Cherry -> Parchment -> Green Bean -> Roasted -> Cup
  Dry Cherry -> Green Bean -> Roasted -> Cup
  Parchment -> Green Bean -> Roasted -> Cup
  Green Bean -> Roasted -> Cup
"""
from decimal import Decimal
from typing import Dict
from app import models

def calculate_costing(batch: models.InputParameter) -> Dict:
    results = []

    def _calc(
        source_type: str,
        input_qty: float,
        purchase_price: float,
        transport_cost: float,
        processing_cost: float,
        hulling_electricity: float,
        hulling_labour: float,
        green_output: float,
        roasting_electricity: float,
        roasting_labour: float,
        roasted_output: float,
        packaging_cost: float,
        cups_produced: float,
    ):
        total_variable_cost = (
            input_qty * purchase_price
            + transport_cost
            + processing_cost
            + hulling_electricity
            + hulling_labour
            + roasting_electricity
            + roasting_labour
            + packaging_cost
        )
        cost_per_roasted_kg = total_variable_cost / roasted_output if roasted_output > 0 else 0
        coffee_cost_per_cup = total_variable_cost / cups_produced if cups_produced > 0 else 0
        cup_sales_revenue = cups_produced * float(batch.cup_selling_price)
        cafe_variable_cost_total = cups_produced * float(batch.cafe_variable_cost_per_cup)
        contribution = cup_sales_revenue - total_variable_cost - cafe_variable_cost_total
        fixed = float(batch.annual_fixed_cost)
        net_profit = contribution - fixed
        net_margin = net_profit / cup_sales_revenue if cup_sales_revenue > 0 else 0
        breakeven = fixed / (float(batch.cup_selling_price) - float(batch.cafe_variable_cost_per_cup) - coffee_cost_per_cup) / 365 if (float(batch.cup_selling_price) - float(batch.cafe_variable_cost_per_cup) - coffee_cost_per_cup) > 0 else 0

        return {
            "source_type": source_type,
            "roasted_output_kg": roasted_output,
            "cups_produced": cups_produced,
            "procurement_cost": input_qty * purchase_price,
            "transport_cost": transport_cost,
            "processing_cost": processing_cost,
            "hulling_cost": hulling_electricity + hulling_labour,
            "roasting_cost": roasting_electricity + roasting_labour,
            "packaging_cost": packaging_cost,
            "total_variable_cost": total_variable_cost,
            "cost_per_roasted_kg": cost_per_roasted_kg,
            "coffee_cost_per_cup": coffee_cost_per_cup,
            "cup_sales_revenue": cup_sales_revenue,
            "cafe_variable_cost": cafe_variable_cost_total,
            "contribution_before_fixed": contribution,
            "annual_fixed_cost": fixed,
            "net_profit": net_profit,
            "net_margin": net_margin,
            "breakeven_cups_per_day": breakeven,
        }

    b = batch
    tr = float(b.transport_cost_per_kg)
    pkg = float(b.packaging_cost_per_kg)
    cups_ratio = float(b.cups_per_kg_roasted)

    # Fresh Cherry
    if float(b.fresh_cherry_qty) > 0:
        fq = float(b.fresh_cherry_qty)
        parchment_out = fq * float(b.fresh_to_parchment_yield)
        green_out = parchment_out * float(b.parchment_to_green_yield)
        roasted = green_out * float(b.green_to_roasted_yield)
        cups = roasted * cups_ratio
        results.append(_calc(
            "fresh_cherry", fq, float(b.fresh_cherry_price),
            transport_cost=fq * tr,
            processing_cost=fq * float(b.fresh_processing_cost_per_kg),
            hulling_electricity=parchment_out * float(b.hulling_electricity_per_kg),
            hulling_labour=parchment_out * float(b.hulling_labour_per_kg),
            green_output=green_out,
            roasting_electricity=green_out * float(b.roasting_electricity_per_kg),
            roasting_labour=green_out * float(b.roasting_labour_per_kg),
            roasted_output=roasted,
            packaging_cost=roasted * pkg,
            cups_produced=cups,
        ))

    # Dry Cherry
    if float(b.dry_cherry_qty) > 0:
        dq = float(b.dry_cherry_qty)
        green_out = dq * float(b.dry_to_green_yield)
        roasted = green_out * float(b.green_to_roasted_yield)
        cups = roasted * cups_ratio
        results.append(_calc(
            "dry_cherry", dq, float(b.dry_cherry_price),
            transport_cost=dq * tr,
            processing_cost=dq * float(b.dry_cleaning_cost_per_kg),
            hulling_electricity=0, hulling_labour=0,
            green_output=green_out,
            roasting_electricity=green_out * float(b.roasting_electricity_per_kg),
            roasting_labour=green_out * float(b.roasting_labour_per_kg),
            roasted_output=roasted,
            packaging_cost=roasted * pkg,
            cups_produced=cups,
        ))

    # Parchment
    if float(b.parchment_qty) > 0:
        pq = float(b.parchment_qty)
        green_out = pq * float(b.parchment_to_green_yield)
        roasted = green_out * float(b.green_to_roasted_yield)
        cups = roasted * cups_ratio
        results.append(_calc(
            "parchment", pq, float(b.parchment_price),
            transport_cost=pq * tr,
            processing_cost=0,
            hulling_electricity=pq * float(b.hulling_electricity_per_kg),
            hulling_labour=pq * float(b.hulling_labour_per_kg),
            green_output=green_out,
            roasting_electricity=green_out * float(b.roasting_electricity_per_kg),
            roasting_labour=green_out * float(b.roasting_labour_per_kg),
            roasted_output=roasted,
            packaging_cost=roasted * pkg,
            cups_produced=cups,
        ))

    # Green Beans
    if float(b.green_bean_qty) > 0:
        gq = float(b.green_bean_qty)
        roasted = gq * float(b.green_to_roasted_yield)
        cups = roasted * cups_ratio
        results.append(_calc(
            "green_bean", gq, float(b.green_bean_price),
            transport_cost=gq * tr,
            processing_cost=0,
            hulling_electricity=0, hulling_labour=0,
            green_output=gq,
            roasting_electricity=gq * float(b.roasting_electricity_per_kg),
            roasting_labour=gq * float(b.roasting_labour_per_kg),
            roasted_output=roasted,
            packaging_cost=roasted * pkg,
            cups_produced=cups,
        ))

    return results
