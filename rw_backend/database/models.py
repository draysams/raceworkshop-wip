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

class Simulator(BaseModel):
    name = pw.CharField(unique=True)

class Track(BaseModel):
    id = pw.CharField(primary_key=True)
    internal_name = pw.CharField(index=True) 
    display_name = pw.CharField()
    short_name = pw.CharField()
    length_m = pw.FloatField(index=True)
    type = pw.CharField()
    image_path = pw.CharField()
    thumbnail_path = pw.CharField()

class Car(BaseModel):
    model = pw.CharField(unique=True)
    car_class = pw.CharField(index=True)

class Driver(BaseModel):
    name = pw.CharField(unique=True)

# --- NEW TABLE START ---
class Setup(BaseModel):
    """Stores a unique car setup for a specific car/track combination."""
    car = pw.ForeignKeyField(Car, backref='setups', on_delete='CASCADE')
    track = pw.ForeignKeyField(Track, backref='setups', on_delete='CASCADE')
    name = pw.CharField()
    # Checksum is used for fast, reliable lookup of an identical setup.
    checksum = pw.CharField(unique=True, index=True)
    # The full setup data is stored as a JSON text field for detailed viewing.
    summary_data = pw.TextField() # In SQLite, this is TEXT, which is fine for JSON
    setup_details = pw.TextField()
    weather_details = pw.TextField()
# --- NEW TABLE END ---

class Session(BaseModel):
    simulator = pw.ForeignKeyField(Simulator, backref='sessions', index=True)
    track = pw.ForeignKeyField(Track, backref='sessions', index=True)
    car = pw.ForeignKeyField(Car, backref='sessions', index=True)
    driver = pw.ForeignKeyField(Driver, backref='sessions', index=True)
    session_type = pw.CharField(index=True)
    started_at = pw.DateTimeField(default=datetime.now, index=True)
    ended_at = pw.DateTimeField(null=True)
    track_temp = pw.FloatField(null=True)
    air_temp = pw.FloatField(null=True)
    game_session_uid = pw.CharField(unique=True, null=True)

class Stint(BaseModel):
    session = pw.ForeignKeyField(Session, backref='stints', on_delete='CASCADE', index=True)
    # --- CHANGE START: Add link to the Setup table ---
    setup = pw.ForeignKeyField(Setup, backref='stints', null=True, on_delete='SET NULL')
    # --- CHANGE END ---
    stint_number = pw.IntegerField()
    started_on_lap = pw.IntegerField()
    ended_on_lap = pw.IntegerField(null=True)

class Lap(BaseModel):
    stint = pw.ForeignKeyField(Stint, backref='laps', on_delete='CASCADE', index=True)
    lap_number = pw.IntegerField()
    lap_time = pw.FloatField()
    sector1_time = pw.FloatField(null=True)
    sector2_time = pw.FloatField(null=True)
    sector3_time = pw.FloatField(null=True)
    is_valid = pw.BooleanField()
    timestamp = pw.DateTimeField(default=datetime.now)

class LapTelemetry(BaseModel):
    lap = pw.ForeignKeyField(Lap, backref='telemetry', on_delete='CASCADE', index=True)
    lap_dist = pw.FloatField()
    elapsed_time = pw.FloatField()
    pos_x = pw.FloatField(null=True)
    pos_y = pw.FloatField(null=True)
    pos_z = pw.FloatField(null=True)
    throttle = pw.FloatField()
    brake = pw.FloatField()
    steering = pw.FloatField()
    speed = pw.FloatField()
    rpm = pw.FloatField()
    gear = pw.IntegerField()
    fuel_level = pw.FloatField()
    drs_active = pw.IntegerField()
    tire_pressure_fl = pw.FloatField()
    tire_pressure_fr = pw.FloatField()
    tire_pressure_rl = pw.FloatField()
    tire_pressure_rr = pw.FloatField()
    tire_wear_fl = pw.FloatField()
    tire_wear_fr = pw.FloatField()
    tire_wear_rl = pw.FloatField()
    tire_wear_rr = pw.FloatField()
    tire_temp_fl_i = pw.FloatField()
    tire_temp_fl_m = pw.FloatField()
    tire_temp_fl_o = pw.FloatField()
    tire_temp_fr_i = pw.FloatField()
    tire_temp_fr_m = pw.FloatField()
    tire_temp_fr_o = pw.FloatField()
    tire_temp_rl_i = pw.FloatField()
    tire_temp_rl_m = pw.FloatField()
    tire_temp_rl_o = pw.FloatField()
    tire_temp_rr_i = pw.FloatField()
    tire_temp_rr_m = pw.FloatField()
    tire_temp_rr_o = pw.FloatField()