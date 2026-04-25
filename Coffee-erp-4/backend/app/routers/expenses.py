from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter()

GL_GROUPS = [
    "COGS - Raw Material",
    "COGS - Processing loss",
    "COGS - Yield adjustment",
    "COGS - Logistics",
    "COGS - Processing",
    "COGS - Utilities",
    "COGS - Labour",
    "COGS - Packaging",
    "COGS - Café consumables",
    "Fixed - Rent",
    "Fixed - Salaries",
    "Fixed - Equipment depreciation",
    "Fixed - Utilities",
    "Fixed - Other",
]

class ExpenseCreate(BaseModel):
    expense_date: Optional[date] = None
    main_title: str
    sub_title: Optional[str] = None
    gl_group: Optional[str] = None
    amount: float
    batch_id: Optional[int] = None
    reference_no: Optional[str] = None
    notes: Optional[str] = None

@router.get("/gl-groups")
def get_gl_groups():
    return GL_GROUPS

@router.get("/")
def list_expenses(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(models.Expense).order_by(models.Expense.expense_date.desc()).all()

@router.post("/")
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    record = models.Expense(**data.dict(), recorded_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/by-gl")
def expenses_by_gl(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    rows = db.query(
        models.Expense.gl_group,
        func.sum(models.Expense.amount).label("total")
    ).group_by(models.Expense.gl_group).all()
    return [{"gl_group": r.gl_group, "total": float(r.total)} for r in rows]

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    r = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not r:
        raise HTTPException(404, "Not found")
    db.delete(r)
    db.commit()
    return {"message": "Deleted"}
