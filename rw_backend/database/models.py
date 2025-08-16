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

# --- NEW MODEL: A base model that includes automatic timestamps ---
class TimestampedModel(BaseModel):
    created_at = pw.DateTimeField(default=datetime.now)
    updated_at = pw.DateTimeField()

    def save(self, *args, **kwargs):
        self.updated_at = datetime.now()
        return super(TimestampedModel, self).save(*args, **kwargs)

# --- All subsequent models (except LapTelemetry) now inherit from TimestampedModel ---

class Simulator(TimestampedModel):
    name = pw.CharField(unique=True)

class Track(TimestampedModel):
    id = pw.CharField(primary_key=True)
    internal_name = pw.CharField(index=True) 
    display_name = pw.CharField()
    short_name = pw.CharField()
    length_m = pw.FloatField(index=True)
    type = pw.CharField()
    image_path = pw.CharField()
    thumbnail_path = pw.CharField()

class Car(TimestampedModel):
    id = pw.CharField(primary_key=True)
    internal_name = pw.CharField(unique=True, index=True)
    display_name = pw.CharField()
    model = pw.CharField(index=True)
    car_class = pw.CharField(index=True)
    season = pw.CharField()
    manufacturer = pw.CharField(index=True)
    engine = pw.CharField()
    thumbnail_url = pw.CharField()
    manufacturer_thumbnail_url = pw.CharField()

class Driver(TimestampedModel):
    name = pw.CharField(unique=True)

class Setup(TimestampedModel):
    car = pw.ForeignKeyField(Car, backref='setups', on_delete='CASCADE')
    track = pw.ForeignKeyField(Track, backref='setups', on_delete='CASCADE')
    name = pw.CharField()
    checksum = pw.CharField(unique=True, index=True)
    summary_data = pw.TextField()
    setup_details = pw.TextField()
    weather_details = pw.TextField()

class Session(TimestampedModel):
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

class Stint(TimestampedModel):
    session = pw.ForeignKeyField(Session, backref='stints', on_delete='CASCADE', index=True)
    setup = pw.ForeignKeyField(Setup, backref='stints', null=True, on_delete='SET NULL')
    stint_number = pw.IntegerField()
    started_on_lap = pw.IntegerField()
    ended_on_lap = pw.IntegerField(null=True)

class Lap(TimestampedModel):
    stint = pw.ForeignKeyField(Stint, backref='laps', on_delete='CASCADE', index=True)
    lap_number = pw.IntegerField()
    lap_time = pw.FloatField()
    sector1_time = pw.FloatField(null=True)
    sector2_time = pw.FloatField(null=True)
    sector3_time = pw.FloatField(null=True)
    is_valid = pw.BooleanField()
    # We remove the old 'timestamp' field as created_at replaces it.
    # timestamp = pw.DateTimeField(default=datetime.now)

# LapTelemetry inherits directly from BaseModel as it is a high-volume
# table and doesn't require updated_at timestamps.
class LapTelemetry(BaseModel):
    lap = pw.ForeignKeyField(Lap, backref='telemetry', on_delete='CASCADE', index=True)
    lap_dist = pw.FloatField()
    elapsed_time = pw.FloatField()
    delta_time = pw.FloatField()
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
    time_into_lap = pw.FloatField()
    lap_start_et = pw.FloatField()
    estimated_lap_time = pw.FloatField()
    track_edge = pw.FloatField()
    tire_pressure_fl = pw.FloatField()
    tire_pressure_fr = pw.FloatField()
    tire_pressure_rl = pw.FloatField()
    tire_pressure_rr = pw.FloatField()
    tire_wear_fl = pw.FloatField()
    tire_wear_fr = pw.FloatField()
    tire_wear_rl = pw.FloatField()
    tire_wear_rr = pw.FloatField()
    tire_temp_fl = pw.FloatField()
    tire_temp_fr = pw.FloatField()
    tire_temp_rl = pw.FloatField()
    tire_temp_rr = pw.FloatField()
    brake_temp_fl = pw.FloatField()
    brake_temp_fr = pw.FloatField()
    brake_temp_rl = pw.FloatField()
    brake_temp_rr = pw.FloatField()
    ride_height_fl = pw.FloatField()
    ride_height_fr = pw.FloatField()
    ride_height_rl = pw.FloatField()
    ride_height_rr = pw.FloatField()