from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), default="viewer")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InputParameter(Base):
    __tablename__ = "input_parameters"
    id = Column(Integer, primary_key=True)
    batch_name = Column(String(100), nullable=False)
    batch_date = Column(Date, default=func.current_date())
    created_by = Column(Integer, ForeignKey("users.id"))

    fresh_cherry_qty = Column(Numeric(12, 3), default=0)
    fresh_cherry_price = Column(Numeric(12, 2), default=0)
    dry_cherry_qty = Column(Numeric(12, 3), default=0)
    dry_cherry_price = Column(Numeric(12, 2), default=0)
    parchment_qty = Column(Numeric(12, 3), default=0)
    parchment_price = Column(Numeric(12, 2), default=0)
    green_bean_qty = Column(Numeric(12, 3), default=0)
    green_bean_price = Column(Numeric(12, 2), default=0)

    fresh_to_parchment_yield = Column(Numeric(6, 4), default=0.30)
    dry_to_green_yield = Column(Numeric(6, 4), default=0.50)
    parchment_to_green_yield = Column(Numeric(6, 4), default=0.75)
    green_to_roasted_yield = Column(Numeric(6, 4), default=0.85)
    cups_per_kg_roasted = Column(Numeric(8, 2), default=50)

    transport_cost_per_kg = Column(Numeric(10, 2), default=30)
    fresh_processing_cost_per_kg = Column(Numeric(10, 2), default=20)
    dry_cleaning_cost_per_kg = Column(Numeric(10, 2), default=10)
    hulling_electricity_per_kg = Column(Numeric(10, 2), default=25)
    hulling_labour_per_kg = Column(Numeric(10, 2), default=10)
    roasting_electricity_per_kg = Column(Numeric(10, 2), default=25)
    roasting_labour_per_kg = Column(Numeric(10, 2), default=10)
    packaging_cost_per_kg = Column(Numeric(10, 2), default=60)
    cafe_variable_cost_per_cup = Column(Numeric(10, 2), default=30)
    cup_selling_price = Column(Numeric(10, 2), default=130)
    annual_fixed_cost = Column(Numeric(14, 2), default=416000)

    status = Column(String(20), default="draft")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    costing_result = relationship("CostingResult", back_populates="batch", uselist=False)


class Collector(Base):
    __tablename__ = "collectors"
    id = Column(Integer, primary_key=True)
    collector_name = Column(String(100), nullable=False, index=True)
    phone = Column(String(30))
    email = Column(String(100))
    district = Column(String(100))
    municipality = Column(String(100))
    village = Column(String(100))
    address = Column(String(255))
    contract_status = Column(String(30), default="non_contracted")
    payment_type = Column(String(30), default="cash")
    preferred_source_type = Column(String(20))
    bank_details = Column(Text)
    notes = Column(Text)
    rating = Column(Integer, default=3)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    procurements = relationship("Procurement", back_populates="collector")


class Procurement(Base):
    __tablename__ = "procurement"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("input_parameters.id"))
    collector_id = Column(Integer, ForeignKey("collectors.id"))
    source_type = Column(String(20), nullable=False)
    supplier_name = Column(String(100))
    quantity_kg = Column(Numeric(12, 3), nullable=False)
    price_per_kg = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(Date, default=func.current_date())
    invoice_ref = Column(String(50))
    transport_cost = Column(Numeric(12, 2), default=0)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collector = relationship("Collector", back_populates="procurements")


class ProcessingStage(Base):
    __tablename__ = "processing_stages"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("input_parameters.id"))
    stage = Column(String(30), nullable=False)
    input_qty_kg = Column(Numeric(12, 3))
    output_qty_kg = Column(Numeric(12, 3))
    actual_yield = Column(Numeric(6, 4))
    electricity_cost = Column(Numeric(12, 2), default=0)
    labour_cost = Column(Numeric(12, 2), default=0)
    other_cost = Column(Numeric(12, 2), default=0)
    process_date = Column(Date, default=func.current_date())
    operator_name = Column(String(100))
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CostingResult(Base):
    __tablename__ = "costing_results"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("input_parameters.id"), unique=True)
    source_type = Column(String(20), nullable=False)
    roasted_output_kg = Column(Numeric(12, 4))
    cups_produced = Column(Numeric(12, 2))
    procurement_cost = Column(Numeric(14, 2))
    transport_cost = Column(Numeric(14, 2))
    processing_cost = Column(Numeric(14, 2))
    hulling_cost = Column(Numeric(14, 2))
    roasting_cost = Column(Numeric(14, 2))
    packaging_cost = Column(Numeric(14, 2))
    total_variable_cost = Column(Numeric(14, 2))
    cost_per_roasted_kg = Column(Numeric(12, 4))
    coffee_cost_per_cup = Column(Numeric(12, 4))
    cup_sales_revenue = Column(Numeric(14, 2))
    cafe_variable_cost = Column(Numeric(14, 2))
    contribution_before_fixed = Column(Numeric(14, 2))
    annual_fixed_cost = Column(Numeric(14, 2))
    net_profit = Column(Numeric(14, 2))
    net_margin = Column(Numeric(8, 6))
    breakeven_cups_per_day = Column(Numeric(10, 4))
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())

    batch = relationship("InputParameter", back_populates="costing_result")


