from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

class InventoryUpdate(BaseModel):
    item_type: str
    quantity_kg: float
    location: str = "Main Warehouse"
    batch_ref: Optional[str] = None

@router.get("/")
def list_inventory(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.Inventory).all()

@router.post("/")
def upsert_inventory(data: InventoryUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    existing = db.query(models.Inventory).filter(models.Inventory.item_type == data.item_type).first()
    if existing:
        existing.quantity_kg = data.quantity_kg
        existing.location = data.location
        existing.batch_ref = data.batch_ref
        existing.updated_by = current_user.id
        db.commit()
        db.refresh(existing)
        return existing
    record = models.Inventory(**data.dict(), updated_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.patch("/{item_type}/adjust")
def adjust_inventory(item_type: str, delta: float, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    record = db.query(models.Inventory).filter(models.Inventory.item_type == item_type).first()
    if not record:
        raise HTTPException(404, "Item not found")
    record.quantity_kg = float(record.quantity_kg) + delta
    record.updated_by = current_user.id
    db.commit()
    db.refresh(record)
    return record
