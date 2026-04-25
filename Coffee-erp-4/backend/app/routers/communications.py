from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _comm_row(db: Session, row: models.CommunicationLog):
    collector = db.query(models.Collector).filter(models.Collector.id == row.collector_id).first() if row.collector_id else None
    customer = db.query(models.Customer).filter(models.Customer.id == row.customer_id).first() if row.customer_id else None
    contact = db.query(models.CustomerContact).filter(models.CustomerContact.id == row.contact_id).first() if row.contact_id else None
    lead = db.query(models.Lead).filter(models.Lead.id == row.lead_id).first() if row.lead_id else None
    quotation = db.query(models.Quotation).filter(models.Quotation.id == row.quotation_id).first() if row.quotation_id else None
    order = db.query(models.CustomerOrder).filter(models.CustomerOrder.id == row.order_id).first() if row.order_id else None
    return {
        'id': row.id,
        'direction': row.direction,
        'channel': row.channel,
        'subject': row.subject,
        'summary': row.summary,
        'communication_at': row.communication_at,
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
        'created_by': row.created_by,
        'created_at': row.created_at,
    }


@router.get('/')
def list_communications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = db.query(models.CommunicationLog).order_by(models.CommunicationLog.communication_at.desc()).all()
    return [_comm_row(db, row) for row in rows]


@router.post('/', response_model=schemas.CommunicationOut)
def create_communication(data: schemas.CommunicationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payload = data.model_dump()
    row = models.CommunicationLog(**payload, created_by=current_user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put('/{comm_id}', response_model=schemas.CommunicationOut)
def update_communication(comm_id: int, data: schemas.CommunicationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CommunicationLog).filter(models.CommunicationLog.id == comm_id).first()
    if not row:
        raise HTTPException(404, 'Communication not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{comm_id}')
def delete_communication(comm_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CommunicationLog).filter(models.CommunicationLog.id == comm_id).first()
    if not row:
        raise HTTPException(404, 'Communication not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