class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True)
    item_type = Column(String(30), nullable=False)
    quantity_kg = Column(Numeric(12, 3), default=0)
    location = Column(String(100), default="Main Warehouse")
    batch_ref = Column(String(50))
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"))


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    customer_name = Column(String(120), nullable=False, index=True)
    customer_type = Column(String(30), default="cafe")
    phone = Column(String(30))
    email = Column(String(100))
    district = Column(String(100))
    city = Column(String(100))
    address = Column(String(255))
    payment_terms = Column(String(100))
    credit_limit = Column(Numeric(12, 2), default=0)
    roast_preference = Column(String(50))
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    contacts = relationship("CustomerContact", back_populates="customer", cascade="all, delete-orphan")


class CustomerContact(Base):
    __tablename__ = "customer_contacts"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_title = Column(String(80))
    phone = Column(String(30))
    email = Column(String(100))
    is_primary = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="contacts")


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True)
    lead_title = Column(String(120), nullable=False)
    source = Column(String(50), default="referral")
    stage = Column(String(30), default="new")
    expected_value = Column(Numeric(12, 2), default=0)
    probability = Column(Integer, default=10)
    expected_close_date = Column(Date)
    next_follow_up_date = Column(Date)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    contact_id = Column(Integer, ForeignKey("customer_contacts.id"))
    owner_user_id = Column(Integer, ForeignKey("users.id"))
    summary = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    title = Column(String(120), nullable=False)
    task_type = Column(String(40), default="follow_up")
    status = Column(String(30), default="open")
    priority = Column(String(20), default="medium")
    due_date = Column(Date)
    completed_at = Column(DateTime(timezone=True))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    collector_id = Column(Integer, ForeignKey("collectors.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    contact_id = Column(Integer, ForeignKey("customer_contacts.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    order_id = Column(Integer, ForeignKey("customer_orders.id"))
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CommunicationLog(Base):
    __tablename__ = "communication_logs"
    id = Column(Integer, primary_key=True)
    direction = Column(String(20), default="outbound")
    channel = Column(String(30), default="phone")
    subject = Column(String(150))
    summary = Column(Text)
    communication_at = Column(DateTime(timezone=True), server_default=func.now())
    collector_id = Column(Integer, ForeignKey("collectors.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    contact_id = Column(Integer, ForeignKey("customer_contacts.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    order_id = Column(Integer, ForeignKey("customer_orders.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Quotation(Base):
    __tablename__ = "quotations"
    id = Column(Integer, primary_key=True)
    quote_no = Column(String(50), unique=True, nullable=False)
    status = Column(String(30), default="draft")
    quote_date = Column(Date, default=func.current_date())
    valid_until = Column(Date)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    contact_id = Column(Integer, ForeignKey("customer_contacts.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"))
    currency = Column(String(10), default="NPR")
    subtotal = Column(Numeric(12, 2), default=0)
    discount_amount = Column(Numeric(12, 2), default=0)
    tax_amount = Column(Numeric(12, 2), default=0)
    total_amount = Column(Numeric(12, 2), default=0)
    line_items = Column(JSON, default=list)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CustomerOrder(Base):
    __tablename__ = "customer_orders"
    id = Column(Integer, primary_key=True)
    order_no = Column(String(50), unique=True, nullable=False)
    status = Column(String(30), default="new")
    payment_status = Column(String(30), default="pending")
    fulfillment_status = Column(String(30), default="queued")
    order_date = Column(Date, default=func.current_date())
    delivery_date = Column(Date)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    contact_id = Column(Integer, ForeignKey("customer_contacts.id"))
    quotation_id = Column(Integer, ForeignKey("quotations.id"))
    product_type = Column(String(50), default="roasted_bean")
    quantity_kg = Column(Numeric(10, 3), default=0)
    quantity_cups = Column(Integer, default=0)
    unit_price = Column(Numeric(10, 2), default=0)
    total_amount = Column(Numeric(12, 2), default=0)
    line_items = Column(JSON, default=list)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True)
    sale_date = Column(Date, default=func.current_date())
    product_type = Column(String(50), default="cafe_cup")
    quantity_cups = Column(Integer, default=0)
    quantity_kg = Column(Numeric(10, 3), default=0)
    unit_price = Column(Numeric(10, 2), nullable=False)
    customer_type = Column(String(50), default="retail")
    notes = Column(Text)
    recorded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    expense_date = Column(Date, default=func.current_date())
    main_title = Column(String(100), nullable=False)
    sub_title = Column(String(100))
    gl_group = Column(String(50))
    amount = Column(Numeric(14, 2), nullable=False)
    batch_id = Column(Integer, ForeignKey("input_parameters.id"))
    reference_no = Column(String(50))
    notes = Column(Text)
    recorded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
