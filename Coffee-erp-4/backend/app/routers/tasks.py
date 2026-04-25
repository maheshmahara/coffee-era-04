from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _task_row(db: Session, row: models.Task):
    collector = db.query(models.Collector).filter(models.Collector.id == row.collector_id).first() if row.collector_id else None
    customer = db.query(models.Customer).filter(models.Customer.id == row.customer_id).first() if row.customer_id else None
    contact = db.query(models.CustomerContact).filter(models.CustomerContact.id == row.contact_id).first() if row.contact_id else None
    lead = db.query(models.Lead).filter(models.Lead.id == row.lead_id).first() if row.lead_id else None
    quotation = db.query(models.Quotation).filter(models.Quotation.id == row.quotation_id).first() if row.quotation_id else None
    order = db.query(models.CustomerOrder).filter(models.CustomerOrder.id == row.order_id).first() if row.order_id else None
    return {
        'id': row.id,
        'title': row.title,
        'task_type': row.task_type,
        'status': row.status,
        'priority': row.priority,
        'due_date': row.due_date,
        'completed_at': row.completed_at,
        'assigned_to': row.assigned_to,
        'collector_id': row.collector_id,
        'collector_name': collector.collector_name if collector else None,
        'customer_id': row.customer_id,
        'customer_name': customer.customer_name if customer else None,
        'contact_id': row.contact_id,
        'contact_name': contact.full_name if contact else None,
        'lead_id': row.lead_id,
        'lead_title': lead.lead_title if lead else None,
        'quotation_id': row.quotation_id,
        'quote_no': quotation.quote_no if quotation else None,
        'order_id': row.order_id,
        'order_no': order.order_no if order else None,
        'description': row.description,
        'created_by': row.created_by,
        'created_at': row.created_at,
    }


@router.get('/')
def list_tasks(status: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Task)
    if status:
        query = query.filter(models.Task.status == status)
    rows = query.order_by(models.Task.due_date.asc().nulls_last(), models.Task.created_at.desc()).all()
    return [_task_row(db, row) for row in rows]


@router.post('/', response_model=schemas.TaskOut)
def create_task(data: schemas.TaskCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = models.Task(**data.model_dump(), created_by=current_user.id)
    if row.status == 'done' and not row.completed_at:
        row.completed_at = datetime.now(timezone.utc)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put('/{task_id}', response_model=schemas.TaskOut)
def update_task(task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not row:
        raise HTTPException(404, 'Task not found')
    payload = data.model_dump(exclude_unset=True)
    for key, value in payload.items():
        setattr(row, key, value)
    if payload.get('status') == 'done' and not row.completed_at:
        row.completed_at = datetime.now(timezone.utc)
    elif payload.get('status') and payload.get('status') != 'done':
        row.completed_at = None
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{task_id}')
def delete_task(task_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not row:
        raise HTTPException(404, 'Task not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
