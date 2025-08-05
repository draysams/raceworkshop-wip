# rw_backend/core/events.py

from dataclasses import dataclass

@dataclass
class Event:
    """Base class for all events."""
    pass

# --- Session Events ---
@dataclass
class SessionStarted(Event):
    # --- REFACTORED to carry IDs instead of raw strings ---
    uid: str
    simulator_id: int
    track_id: int
    car_id: int
    driver_id: int
    session_type: str
    track_temp: float
    air_temp: float
    # --- REFACTOR END ---

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
class LapStarted(Event):
    """Fired when a new lap begins (e.g., first outlap or after crossing S/F)."""
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
    """Fired when a lap is aborted mid-way (e.g., Return to Garage)."""
    lap_number: int
    lap_time: float
    sector1_time: float
    sector2_time: float
    sector3_time: float
    is_valid: bool = False

# --- Live Data Events ---
@dataclass
class TelemetryUpdate(Event):
    """Event to push live data to the UI."""
    payload: dict
    player_state: str