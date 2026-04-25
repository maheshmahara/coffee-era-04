from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _order_row(db: Session, row: models.CustomerOrder):
    customer = db.query(models.Customer).filter(models.Customer.id == row.customer_id).first() if row.customer_id else None
    contact = db.query(models.CustomerContact).filter(models.CustomerContact.id == row.contact_id).first() if row.contact_id else None
    quotation = db.query(models.Quotation).filter(models.Quotation.id == row.quotation_id).first() if row.quotation_id else None
    return {
        'id': row.id,
        'order_no': row.order_no,
        'status': row.status,
        'payment_status': row.payment_status,
        'fulfillment_status': row.fulfillment_status,
        'order_date': row.order_date,
        'delivery_date': row.delivery_date,
        'customer_id': row.customer_id,
        'customer_name': customer.customer_name if customer else None,
        'contact_id': row.contact_id,
        'contact_name': contact.full_name if contact else None,
        'quotation_id': row.quotation_id,
        'quote_no': quotation.quote_no if quotation else None,
        'product_type': row.product_type,
        'quantity_kg': float(row.quantity_kg or 0),
        'quantity_cups': row.quantity_cups or 0,
        'unit_price': float(row.unit_price or 0),
        'total_amount': float(row.total_amount or 0),
        'line_items': row.line_items or [],
        'notes': row.notes,
        'created_by': row.created_by,
        'created_at': row.created_at,
        'updated_at': row.updated_at,
    }


@router.get('/')
def list_orders(status: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.CustomerOrder)
    if status:
        query = query.filter(models.CustomerOrder.status == status)
    rows = query.order_by(models.CustomerOrder.order_date.desc(), models.CustomerOrder.created_at.desc()).all()
    return [_order_row(db, row) for row in rows]


@router.post('/', response_model=schemas.OrderOut)
def create_order(data: schemas.OrderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    payload = data.model_dump()
    if payload.get('line_items') is None:
        payload['line_items'] = []
    row = models.CustomerOrder(**payload, created_by=current_user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put('/{order_id}', response_model=schemas.OrderOut)
def update_order(order_id: int, data: schemas.OrderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CustomerOrder).filter(models.CustomerOrder.id == order_id).first()
    if not row:
        raise HTTPException(404, 'Order not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{order_id}')
def delete_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CustomerOrder).filter(models.CustomerOrder.id == order_id).first()
    if not row:
        raise HTTPException(404, 'Order not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
