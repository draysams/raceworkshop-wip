# rw_backend/database/manager.py

import json
import os
from datetime import datetime
from .models import db, Session, Stint, Lap, Simulator, Track, Car, Driver, LapTelemetry, Setup

def _seed_tracks():
    """Seeds the Track table from a JSON file if it's empty."""
    if Track.select().count() == 0:
        print("Seeding track database...", flush=True)
        try:
            # --- CHANGE START: Load data from JSON file ---
            with open('seed_track_data.json', 'r') as f:
                track_seed_data = json.load(f)
            
            now = datetime.now()
            data_to_seed = [
                {
                    'id': t['id'],
                    'internal_name': t['internal_name'],
                    'display_name': t['display_name'],
                    'short_name': t['short_name'],
                    'length_m': float(t['length_km']) * 1000, # Changed from 'length_km' to 'length'
                    'type': t['type'],
                    'image_path': t['image'],
                    'thumbnail_path': t['thumbnail'],
                    'updated_at': now,
                    'created_at': now
                } for t in track_seed_data
            ]
            
            with db.atomic():
                Track.insert_many(data_to_seed).execute()
            print("Track database seeded successfully.", flush=True)
            # --- CHANGE END ---
        except FileNotFoundError:
            print("WARNING: seed_track_data.json not found. Skipping track seeding.", flush=True)
        except Exception as e:
            print(f"ERROR: Failed to seed tracks: {e}", flush=True)

# --- NEW FUNCTION START ---
def _seed_cars():
    """Seeds the Car table from a JSON file if it's empty."""
    if Car.select().count() == 0:
        print("Seeding car database...", flush=True)
        try:
            with open('seed_cars_data.json', 'r') as f:
                car_seed_data = json.load(f)

            now = datetime.now()
            data_to_seed = [
                {
                    'id': c['id'],
                    'internal_name': c['internal_id'],
                    'display_name': c['displayName'],
                    'model': c['model'],
                    'car_class': c['class'],
                    'season': c['season'],
                    'manufacturer': c['manufacturer'],
                    'engine': c['engine'],
                    'thumbnail_url': c['thumbnail_url'],
                    'manufacturer_thumbnail_url': c['manufacturer_thumbnail_url'],
                    'updated_at': now,
                    'created_at': now
                } for c in car_seed_data
            ]

            with db.atomic():
                Car.insert_many(data_to_seed).execute()
            print("Car database seeded successfully.", flush=True)
        except FileNotFoundError:
            print("WARNING: seed_cars_data.json not found. Skipping car seeding.", flush=True)
        except Exception as e:
            print(f"ERROR: Failed to seed cars: {e}", flush=True)
# --- NEW FUNCTION END ---


def initialize_database():
    """
    Connects to the database, creates tables, and seeds them with initial data.
    """
    try:
        db.connect()
      
        db.create_tables([
            Simulator, Track, Car, Driver,
            Session, Stint, Lap, 
            LapTelemetry,
            Setup
        ])
        
        # --- CHANGE START: Call both seeding functions ---
        _seed_tracks()
        _seed_cars()
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