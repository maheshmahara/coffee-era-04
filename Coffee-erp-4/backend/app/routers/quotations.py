from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _quote_row(db: Session, row: models.Quotation):
    customer = db.query(models.Customer).filter(models.Customer.id == row.customer_id).first() if row.customer_id else None
    contact = db.query(models.CustomerContact).filter(models.CustomerContact.id == row.contact_id).first() if row.contact_id else None
    lead = db.query(models.Lead).filter(models.Lead.id == row.lead_id).first() if row.lead_id else None
    order_count = db.query(func.count(models.CustomerOrder.id)).filter(models.CustomerOrder.quotation_id == row.id).scalar() or 0
    return {
        'id': row.id,
        'quote_no': row.quote_no,
        'status': row.status,
        'quote_date': row.quote_date,
        'valid_until': row.valid_until,
        'customer_id': row.customer_id,
        'customer_name': customer.customer_name if customer else None,
        'contact_id': row.contact_id,
        'contact_name': contact.full_name if contact else None,
        'lead_id': row.lead_id,
        'lead_title': lead.lead_title if lead else None,
        'currency': row.currency,
        'subtotal': float(row.subtotal or 0),
        'discount_amount': float(row.discount_amount or 0),
        'tax_amount': float(row.tax_amount or 0),
        'total_amount': float(row.total_amount or 0),
        'line_items': row.line_items or [],
        'notes': row.notes,
        'created_by': row.created_by,
        'created_at': row.created_at,
        'updated_at': row.updated_at,
        'order_count': int(order_count),
    }


@router.get('/')
def list_quotations(status: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Quotation)
    if status:
        query = query.filter(models.Quotation.status == status)
    rows = query.order_by(models.Quotation.quote_date.desc(), models.Quotation.created_at.desc()).all()
    return [_quote_row(db, row) for row in rows]


@router.post('/', response_model=schemas.QuotationOut)
def create_quotation(data: schemas.QuotationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payload = data.model_dump()
    if payload.get('line_items') is None:
        payload['line_items'] = []
    row = models.Quotation(**payload, created_by=current_user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put('/{quote_id}', response_model=schemas.QuotationOut)
def update_quotation(quote_id: int, data: schemas.QuotationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Quotation).filter(models.Quotation.id == quote_id).first()
    if not row:
        raise HTTPException(404, 'Quotation not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{quote_id}')
def delete_quotation(quote_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Quotation).filter(models.Quotation.id == quote_id).first()
    if not row:
        raise HTTPException(404, 'Quotation not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
