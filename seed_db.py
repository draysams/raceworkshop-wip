# seed_db.py
from rw_backend.database.models import db, Session, Stint, Lap
from rw_backend.database.manager import initialize_database  # <-- IMPORT THE MANAGER
from datetime import datetime

def seed():
    # 1. Ensure tables exist BEFORE doing anything else
    initialize_database() # <-- CALL THE INITIALIZER

    # Now we can safely connect and modify the data
    db.connect()

    # Clear existing data to prevent duplicates from running the seeder multiple times
    Lap.delete().execute()
    Stint.delete().execute()
    Session.delete().execute()

    print("Seeding database with sample data...")

    # 2. Create a Session
    session1 = Session.create(
        track_name="Circuit de la Sarthe",
        session_type="Race",
        player_name="User",
        car_model="Porsche 963",
        car_class="Hypercar",
        started_at=datetime.now(),
        track_temp=30.5,
        air_temp=22.1
    )

    # 3. Create a Stint for that Session
    stint1 = Stint.create(
        session=session1,
        stint_number=1,
        started_on_lap=1
    )

    # 4. Create Laps for that Stint
    Lap.create(stint=stint1, lap_number=1, lap_time=225.123, sector1_time=72.456, sector2_time=75.234, sector3_time=77.433, is_valid=False)
    Lap.create(stint=stint1, lap_number=2, lap_time=208.456, sector1_time=67.123, sector2_time=71.234, sector3_time=70.099, is_valid=True)
    Lap.create(stint=stint1, lap_number=3, lap_time=209.112, sector1_time=67.500, sector2_time=71.500, sector3_time=70.112, is_valid=True)

    print("Database seeding complete.")
    db.close()

if __name__ == "__main__":
    seed()