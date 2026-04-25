from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _lead_row(db: Session, row: models.Lead):
    customer = db.query(models.Customer).filter(models.Customer.id == row.customer_id).first() if row.customer_id else None
    contact = db.query(models.CustomerContact).filter(models.CustomerContact.id == row.contact_id).first() if row.contact_id else None
    open_tasks = db.query(func.count(models.Task.id)).filter(models.Task.lead_id == row.id, models.Task.status != 'done').scalar() or 0
    quotes_count = db.query(func.count(models.Quotation.id)).filter(models.Quotation.lead_id == row.id).scalar() or 0
    return {
        'id': row.id,
        'lead_title': row.lead_title,
        'source': row.source,
        'stage': row.stage,
        'expected_value': float(row.expected_value or 0),
        'probability': row.probability,
        'expected_close_date': row.expected_close_date,
        'next_follow_up_date': row.next_follow_up_date,
        'customer_id': row.customer_id,
        'customer_name': customer.customer_name if customer else None,
        'contact_id': row.contact_id,
        'contact_name': contact.full_name if contact else None,
        'owner_user_id': row.owner_user_id,
        'summary': row.summary,
        'notes': row.notes,
        'created_at': row.created_at,
        'updated_at': row.updated_at,
        'open_tasks_count': int(open_tasks),
        'quotes_count': int(quotes_count),
    }


@router.get('/')
def list_leads(stage: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Lead)
    if stage:
        query = query.filter(models.Lead.stage == stage)
    rows = query.order_by(models.Lead.created_at.desc()).all()
    return [_lead_row(db, row) for row in rows]


@router.post('/', response_model=schemas.LeadOut)
def create_lead(data: schemas.LeadCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payload = data.model_dump()
    if not payload.get('owner_user_id'):
        payload['owner_user_id'] = current_user.id
    row = models.Lead(**payload)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get('/pipeline/summary')
def pipeline_summary(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = db.query(models.Lead.stage, func.count(models.Lead.id), func.coalesce(func.sum(models.Lead.expected_value), 0)).group_by(models.Lead.stage).all()
    return [{'stage': stage, 'count': int(count), 'value': float(value or 0)} for stage, count, value in data]


@router.get('/{lead_id}')
def get_lead(lead_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not row:
        raise HTTPException(404, 'Lead not found')
    result = _lead_row(db, row)
    result['tasks'] = db.query(models.Task).filter(models.Task.lead_id == lead_id).order_by(models.Task.created_at.desc()).all()
    result['communications'] = db.query(models.CommunicationLog).filter(models.CommunicationLog.lead_id == lead_id).order_by(models.CommunicationLog.communication_at.desc()).all()
    result['quotations'] = db.query(models.Quotation).filter(models.Quotation.lead_id == lead_id).order_by(models.Quotation.quote_date.desc()).all()
    return result


@router.put('/{lead_id}', response_model=schemas.LeadOut)
def update_lead(lead_id: int, data: schemas.LeadUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not row:
        raise HTTPException(404, 'Lead not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{lead_id}')
def delete_lead(lead_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not row:
        raise HTTPException(404, 'Lead not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
