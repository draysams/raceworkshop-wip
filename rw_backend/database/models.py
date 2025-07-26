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
    track_name = pw.CharField()
    session_type = pw.CharField()
    player_name = pw.CharField()
    car_model = pw.CharField()
    car_class = pw.CharField()
    started_at = pw.DateTimeField(default=datetime.now)
    ended_at = pw.DateTimeField(null=True)
    track_temp = pw.FloatField(null=True)
    air_temp = pw.FloatField(null=True)
    game_session_uid = pw.CharField(unique=True, null=True)

class Stint(BaseModel):
    session = pw.ForeignKeyField(Session, backref='stints', on_delete='CASCADE')
    stint_number = pw.IntegerField()
    started_on_lap = pw.IntegerField()
    ended_on_lap = pw.IntegerField(null=True)

class Lap(BaseModel):
    stint = pw.ForeignKeyField(Stint, backref='laps', on_delete='CASCADE')
    lap_number = pw.IntegerField()
    lap_time = pw.FloatField()
    sector1_time = pw.FloatField(null=True)
    sector2_time = pw.FloatField(null=True)
    sector3_time = pw.FloatField(null=True)
    is_valid = pw.BooleanField()
    timestamp = pw.DateTimeField(default=datetime.now)