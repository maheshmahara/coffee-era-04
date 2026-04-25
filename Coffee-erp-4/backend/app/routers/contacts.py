from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter()


def _contact_row(db: Session, contact: models.CustomerContact):
    customer = db.query(models.Customer).filter(models.Customer.id == contact.customer_id).first()
    return {
        'id': contact.id,
        'customer_id': contact.customer_id,
        'customer_name': customer.customer_name if customer else None,
        'full_name': contact.full_name,
        'role_title': contact.role_title,
        'phone': contact.phone,
        'email': contact.email,
        'is_primary': contact.is_primary,
        'notes': contact.notes,
        'created_at': contact.created_at,
    }


@router.get('/')
def list_contacts(customer_id: int | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(models.CustomerContact)
    if customer_id:
        query = query.filter(models.CustomerContact.customer_id == customer_id)
    rows = query.order_by(models.CustomerContact.created_at.desc()).all()
    return [_contact_row(db, row) for row in rows]


@router.post('/', response_model=schemas.ContactOut)
def create_contact(data: schemas.ContactCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not db.query(models.Customer).filter(models.Customer.id == data.customer_id).first():
        raise HTTPException(404, 'Customer not found')
    if data.is_primary:
        db.query(models.CustomerContact).filter(models.CustomerContact.customer_id == data.customer_id).update({'is_primary': False})
    row = models.CustomerContact(**data.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put('/{contact_id}', response_model=schemas.ContactOut)
def update_contact(contact_id: int, data: schemas.ContactUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CustomerContact).filter(models.CustomerContact.id == contact_id).first()
    if not row:
        raise HTTPException(404, 'Contact not found')
    payload = data.model_dump(exclude_unset=True)
    target_customer_id = payload.get('customer_id', row.customer_id)
    if payload.get('is_primary'):
        db.query(models.CustomerContact).filter(models.CustomerContact.customer_id == target_customer_id).update({'is_primary': False})
    for key, value in payload.items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return row


@router.delete('/{contact_id}')
def delete_contact(contact_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    row = db.query(models.CustomerContact).filter(models.CustomerContact.id == contact_id).first()
    if not row:
        raise HTTPException(404, 'Contact not found')
    db.delete(row)
    db.commit()
    return {'message': 'Deleted'}
