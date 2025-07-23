# rw_backend/database/manager.py
from .models import db, Session, Stint, Lap

def initialize_database():
    """
    Connects to the database and creates the necessary tables
    if they don't already exist.
    """
    try:
        db.connect()
        db.create_tables([Session, Stint, Lap])
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        if not db.is_closed():
            db.close()