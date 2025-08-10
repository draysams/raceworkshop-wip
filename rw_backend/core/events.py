# rw_backend/core/events.py

from dataclasses import dataclass

@dataclass
class Event:
    """Base class for all events."""
    pass

# --- Session Events ---
@dataclass
class SessionStarted(Event):
    uid: str
    simulator_id: int
    track_id: int
    car_id: int
    driver_id: int
    session_type: str
    track_temp: float
    air_temp: float

@dataclass
class SessionEnded(Event):
    pass

# --- Stint Events ---
@dataclass
class StintStarted(Event):
    lap_number: int
    # --- CHANGE START: Add setup_id ---
    setup_id: int | None
    # --- CHANGE END ---

@dataclass
class StintEnded(Event):
    lap_number: int

# --- Lap Events ---
@dataclass
class LapStarted(Event):
    lap_number: int

@dataclass
class LapCompleted(Event):
    lap_number: int
    lap_time: float
    sector1_time: float
    sector2_time: float
    sector3_time: float
    is_valid: bool

@dataclass
class LapAborted(Event):
    lap_number: int
    lap_time: float
    sector1_time: float
    sector2_time: float
    sector3_time: float
    is_valid: bool = False

# --- Live Data Events ---
@dataclass
class TelemetryUpdate(Event):
    payload: dict
    player_state: str