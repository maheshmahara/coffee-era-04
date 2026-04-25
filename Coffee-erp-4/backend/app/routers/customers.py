from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _customer_summary(db: Session, customer: models.Customer):
    contacts_count = db.query(func.count(models.CustomerContact.id)).filter(models.CustomerContact.customer_id == customer.id).scalar() or 0
    quotes_count = db.query(func.count(models.Quotation.id)).filter(models.Quotation.customer_id == customer.id).scalar() or 0
    orders_count = db.query(func.count(models.CustomerOrder.id)).filter(models.CustomerOrder.customer_id == customer.id).scalar() or 0
    open_tasks = db.query(func.count(models.Task.id)).filter(models.Task.customer_id == customer.id, models.Task.status != 'done').scalar() or 0
    last_order = db.query(func.max(models.CustomerOrder.order_date)).filter(models.CustomerOrder.customer_id == customer.id).scalar()
    return {
        'id': customer.id,
        'customer_name': customer.customer_name,
        'customer_type': customer.customer_type,
        'phone': customer.phone,
        'email': customer.email,
        'district': customer.district,
        'city': customer.city,
        'address': customer.address,
        'payment_terms': customer.payment_terms,
        'credit_limit': float(customer.credit_limit or 0),
        'roast_preference': customer.roast_preference,
        'notes': customer.notes,
        'is_active': customer.is_active,
        'created_by': customer.created_by,
        'created_at': customer.created_at,
        'updated_at': customer.updated_at,
        'contacts_count': int(contacts_count),
        'quotations_count': int(quotes_count),
        'orders_count': int(orders_count),
        'open_tasks_count': int(open_tasks),
        'last_order_date': last_order,
    }


@router.get('/')
def list_customers(search: str | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.Customer)
    if search:
        like = f"%{search.strip()}%"
        query = query.filter(or_(
            models.Customer.customer_name.ilike(like),
            models.Customer.email.ilike(like),
            models.Customer.phone.ilike(like),
            models.Customer.city.ilike(like),
            models.Customer.district.ilike(like),
        ))
    rows = query.order_by(models.Customer.customer_name.asc()).all()
    return [_customer_summary(db, row) for row in rows]


@router.post('/', response_model=schemas.CustomerOut)
def create_customer(data: schemas.CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = models.Customer(**data.model_dump(), created_by=current_user.id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get('/{customer_id}')
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(404, 'Customer not found')
    summary = _customer_summary(db, customer)
    summary['contacts'] = db.query(models.CustomerContact).filter(models.CustomerContact.customer_id == customer_id).order_by(models.CustomerContact.is_primary.desc(), models.CustomerContact.full_name.asc()).all()
    summary['quotations'] = db.query(models.Quotation).filter(models.Quotation.customer_id == customer_id).order_by(models.Quotation.quote_date.desc()).all()
    summary['orders'] = db.query(models.CustomerOrder).filter(models.CustomerOrder.customer_id == customer_id).order_by(models.CustomerOrder.order_date.desc()).all()
    summary['tasks'] = db.query(models.Task).filter(models.Task.customer_id == customer_id).order_by(models.Task.created_at.desc()).all()
    summary['communications'] = db.query(models.CommunicationLog).filter(models.CommunicationLog.customer_id == customer_id).order_by(models.CommunicationLog.communication_at.desc()).all()
    return summary


@router.put('/{customer_id}', response_model=schemas.CustomerOut)
def update_customer(customer_id: int, data: schemas.CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not row:
        raise HTTPException(404, 'Customer not found')
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{customer_id}')
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not row:
        raise HTTPException(404, 'Customer not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
