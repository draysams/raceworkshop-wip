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
    track_name: str
    session_type: str
    player_name: str
    car_model: str
    car_class: str
    track_temp: float
    air_temp: float

@dataclass
class SessionEnded(Event):
    pass

# --- Stint Events ---
@dataclass
class StintStarted(Event):
    lap_number: int

@dataclass
class StintEnded(Event):
    lap_number: int

# --- Lap Events ---
@dataclass
class LapCompleted(Event):
    lap_number: int
    lap_time: float
    sector1_time: float
    sector2_time: float
    sector3_time: float
    is_valid: bool

# --- Live Data Events ---
@dataclass
class TelemetryUpdate(Event):
    """Event to push live data to the UI."""
    payload: dict