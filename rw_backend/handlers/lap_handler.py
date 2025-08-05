# rw_backend/handlers/lap_handler.py

from datetime import datetime
from rw_backend.core.events import LapCompleted, LapStarted
from rw_backend.database.models import Lap

def format_time_from_seconds(seconds: float | None) -> str | None:
        if seconds is None or seconds <= 0: return None
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}:{remaining_seconds:06.3f}"

class LapHandler:
    def __init__(self, stint_handler, event_queue): # <-- Add event_queue
        self.stint_handler = stint_handler
        self.event_queue = event_queue # <-- Store event_queue
        self.current_lap_model = None

    def handle_event(self, event):
        if isinstance(event, LapStarted):
            self.on_lap_started(event)
        elif isinstance(event, LapCompleted):
            self.on_lap_completed(event)

    def on_lap_started(self, event: LapStarted):
        stint = self.stint_handler.current_stint_model
        
        # --- THIS IS THE FIX (PART 1) ---
        # A new lap record should only be created if there is an active stint.
        # This prevents the creation of an erroneous Lap #4 after "Return to Garage",
        # because the stint has already been ended.
        if not stint:
            print("[LapHandler] INFO: Received LapStarted but no active stint. Ignoring.", flush=True)
            self.current_lap_model = None # Ensure state is clean
            return
        # --- END FIX ---
        
        # Guard against creating a duplicate lap record if events are ever misfired.
        if self.current_lap_model and self.current_lap_model.lap_number == event.lap_number:
            print(f"[LapHandler] INFO: Received duplicate LapStarted for lap #{event.lap_number}. Ignoring.", flush=True)
            return

        print(f"[LapHandler] Creating record for Lap #{event.lap_number} in database.", flush=True)
        self.current_lap_model = Lap.create(
            stint=stint, lap_number=event.lap_number,
            lap_time=-1.0, is_valid=False, timestamp=datetime.now()
        )

    def on_lap_completed(self, event: LapCompleted):
        if not self.current_lap_model or self.current_lap_model.lap_number != event.lap_number:
            print(f"[LapHandler] WARNING: Received LapCompleted for lap {event.lap_number}, but was expecting {self.current_lap_model.lap_number if self.current_lap_model else 'None'}. Finding record to update.", flush=True)
            stint = self.stint_handler.current_stint_model
            # If the stint is already closed, we can't find the lap. This is expected after "Return to Garage".
            if not stint:
                print(f"[LapHandler] INFO: No active stint to find lap {event.lap_number}.", flush=True)
                return
            self.current_lap_model = Lap.get_or_none(stint=stint, lap_number=event.lap_number)

        if not self.current_lap_model:
            print(f"[LapHandler] ERROR: Could not find Lap record for lap {event.lap_number} to update.", flush=True)
            return
            
        print(f"[LapHandler] Updating Lap #{event.lap_number} with final data.", flush=True)
        self.current_lap_model.lap_time = event.lap_time
        self.current_lap_model.sector1_time = event.sector1_time
        self.current_lap_model.sector2_time = event.sector2_time
        self.current_lap_model.sector3_time = event.sector3_time
        self.current_lap_model.is_valid = event.is_valid
        self.current_lap_model.save()

        
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