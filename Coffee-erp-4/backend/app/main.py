from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, batches, procurement, processing, costing, inventory, sales, expenses, dashboard, reports
from app.routers import collectors, customers, contacts, leads, tasks, communications, quotations, orders

app = FastAPI(
    title="Coffee ERP + CRM System",
    description="Complete ERP and CRM for Coffee Value Chain - Fresh Cherry to Cup",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(batches.router, prefix="/api/batches", tags=["Batches"])
app.include_router(procurement.router, prefix="/api/procurement", tags=["Procurement"])
app.include_router(processing.router, prefix="/api/processing", tags=["Processing"])
app.include_router(costing.router, prefix="/api/costing", tags=["Costing"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# CRM routers
app.include_router(collectors.router, prefix="/api/collectors", tags=["Collectors"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])
app.include_router(leads.router, prefix="/api/leads", tags=["Leads"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(communications.router, prefix="/api/communications", tags=["Communications"])
app.include_router(quotations.router, prefix="/api/quotations", tags=["Quotations"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Coffee ERP + CRM API"}
