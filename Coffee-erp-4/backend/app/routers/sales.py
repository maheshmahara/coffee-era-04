from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

class SaleCreate(BaseModel):
    sale_date: Optional[date] = None
    product_type: str = "cafe_cup"
    quantity_cups: int = 0
    quantity_kg: float = 0
    unit_price: float
    customer_type: str = "retail"
    notes: Optional[str] = None

@router.get("/")
def list_sales(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.Sale).order_by(models.Sale.sale_date.desc()).all()

@router.post("/")
def create_sale(data: SaleCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    record = models.Sale(**data.dict(), recorded_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/summary")
def sales_summary(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total_cups = db.query(func.sum(models.Sale.quantity_cups)).scalar() or 0
    total_revenue = db.query(
        func.sum(models.Sale.quantity_cups * models.Sale.unit_price)
    ).scalar() or 0
    return {"total_cups": total_cups, "total_revenue": float(total_revenue)}

@router.delete("/{sale_id}")
def delete_sale(sale_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    r = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
