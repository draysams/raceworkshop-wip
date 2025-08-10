# rw_backend/database/manager.py

import json
from .models import db, Session, Stint, Lap, Simulator, Track, Car, Driver, LapTelemetry, Setup

# --- NEW: Seed data for the Track table ---
TRACK_SEED_DATA = [
    {"id": "9663f04f724a1b0434e6841dfd202a4defa56272", "internal_name": "Algarve International Circuit", "display_name": "6 Hours of Portimao", "short_name": "Algarve International Circuit 1.17", "length_km": 4.653, "type": "Road Course", "image": "/assets/tracks/9663f04f724a1b0434e6841dfd202a4defa56272", "thumbnail": "/assets/tracks/thumb_9663f04f724a1b0434e6841dfd202a4defa56272"},
    {"id": "8ae7579ea20fc55ff6304c95c2a8fb6094ab68d5", "internal_name": "Autodromo Enzo e Dino Ferrari", "display_name": "6 Hours of Imola", "short_name": "Autodromo Enzo e Dino Ferrari 1.17", "length_km": 4.909, "type": "Road Course", "image": "/assets/tracks/8ae7579ea20fc55ff6304c95c2a8fb6094ab68d5", "thumbnail": "/assets/tracks/thumb_8ae7579ea20fc55ff6304c95c2a8fb6094ab68d5"},
    {"id": "13c22b50ab2a1282c23e2f1eeacb46831e09a668", "internal_name": "Autodromo Nazionale Monza", "display_name": "6 Hours of Monza", "short_name": "Autodromo Nazionale Monza 1.19", "length_km": 5.793, "type": "Road Course", "image": "/assets/tracks/13c22b50ab2a1282c23e2f1eeacb46831e09a668", "thumbnail": "/assets/tracks/thumb_13c22b50ab2a1282c23e2f1eeacb46831e09a668"},
    {"id": "10d1d62a6d470dd4c44bb24b747a5db55d6a36ae", "internal_name": "Autodromo Nazionale Monza", "display_name": "Monza Curva Grande Circuit", "short_name": "Autodromo Nazionale Monza 1.19", "length_km": 5.793, "type": "Road Course", "image": "/assets/tracks/10d1d62a6d470dd4c44bb24b747a5db55d6a36ae", "thumbnail": "/assets/tracks/thumb_10d1d62a6d470dd4c44bb24b747a5db55d6a36ae"},
    {"id": "f916e33c6b7454f055961a25718fd1ee0af0c969", "internal_name": "Autódromo José Carlos Pace", "display_name": "Rolex 6 Hours Of Sao Paulo", "short_name": "Autódromo José Carlos Pace 1.19", "length_km": 4.309, "type": "Road Course", "image": "/assets/tracks/f916e33c6b7454f055961a25718fd1ee0af0c969", "thumbnail": "/assets/tracks/thumb_f916e33c6b7454f055961a25718fd1ee0af0c969"},
    {"id": "6d8a2f0b4de125563a59989747ea522c5fd40e69", "internal_name": "Bahrain International Circuit", "display_name": "8 Hours of Bahrain", "short_name": "Bahrain International Circuit 1.17", "length_km": 5.412, "type": "Road Course", "image": "/assets/tracks/6d8a2f0b4de125563a59989747ea522c5fd40e69", "thumbnail": "/assets/tracks/thumb_6d8a2f0b4de125563a59989747ea522c5fd40e69"},
    {"id": "b32ecc56d9b951ebbe7201042445833528a3617b", "internal_name": "Bahrain International Circuit", "display_name": "Bahrain Endurance Circuit", "short_name": "Bahrain International Circuit 1.17", "length_km": 6.299, "type": "Road Course", "image": "/assets/tracks/b32ecc56d9b951ebbe7201042445833528a3617b", "thumbnail": "/assets/tracks/thumb_b32ecc56d9b951ebbe7201042445833528a3617b"},
    {"id": "31384871bf42d731d15b5f120690feaf34210dca", "internal_name": "Bahrain International Circuit", "display_name": "Bahrain Outer Circuit", "short_name": "Bahrain International Circuit 1.17", "length_km": 3.543, "type": "Road Course", "image": "/assets/tracks/31384871bf42d731d15b5f120690feaf34210dca", "thumbnail": "/assets/tracks/thumb_31384871bf42d731d15b5f120690feaf34210dca"},
    {"id": "d4269abb7bb63a76d0a8e5a8f2b1835d21511fd4", "internal_name": "Bahrain International Circuit", "display_name": "Bahrain Paddock Circuit", "short_name": "Bahrain International Circuit 1.17", "length_km": 3.705, "type": "Road Course", "image": "/assets/tracks/d4269abb7bb63a76d0a8e5a8f2b1835d21511fd4", "thumbnail": "/assets/tracks/thumb_d4269abb7bb63a76d0a8e5a8f2b1835d21511fd4"},
    {"id": "d040705232de0927c1e6ab33fb3d9692e00ada43", "internal_name": "Circuit de Spa-Francorchamps", "display_name": "6 Hours of Spa-Francorchamps", "short_name": "Circuit de Spa-Francorchamps 1.19", "length_km": 7.004, "type": "Road Course", "image": "/assets/tracks/d040705232de0927c1e6ab33fb3d9692e00ada43", "thumbnail": "/assets/tracks/thumb_d040705232de0927c1e6ab33fb3d9692e00ada43"},
    {"id": "bc629b61d1822c06286d8a5081e81affcb41c848", "internal_name": "Circuit de Spa-Francorchamps", "display_name": "Circuit de Spa-Francorchamps Endurance", "short_name": "Circuit de Spa-Francorchamps 1.19", "length_km": 7.004, "type": "Road Course", "image": "/assets/tracks/bc629b61d1822c06286d8a5081e81affcb41c848", "thumbnail": "/assets/tracks/thumb_bc629b61d1822c06286d8a5081e81affcb41c848"},
    {"id": "5dc1da7be79d715f004cf0ed7ac9bec85770a657", "internal_name": "Circuit de la Sarthe", "display_name": "24 Heures du Mans", "short_name": "Circuit de la Sarthe 1.21", "length_km": 13.626, "type": "Road Course", "image": "/assets/tracks/5dc1da7be79d715f004cf0ed7ac9bec85770a657", "thumbnail": "/assets/tracks/thumb_5dc1da7be79d715f004cf0ed7ac9bec85770a657"},
    {"id": "09a8a8db86d1f913de3983e420b438eb30154e87", "internal_name": "Circuit de la Sarthe", "display_name": "Circuit de la Sarthe Mulsanne", "short_name": "Circuit de la Sarthe 1.21", "length_km": 13.626, "type": "Road Course", "image": "/assets/tracks/09a8a8db86d1f913de3983e420b438eb30154e87", "thumbnail": "/assets/tracks/thumb_09a8a8db86d1f913de3983e420b438eb30154e87"},
    {"id": "156d1dbef3436adb772a821ab514645e56d2655c", "internal_name": "Circuit of the Americas", "display_name": "COTA National Circuit", "short_name": "Circuit of the Americas 1.19", "length_km": 3.702, "type": "Road Course", "image": "/assets/tracks/156d1dbef3436adb772a821ab514645e56d2655c", "thumbnail": "/assets/tracks/thumb_156d1dbef3436adb772a821ab514645e56d2655c"},
    {"id": "abd25640dd07b722304d0a93eb35b71cc0f949a3", "internal_name": "Circuit of the Americas", "display_name": "Lone Star Le Mans", "short_name": "Circuit of the Americas 1.19", "length_km": 5.513, "type": "Road Course", "image": "/assets/tracks/abd25640dd07b722304d0a93eb35b71cc0f949a3", "thumbnail": "/assets/tracks/thumb_abd25640dd07b722304d0a93eb35b71cc0f949a3"},
    {"id": "52bf278258c59dba473e75774b23202e50d1fea8", "internal_name": "Fuji Speedway", "display_name": "6 Hours of Fuji", "short_name": "Fuji Speedway 1.19", "length_km": 4.563, "type": "Road Course", "image": "/assets/tracks/52bf278258c59dba473e75774b23202e50d1fea8", "thumbnail": "/assets/tracks/thumb_52bf278258c59dba473e75774b23202e50d1fea8"},
    {"id": "dbdfa8f1890c17eb4c36a10fe29329be6af7320a", "internal_name": "Fuji Speedway", "display_name": "Fuji Speedway Classic", "short_name": "Fuji Speedway 1.19", "length_km": 4.526, "type": "Road Course", "image": "/assets/tracks/dbdfa8f1890c17eb4c36a10fe29329be6af7320a", "thumbnail": "/assets/tracks/thumb_dbdfa8f1890c17eb4c36a10fe29329be6af7320a"},
    {"id": "698df207a079e5b93426402520d3bc96deb3ee8d", "internal_name": "Lusail International Circuit", "display_name": "Lusail Short Circuit", "short_name": "Lusail International Circuit 1.05", "length_km": 3.701, "type": "Road Course", "image": "/assets/tracks/698df207a079e5b93426402520d3bc96deb3ee8d", "thumbnail": "/assets/tracks/thumb_698df207a079e5b93426402520d3bc96deb3ee8d"},
    {"id": "c5c03e833ee1940031ed48be019d11f8fd38a314", "internal_name": "Lusail International Circuit", "display_name": "Qatar 1812KM", "short_name": "Lusail International Circuit 1.05", "length_km": 5.400, "type": "Road Course", "image": "/assets/tracks/c5c03e833ee1940031ed48be019d11f8fd38a314", "thumbnail": "/assets/tracks/thumb_c5c03e833ee1940031ed48be019d11f8fd38a314"},
    {"id": "d2cfca47d7490724a344003fd81abc3d78ac1d97", "internal_name": "Sebring International Raceway", "display_name": "1000 Miles of Sebring", "short_name": "Sebring International Raceway 1.17", "length_km": 6.019, "type": "Permanent Road Course", "image": "/assets/tracks/d2cfca47d7490724a344003fd81abc3d78ac1d97", "thumbnail": "/assets/tracks/thumb_d2cfca47d7490724a344003fd81abc3d78ac1d97"},
    {"id": "2bc88b0e119461606efd1f2585bd3cf3154e99b7", "internal_name": "Sebring International Raceway", "display_name": "Sebring School Circuit", "short_name": "Sebring International Raceway 1.17", "length_km": 3.219, "type": "Permanent Road Course", "image": "/assets/tracks/2bc88b0e119461606efd1f2585bd3cf3154e99b7", "thumbnail": "/assets/tracks/thumb_2bc88b0e119461606efd1f2585bd3cf3154e99b7"},
]

def _seed_tracks():
    """Seeds the Track table with official data if it's empty."""
    if Track.select().count() == 0:
        print("Seeding track database...", flush=True)
        
        # --- THIS IS THE FIX ---
        # The data preparation logic is now corrected to use the right keys.
        data_to_seed = [
            {
                'id': t['id'],
                'internal_name': t['internal_name'], # Use the correct 'internal_name' field
                'display_name': t['display_name'],
                'short_name': t['short_name'],
                'length_m': float(t['length_km']) * 1000, # Use the correct 'length_km' key
                'type': t['type'],
                'image_path': t['image'],
                'thumbnail_path': t['thumbnail']
            } for t in TRACK_SEED_DATA
        ]
        # --- END FIX ---
        
        with db.atomic():
            Track.insert_many(data_to_seed).execute()
        print("Track database seeded successfully.", flush=True)


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
        
        # --- CHANGE START: Call the seeding function ---
        _seed_tracks()
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