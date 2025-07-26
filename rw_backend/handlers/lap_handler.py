# rw_backend/handlers/lap_handler.py

from datetime import datetime
from rw_backend.core.events import LapCompleted
from rw_backend.database.models import Lap

def format_time_from_seconds(seconds: float | None) -> str | None:
        if seconds is None or seconds <= 0: return None
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}:{remaining_seconds:06.3f}"

class LapHandler:
    def __init__(self, stint_handler):
        self.stint_handler = stint_handler

    def handle_event(self, event):
        if isinstance(event, LapCompleted):
            self.on_lap_completed(event)

    def on_lap_completed(self, event: LapCompleted):
        stint = self.stint_handler.current_stint_model
        if not stint:
            print("[LapHandler] WARNING: Received LapCompleted but no active stint.", flush=True)
            return
            
        print(f"[LapHandler] Saving Lap #{event.lap_number} to database.", flush=True)
        Lap.create(
            stint=stint, lap_number=event.lap_number, lap_time=event.lap_time,
            sector1_time=event.sector1_time, sector2_time=event.sector2_time,
            sector3_time=event.sector3_time, is_valid=event.is_valid,
            timestamp=datetime.now()
        )

    # Add this formatting method
    def format_lap_for_ui(self, event: LapCompleted) -> dict:
        return { 
            "lapNumber": event.lap_number, 
            "lapTime": format_time_from_seconds(event.lap_time),
            "lapTimeMs": event.lap_time * 1000 if event.lap_time > 0 else 0,
            "sector1": format_time_from_seconds(event.sector1_time),
            "sector1Ms": (event.sector1_time or 0) * 1000,
            "sector2": format_time_from_seconds(event.sector2_time),
            "sector2Ms": (event.sector2_time or 0) * 1000,
            "sector3": format_time_from_seconds(event.sector3_time),
            "sector3Ms": (event.sector3_time or 0) * 1000,
            "isValid": event.is_valid, 
            "delta": 0, "fuelUsed": 0, "tyrePressure": {}, "speed": {} 
        }