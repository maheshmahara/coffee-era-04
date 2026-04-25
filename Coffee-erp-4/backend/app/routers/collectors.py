from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _collector_summary(db: Session, collector: models.Collector):
    procurement_count, total_qty, last_purchase = db.query(
        func.count(models.Procurement.id),
        func.coalesce(func.sum(models.Procurement.quantity_kg), 0),
        func.max(models.Procurement.purchase_date),
    ).filter(models.Procurement.collector_id == collector.id).one()
    open_tasks = db.query(func.count(models.Task.id)).filter(
        models.Task.collector_id == collector.id, models.Task.status != 'done'
    ).scalar() or 0
    comms = db.query(func.count(models.CommunicationLog.id)).filter(
        models.CommunicationLog.collector_id == collector.id
    ).scalar() or 0
    return {
        'id': collector.id,
        'collector_name': collector.collector_name,
        'phone': collector.phone,
        'email': collector.email,
        'district': collector.district,
        'municipality': collector.municipality,
        'village': collector.village,
        'address': collector.address,
        'contract_status': collector.contract_status,
        'payment_type': collector.payment_type,
        'preferred_source_type': collector.preferred_source_type,
        'bank_details': collector.bank_details,
        'notes': collector.notes,
        'rating': collector.rating,
        'is_active': collector.is_active,
        'created_by': collector.created_by,
        'created_at': collector.created_at,
        'updated_at': collector.updated_at,
        'procurement_count': int(procurement_count or 0),
        'total_procured_kg': float(total_qty or 0),
        'last_purchase_date': last_purchase,
        'open_tasks_count': int(open_tasks),
        'communication_count': int(comms),
    }


@router.get('/')
def list_collectors(search: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Collector)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(or_(
            models.Collector.collector_name.ilike(like),
            models.Collector.phone.ilike(like),
            models.Collector.email.ilike(like),
            models.Collector.district.ilike(like),
            models.Collector.municipality.ilike(like),
            models.Collector.village.ilike(like),
        ))
    rows = query.order_by(models.Collector.collector_name.asc()).all()
    return [_collector_summary(db, row) for row in rows]


@router.post('/', response_model=schemas.CollectorOut)
def create_collector(data: schemas.CollectorCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    collector = models.Collector(**data.model_dump(), created_by=current_user.id)
    db.add(collector)
    db.commit()
    db.refresh(collector)
    return collector


@router.get('/{collector_id}')
def get_collector(collector_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    collector = db.query(models.Collector).filter(models.Collector.id == collector_id).first()
    if not collector:
        raise HTTPException(404, 'Collector not found')
    summary = _collector_summary(db, collector)
    summary['procurements'] = db.query(models.Procurement).filter(models.Procurement.collector_id == collector_id).order_by(models.Procurement.purchase_date.desc()).all()
    summary['tasks'] = db.query(models.Task).filter(models.Task.collector_id == collector_id).order_by(models.Task.created_at.desc()).all()
    summary['communications'] = db.query(models.CommunicationLog).filter(models.CommunicationLog.collector_id == collector_id).order_by(models.CommunicationLog.communication_at.desc()).all()
    return summary


@router.put('/{collector_id}', response_model=schemas.CollectorOut)
def update_collector(collector_id: int, data: schemas.CollectorUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    collector = db.query(models.Collector).filter(models.Collector.id == collector_id).first()
    if not collector:
        raise HTTPException(404, 'Collector not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(collector, key, value)
    db.commit()
    db.refresh(collector)
    return collector


@router.delete('/{collector_id}')
def delete_collector(collector_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    collector = db.query(models.Collector).filter(models.Collector.id == collector_id).first()
    if not collector:
        raise HTTPException(404, 'Collector not found')
    db.delete(collector)
    db.commit()
    return {'message': 'Deleted'}
