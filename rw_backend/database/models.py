# rw_backend/database/models.py
import peewee as pw
import os
from datetime import datetime

# --- Database Configuration ---
# Construct a reliable path to the user's AppData/Roaming directory.
# This ensures the database is stored in a standard, user-specific location.
app_data_path = os.path.join(os.getenv('APPDATA'), 'RaceWorkshop')
os.makedirs(app_data_path, exist_ok=True)
db_path = os.path.join(app_data_path, 'raceworkshop.db')

# Initialize the database connection.
db = pw.SqliteDatabase(db_path, pragmas={'foreign_keys': 1})

# --- Base Model ---
# All our models will inherit from this, ensuring they use the same database.
class BaseModel(pw.Model):
    class Meta:
        database = db

# --- Table Models ---
# These classes directly map to the tables in our SQLite database.
class Session(BaseModel):
    track_name = pw.CharField()
    session_type = pw.CharField()
    player_name = pw.CharField()
    car_model = pw.CharField()
    car_class = pw.CharField()
    started_at = pw.DateTimeField(default=datetime.now)
    ended_at = pw.DateTimeField(null=True)
    track_temp = pw.FloatField(null=True)
    air_temp = pw.FloatField(null=True)

class Stint(BaseModel):
    session = pw.ForeignKeyField(Session, backref='stints', on_delete='CASCADE')
    stint_number = pw.IntegerField()
    started_on_lap = pw.IntegerField()
    ended_on_lap = pw.IntegerField(null=True)

class Lap(BaseModel):
    stint = pw.ForeignKeyField(Stint, backref='laps', on_delete='CASCADE')
    lap_number = pw.IntegerField()
    lap_time = pw.FloatField()  # Stored as seconds for precision
    sector1_time = pw.FloatField(null=True)
    sector2_time = pw.FloatField(null=True)
    sector3_time = pw.FloatField(null=True)
    is_valid = pw.BooleanField()
    timestamp = pw.DateTimeField(default=datetime.now)