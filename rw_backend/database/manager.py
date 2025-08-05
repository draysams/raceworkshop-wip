# rw_backend/database/manager.py

from .models import (
    db, Session, Stint, Lap, 
    Simulator, Track, Car, Driver,
    LapTelemetry # <-- Import the new model
)

def initialize_database():
    """
    Connects to the database and creates the necessary tables
    if they don't already exist.
    """
    try:
        db.connect()
      
        # --- CHANGE START: Update the table creation list ---
        db.create_tables([
            Simulator, Track, Car, Driver,
            Session, Stint, Lap, 
            LapTelemetry # <-- Add the new table, remove the old three
        ])
        # --- CHANGE END ---

        print("Database initialized successfully.", flush=True)
    except Exception as e:
        print(f"Error initializing database: {e}", flush=True)
    finally:
        if not db.is_closed():
            db.close()

def connect_db():
    """Connects to the database if the connection is closed."""
    if db.is_closed():
        db.connect()

def close_db():
    """Closes the database connection if it's open."""
    if not db.is_closed():
        db.close()