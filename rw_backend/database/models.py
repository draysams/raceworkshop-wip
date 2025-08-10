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

# ... (Simulator, Track, Car, Driver, Setup, Session, Stint, Lap models are unchanged) ...
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
class Setup(BaseModel):
    car = pw.ForeignKeyField(Car, backref='setups', on_delete='CASCADE')
    track = pw.ForeignKeyField(Track, backref='setups', on_delete='CASCADE')
    name = pw.CharField()
    checksum = pw.CharField(unique=True, index=True)
    summary_data = pw.TextField()
    setup_details = pw.TextField()
    weather_details = pw.TextField()
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
    setup = pw.ForeignKeyField(Setup, backref='stints', null=True, on_delete='SET NULL')
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
    """
    Stores a full snapshot of telemetry data at a specific point in a lap.
    This "wide" format is optimized for fast read performance for lap charts.
    """
    lap = pw.ForeignKeyField(Lap, backref='telemetry', on_delete='CASCADE', index=True)
    
    # Core Context
    lap_dist = pw.FloatField()
    elapsed_time = pw.FloatField()
    delta_time = pw.FloatField()
    
    # Position & Inputs
    pos_x = pw.FloatField(null=True)
    pos_y = pw.FloatField(null=True)
    pos_z = pw.FloatField(null=True)
    throttle = pw.FloatField()
    brake = pw.FloatField()
    steering = pw.FloatField()
    speed = pw.FloatField()
    rpm = pw.FloatField()
    gear = pw.IntegerField()
    
    # Car & Session State
    fuel_level = pw.FloatField()
    
    # --- CHANGE START: Add new session & vehicle context fields ---
    time_into_lap = pw.FloatField()
    lap_start_et = pw.FloatField()
    estimated_lap_time = pw.FloatField()
    track_edge = pw.FloatField()
    # --- CHANGE END ---
    
    # --- CHANGE START: Simplify Tire Temps, Add Brake Temps and Ride Height ---
    # Tire Pressures
    tire_pressure_fl = pw.FloatField()
    tire_pressure_fr = pw.FloatField()
    tire_pressure_rl = pw.FloatField()
    tire_pressure_rr = pw.FloatField()

    # Tire Wear
    tire_wear_fl = pw.FloatField()
    tire_wear_fr = pw.FloatField()
    tire_wear_rl = pw.FloatField()
    tire_wear_rr = pw.FloatField()

    # Tire Temps (Outer only)
    tire_temp_fl = pw.FloatField()
    tire_temp_fr = pw.FloatField()
    tire_temp_rl = pw.FloatField()
    tire_temp_rr = pw.FloatField()
    
    # Brake Temps
    brake_temp_fl = pw.FloatField()
    brake_temp_fr = pw.FloatField()
    brake_temp_rl = pw.FloatField()
    brake_temp_rr = pw.FloatField()

    # Ride Height
    ride_height_fl = pw.FloatField()
    ride_height_fr = pw.FloatField()
    ride_height_rl = pw.FloatField()
    ride_height_rr = pw.FloatField()
    # --- CHANGE END ---