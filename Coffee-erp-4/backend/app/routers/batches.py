from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from app.database import get_db
from app import models
from app.auth import get_current_user
from app.costing_engine import calculate_costing

router = APIRouter()

class BatchCreate(BaseModel):
    batch_name: str
    batch_date: Optional[date] = None
    fresh_cherry_qty: float = 0
    fresh_cherry_price: float = 0
    dry_cherry_qty: float = 0
    dry_cherry_price: float = 0
    parchment_qty: float = 0
    parchment_price: float = 0
    green_bean_qty: float = 0
    green_bean_price: float = 0
    fresh_to_parchment_yield: float = 0.30
    dry_to_green_yield: float = 0.50
    parchment_to_green_yield: float = 0.75
    green_to_roasted_yield: float = 0.85
    cups_per_kg_roasted: float = 50
    transport_cost_per_kg: float = 30
    fresh_processing_cost_per_kg: float = 20
    dry_cleaning_cost_per_kg: float = 10
    hulling_electricity_per_kg: float = 25
    hulling_labour_per_kg: float = 10
    roasting_electricity_per_kg: float = 25
    roasting_labour_per_kg: float = 10
    packaging_cost_per_kg: float = 60
    cafe_variable_cost_per_cup: float = 30
    cup_selling_price: float = 130
    annual_fixed_cost: float = 416000
    status: str = "draft"
    notes: Optional[str] = None

@router.get("/")
def list_batches(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batches = db.query(models.InputParameter).order_by(models.InputParameter.created_at.desc()).all()
    return batches

@router.post("/")
def create_batch(data: BatchCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = models.InputParameter(**data.dict(), created_by=current_user.id)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    # Auto calculate costing
    _run_costing(db, batch)
    return batch

@router.get("/{batch_id}")
def get_batch(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(models.InputParameter).filter(models.InputParameter.id == batch_id).first()
    if not batch:
        raise HTTPException(404, "Batch not found")
    return batch

@router.put("/{batch_id}")
def update_batch(batch_id: int, data: BatchCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(models.InputParameter).filter(models.InputParameter.id == batch_id).first()
    if not batch:
        raise HTTPException(404, "Batch not found")
    for k, v in data.dict().items():
        setattr(batch, k, v)
    db.commit()
    db.refresh(batch)
    _run_costing(db, batch)
    return batch

@router.delete("/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(models.InputParameter).filter(models.InputParameter.id == batch_id).first()
    if not batch:
        raise HTTPException(404, "Batch not found")
    db.delete(batch)
    db.commit()
    return {"message": "Deleted"}

@router.post("/{batch_id}/calculate")
def calculate_batch(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    batch = db.query(models.InputParameter).filter(models.InputParameter.id == batch_id).first()
    if not batch:
        raise HTTPException(404, "Batch not found")
    results = _run_costing(db, batch)
    return {"message": "Costing calculated", "results": results}

def _run_costing(db, batch):
    results = calculate_costing(batch)
    # Delete existing costing results for this batch
    db.query(models.CostingResult).filter(models.CostingResult.batch_id == batch.id).delete()
    for r in results:
        cr = models.CostingResult(batch_id=batch.id, **r)
        db.add(cr)
    db.commit()
    return results
