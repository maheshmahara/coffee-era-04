from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()


class ProcurementCreate(BaseModel):
    batch_id: Optional[int] = None
    collector_id: Optional[int] = None
    source_type: str
    supplier_name: Optional[str] = None
    quantity_kg: float
    price_per_kg: float
    purchase_date: Optional[date] = None
    invoice_ref: Optional[str] = None
    transport_cost: float = 0
    notes: Optional[str] = None


class ProcurementUpdate(BaseModel):
    batch_id: Optional[int] = None
    collector_id: Optional[int] = None
    source_type: Optional[str] = None
    supplier_name: Optional[str] = None
    quantity_kg: Optional[float] = None
    price_per_kg: Optional[float] = None
    purchase_date: Optional[date] = None
    invoice_ref: Optional[str] = None
    transport_cost: Optional[float] = None
    notes: Optional[str] = None


def _row(db: Session, r: models.Procurement):
    collector = db.query(models.Collector).filter(models.Collector.id == r.collector_id).first() if r.collector_id else None
    return {
        'id': r.id,
        'batch_id': r.batch_id,
        'collector_id': r.collector_id,
        'collector_name': collector.collector_name if collector else None,
        'source_type': r.source_type,
        'supplier_name': r.supplier_name,
        'quantity_kg': r.quantity_kg,
        'price_per_kg': r.price_per_kg,
        'purchase_date': r.purchase_date,
        'invoice_ref': r.invoice_ref,
        'transport_cost': r.transport_cost,
        'notes': r.notes,
        'created_by': r.created_by,
        'created_at': r.created_at,
    }


@router.get('/')
def list_procurement(collector_id: Optional[int] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Procurement)
    if collector_id:
        query = query.filter(models.Procurement.collector_id == collector_id)
    rows = query.order_by(models.Procurement.created_at.desc()).all()
    return [_row(db, r) for r in rows]


@router.post('/')
def create_procurement(data: ProcurementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payload = data.dict()
    if payload.get('collector_id'):
        collector = db.query(models.Collector).filter(models.Collector.id == payload['collector_id']).first()
        if not collector:
            raise HTTPException(404, 'Collector not found')
        if not payload.get('supplier_name'):
            payload['supplier_name'] = collector.collector_name
    record = models.Procurement(**payload, created_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _row(db, record)


@router.get('/{record_id}')
def get_procurement(record_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(models.Procurement).filter(models.Procurement.id == record_id).first()
    if not r:
        raise HTTPException(404, 'Not found')
    return _row(db, r)


@router.put('/{record_id}')
def update_procurement(record_id: int, data: ProcurementUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(models.Procurement).filter(models.Procurement.id == record_id).first()
    if not r:
        raise HTTPException(404, 'Not found')
    payload = data.dict(exclude_unset=True)
    if payload.get('collector_id'):
        collector = db.query(models.Collector).filter(models.Collector.id == payload['collector_id']).first()
        if not collector:
            raise HTTPException(404, 'Collector not found')
        payload.setdefault('supplier_name', collector.collector_name)
    for key, value in payload.items():
        setattr(r, key, value)
    db.commit()
    db.refresh(r)
    return _row(db, r)


@router.delete('/{record_id}')
def delete_procurement(record_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(models.Procurement).filter(models.Procurement.id == record_id).first()
    if not r:
        raise HTTPException(404, 'Not found')
    db.delete(r)
    db.commit()
    return {'message': 'Deleted'}
