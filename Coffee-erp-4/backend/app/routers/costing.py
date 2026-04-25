from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

@router.get("/")
def list_costing(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.CostingResult).order_by(models.CostingResult.calculated_at.desc()).all()

@router.get("/compare")
def compare_sources(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """Returns summary compare data similar to Excel Summary_Compare sheet"""
    results = db.query(models.CostingResult).all()
    if not results:
        return []
    by_source = {}
    for r in results:
        key = r.source_type
        if key not in by_source:
            by_source[key] = r
    return list(by_source.values())

@router.get("/batch/{batch_id}")
def get_costing_by_batch(batch_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.CostingResult).filter(models.CostingResult.batch_id == batch_id).all()
