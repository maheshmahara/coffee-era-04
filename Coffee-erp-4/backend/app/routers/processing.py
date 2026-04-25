from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

class ProcessingCreate(BaseModel):
    batch_id: Optional[int] = None
    stage: str
    input_qty_kg: Optional[float] = None
    output_qty_kg: Optional[float] = None
    actual_yield: Optional[float] = None
    electricity_cost: float = 0
    labour_cost: float = 0
    other_cost: float = 0
    process_date: Optional[date] = None
    operator_name: Optional[str] = None
    notes: Optional[str] = None

@router.get("/")
def list_processing(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.ProcessingStage).order_by(models.ProcessingStage.created_at.desc()).all()

@router.post("/")
def create_processing(data: ProcessingCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    record = models.ProcessingStage(**data.dict(), created_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/{record_id}")
def get_processing(record_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    r = db.query(models.ProcessingStage).filter(models.ProcessingStage.id == record_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    return r

@router.delete("/{record_id}")
def delete_processing(record_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    r = db.query(models.ProcessingStage).filter(models.ProcessingStage.id == record_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
