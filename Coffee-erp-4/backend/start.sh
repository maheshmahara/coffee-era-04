#!/bin/sh
set -e

echo "Waiting for DB..."
python3 -c "
import time, psycopg2, os
url = os.environ.get('DATABASE_URL','')
for i in range(30):
    try:
        psycopg2.connect(url)
        print('DB ready')
        break
    except Exception as e:
        print(f'Waiting... ({e})')
        time.sleep(2)
"

echo "Seeding admin user..."
python3 -c "
from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()
existing = db.query(models.User).filter(models.User.username == 'admin').first()
if not existing:
    user = models.User(
        username='admin',
        email='admin@coffeeerp.com',
        hashed_password=hash_password('secret'),
        full_name='System Administrator',
        role='admin'
    )
    db.add(user)
    db.commit()
    print('Admin user created: admin / secret')
else:
    print('Admin user already exists')
db.close()
"

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
