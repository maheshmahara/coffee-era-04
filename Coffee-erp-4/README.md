# ☕ Coffee ERP + CRM Bundle

This bundle upgrades the original Coffee ERP starter into a more complete **ERP + CRM** workspace.

## What is already in this bundle

Original ERP/operations modules are kept:
- batches
- procurement
- processing
- costing
- inventory
- sales
- expenses
- reports

Added CRM modules:
- collectors / suppliers
- customers / cafés
- contacts
- leads and opportunities
- follow-up tasks
- communication logs
- quotations / pipeline
- customer orders tied to contacts

## Backend additions

New backend files:
- `backend/app/schemas.py`
- `backend/app/routers/collectors.py`
- `backend/app/routers/customers.py`
- `backend/app/routers/contacts.py`
- `backend/app/routers/leads.py`
- `backend/app/routers/tasks.py`
- `backend/app/routers/communications.py`
- `backend/app/routers/quotations.py`
- `backend/app/routers/orders.py`

Updated backend files:
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/routers/procurement.py`
- `db/init.sql`
- `db/crm_upgrade.sql`

## Frontend additions

New CRM pages:
- `frontend/src/pages/Collectors.jsx`
- `frontend/src/pages/Customers.jsx`
- `frontend/src/pages/Contacts.jsx`
- `frontend/src/pages/Leads.jsx`
- `frontend/src/pages/Tasks.jsx`
- `frontend/src/pages/Communications.jsx`
- `frontend/src/pages/Quotations.jsx`
- `frontend/src/pages/Orders.jsx`
- reusable `frontend/src/components/CrudPage.jsx`

Updated frontend files:
- `frontend/src/App.jsx`
- `frontend/src/pages/Procurement.jsx`

## Fresh install

```bash
cd coffee-erp-crm
docker compose up --build
```

Open:
- app: `http://localhost`
- docs: `http://localhost/api/docs`

Default login:
- username: `admin`
- password: `secret`

## Upgrade an existing running deployment

If your database already exists, run the SQL in `db/crm_upgrade.sql` first.

Example:

```bash
docker compose exec db psql -U coffee -d coffee_erp -f /docker-entrypoint-initdb.d/crm_upgrade.sql
```

If that file is not mounted in your running container, copy the SQL from the repo and run it manually in psql.

Then restart backend:

```bash
docker compose restart backend
```

## Notes

This bundle is a practical starter, not a finished enterprise CRM. It gives you a working structure so you can continue building:
- richer permissions
- edit modals
- quote line item editor
- order fulfillment workflow
- customer statements / invoicing
- CRM analytics dashboard
- WhatsApp / email integration
