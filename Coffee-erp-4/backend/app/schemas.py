from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class CollectorBase(BaseModel):
    collector_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    village: Optional[str] = None
    address: Optional[str] = None
    contract_status: Optional[str] = "non_contracted"
    payment_type: Optional[str] = "cash"
    preferred_source_type: Optional[str] = None
    bank_details: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = 3
    is_active: Optional[bool] = True


class CollectorCreate(CollectorBase):
    pass


class CollectorUpdate(BaseModel):
    collector_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    municipality: Optional[str] = None
    village: Optional[str] = None
    address: Optional[str] = None
    contract_status: Optional[str] = None
    payment_type: Optional[str] = None
    preferred_source_type: Optional[str] = None
    bank_details: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    is_active: Optional[bool] = None


class CollectorOut(CollectorBase, ORMBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CustomerBase(BaseModel):
    customer_name: str
    customer_type: Optional[str] = "cafe"
    phone: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = 0
    roast_preference: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = True


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    customer_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    payment_terms: Optional[str] = None
    credit_limit: Optional[float] = None
    roast_preference: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerOut(CustomerBase, ORMBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class ContactBase(BaseModel):
    customer_id: int
    full_name: str
    role_title: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: Optional[bool] = False
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    customer_id: Optional[int] = None
    full_name: Optional[str] = None
    role_title: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_primary: Optional[bool] = None
    notes: Optional[str] = None


class ContactOut(ContactBase, ORMBase):
    id: int
    created_at: Optional[datetime] = None


class LeadBase(BaseModel):
    lead_title: str
    source: Optional[str] = "referral"
    stage: Optional[str] = "new"
    expected_value: Optional[float] = 0
    probability: Optional[int] = 10
    expected_close_date: Optional[date] = None
    next_follow_up_date: Optional[date] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    owner_user_id: Optional[int] = None
    summary: Optional[str] = None
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    lead_title: Optional[str] = None
    source: Optional[str] = None
    stage: Optional[str] = None
    expected_value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[date] = None
    next_follow_up_date: Optional[date] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    owner_user_id: Optional[int] = None
    summary: Optional[str] = None
    notes: Optional[str] = None


class LeadOut(LeadBase, ORMBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TaskBase(BaseModel):
    title: str
    task_type: Optional[str] = "follow_up"
    status: Optional[str] = "open"
    priority: Optional[str] = "medium"
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    collector_id: Optional[int] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    quotation_id: Optional[int] = None
    order_id: Optional[int] = None
    description: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    task_type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    assigned_to: Optional[int] = None
    collector_id: Optional[int] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    quotation_id: Optional[int] = None
    order_id: Optional[int] = None
    description: Optional[str] = None


class TaskOut(TaskBase, ORMBase):
    id: int
    completed_at: Optional[datetime] = None
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None


class CommunicationBase(BaseModel):
    direction: Optional[str] = "outbound"
    channel: Optional[str] = "phone"
    subject: Optional[str] = None
    summary: Optional[str] = None
    communication_at: Optional[datetime] = None
    collector_id: Optional[int] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    quotation_id: Optional[int] = None
    order_id: Optional[int] = None


class CommunicationCreate(CommunicationBase):
    pass


class CommunicationUpdate(BaseModel):
    direction: Optional[str] = None
    channel: Optional[str] = None
    subject: Optional[str] = None
    summary: Optional[str] = None
    communication_at: Optional[datetime] = None
    collector_id: Optional[int] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    quotation_id: Optional[int] = None
    order_id: Optional[int] = None


class CommunicationOut(CommunicationBase, ORMBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None


class QuotationBase(BaseModel):
    quote_no: str
    status: Optional[str] = "draft"
    quote_date: Optional[date] = None
    valid_until: Optional[date] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    currency: Optional[str] = "NPR"
    subtotal: Optional[float] = 0
    discount_amount: Optional[float] = 0
    tax_amount: Optional[float] = 0
    total_amount: Optional[float] = 0
    line_items: Optional[list[Any]] = None
    notes: Optional[str] = None


class QuotationCreate(QuotationBase):
    pass


class QuotationUpdate(BaseModel):
    quote_no: Optional[str] = None
    status: Optional[str] = None
    quote_date: Optional[date] = None
    valid_until: Optional[date] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    lead_id: Optional[int] = None
    currency: Optional[str] = None
    subtotal: Optional[float] = None
    discount_amount: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    line_items: Optional[list[Any]] = None
    notes: Optional[str] = None


class QuotationOut(QuotationBase, ORMBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class OrderBase(BaseModel):
    order_no: str
    status: Optional[str] = "new"
    payment_status: Optional[str] = "pending"
    fulfillment_status: Optional[str] = "queued"
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    customer_id: int
    contact_id: Optional[int] = None
    quotation_id: Optional[int] = None
    product_type: Optional[str] = "roasted_bean"
    quantity_kg: Optional[float] = 0
    quantity_cups: Optional[int] = 0
    unit_price: Optional[float] = 0
    total_amount: Optional[float] = 0
    line_items: Optional[list[Any]] = None
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    order_no: Optional[str] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    fulfillment_status: Optional[str] = None
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    customer_id: Optional[int] = None
    contact_id: Optional[int] = None
    quotation_id: Optional[int] = None
    product_type: Optional[str] = None
    quantity_kg: Optional[float] = None
    quantity_cups: Optional[int] = None
    unit_price: Optional[float] = None
    total_amount: Optional[float] = None
    line_items: Optional[list[Any]] = None
    notes: Optional[str] = None


class OrderOut(OrderBase, ORMBase):
    id: int
    created_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
