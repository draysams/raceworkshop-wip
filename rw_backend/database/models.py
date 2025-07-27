# rw_backend/database/models.py

import peewee as pw
import os
from datetime import datetime

app_data_path = os.path.join(os.getenv('APPDATA'), 'RaceWorkshop')
os.makedirs(app_data_path, exist_ok=True)
db_path = os.path.join(app_data_path, 'raceworkshop.db')
db = pw.SqliteDatabase(db_path, pragmas={'foreign_keys': 1})

class BaseModel(pw.Model):
    class Meta:
        database = db

class Session(BaseModel):
    # Indexes for faster filtering on the Session History page
    track_name = pw.CharField(index=True)
    session_type = pw.CharField(index=True)
    player_name = pw.CharField()
    car_model = pw.CharField(index=True)
    car_class = pw.CharField(index=True)
    started_at = pw.DateTimeField(default=datetime.now, index=True)
    ended_at = pw.DateTimeField(null=True)
    track_temp = pw.FloatField(null=True)
    air_temp = pw.FloatField(null=True)
    game_session_uid = pw.CharField(unique=True, null=True)

class Stint(BaseModel):
    # --- CHANGE START: Added index for faster session detail loading ---
    session = pw.ForeignKeyField(Session, backref='stints', on_delete='CASCADE', index=True)
    # --- CHANGE END ---
    stint_number = pw.IntegerField()
    started_on_lap = pw.IntegerField()
    ended_on_lap = pw.IntegerField(null=True)

class Lap(BaseModel):
    # --- CHANGE START: Added index for faster stint/lap loading ---
    stint = pw.ForeignKeyField(Stint, backref='laps', on_delete='CASCADE', index=True)
    # --- CHANGE END ---
    lap_number = pw.IntegerField()
    lap_time = pw.FloatField()
    sector1_time = pw.FloatField(null=True)
    sector2_time = pw.FloatField(null=True)
    sector3_time = pw.FloatField(null=True)
    is_valid = pw.BooleanField()
    timestamp = pw.DateTimeField(default=datetime.now)

# --- NEW TABLES START ---

class TelemetryChannel(BaseModel):
    """A lookup table for all the types of telemetry we can capture."""
    name = pw.CharField(unique=True)

class TelemetrySnapshot(BaseModel):
    """Represents a single point in distance on a lap where telemetry was recorded."""
    lap = pw.ForeignKeyField(Lap, backref='snapshots', on_delete='CASCADE', index=True)
    lap_dist = pw.FloatField()

class TelemetryValue(BaseModel):
    """Stores the actual value for a specific channel at a specific snapshot."""
    snapshot = pw.ForeignKeyField(TelemetrySnapshot, backref='values', on_delete='CASCADE', index=True)
    channel = pw.ForeignKeyField(TelemetryChannel, backref='values', on_delete='CASCADE', index=True)
    value = pw.FloatField()

    class Meta:
        # Ensures we only have one value per channel for any given snapshot.
        primary_key = pw.CompositeKey('snapshot', 'channel')

# --- NEW TABLES END ---