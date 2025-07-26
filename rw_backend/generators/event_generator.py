# rw_backend/generators/event_generator.py

import threading
from queue import Queue
from rw_backend.core.events import (
    SessionStarted, SessionEnded, StintStarted, StintEnded, LapCompleted, TelemetryUpdate
)

# --- Helper functions ---
def Cbytestring2Python(bytestring):
    try: return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except: return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    phases = { 5: "Practice", 6: "Qualifying", 7: "Warmup", 8: "Race" }
    return phases.get(game_phase, "Unknown")

class EventGenerator(threading.Thread):
    """
    The brain of the daemon. Consumes raw data and produces high-level events
    using a robust, state-first processing order.
    """
    def __init__(self, raw_data_queue: Queue, event_queue: Queue):
        super().__init__(daemon=True)
        self.raw_data_queue = raw_data_queue
        self.event_queue = event_queue
        self._running = threading.Event()
        # State Tracking
        self.last_extended_data = {}
        self.last_player_data = {}
        self.player_state = "UNKNOWN" # ON_TRACK, IN_PITS, IN_GARAGE

# In rw_backend/generators/event_generator.py, inside the EventGenerator class:

    def run(self):
        print("[Event Generator] Thread started.", flush=True)
        self._running.set()
        while self._running.is_set():
            raw_data = self.raw_data_queue.get()
            if raw_data is None: break

            extended = raw_data.get('extended')
            
            # --- 1. SESSION DETECTION ---
            self.detect_session_events(raw_data)
            
            if not extended.mSessionStarted:
                self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_}
                continue

            # --- 2. DATA VALIDATION ---
            scoring = raw_data.get('scoring')
            telemetry = raw_data.get('telemetry') # Get telemetry here
            player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None) if scoring else None
            
            if not telemetry or not player_scoring:
                self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_}
                continue

            # --- 3. EMIT TELEMETRY UPDATE EVENT (NEW) ---
            # On every valid frame while in a session, emit an event with the raw data.
            # The LiveDataHandler will be responsible for formatting this.
            self.event_queue.put(TelemetryUpdate(payload=raw_data))

            # --- 4. DETECT DISCRETE EVENTS ---
            self.detect_lap_events(player_scoring)
            self.detect_stint_events(player_scoring, extended)

            # --- 5. UPDATE STATE FOR NEXT FRAME ---
            self.last_player_data = {field[0]: getattr(player_scoring, field[0]) for field in player_scoring._fields_}
            self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_}

    def detect_session_events(self, raw_data):
        extended = raw_data.get('extended')
        was_session_started = self.last_extended_data.get('mSessionStarted', False)
        
        # Transition TO a started session
        if extended.mSessionStarted and not was_session_started:
            scoring = raw_data.get('scoring')
            telemetry = raw_data.get('telemetry')
            scoring_info = scoring.mScoringInfo
            player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
            
            if scoring_info and player_scoring and telemetry:
                uid = f"{Cbytestring2Python(scoring_info.mTrackName)}-{scoring_info.mSession}"
                event = SessionStarted(
                    uid=uid, track_name=Cbytestring2Python(scoring_info.mTrackName),
                    session_type=map_game_phase_to_session_type(scoring_info.mGamePhase),
                    player_name=Cbytestring2Python(player_scoring.mDriverName),
                    car_model=Cbytestring2Python(telemetry.mVehicleName),
                    car_class=Cbytestring2Python(player_scoring.mVehicleClass),
                    track_temp=scoring_info.mTrackTemp, air_temp=scoring_info.mAmbientTemp
                )
                self.event_queue.put(event)
                self.player_state = "IN_GARAGE"

        # Transition FROM a started session
        if not extended.mSessionStarted and was_session_started:
            self.event_queue.put(SessionEnded())
            self.player_state = "UNKNOWN"

    def detect_stint_events(self, player_scoring, extended):
        # Determine the player's current physical state with corrected priority
        if player_scoring.mInGarageStall:
            new_state = "IN_GARAGE"
        elif player_scoring.mInPits:
            new_state = "IN_PITS"
        else:
            new_state = "ON_TRACK"
        
        if new_state != self.player_state:
            if new_state == "ON_TRACK" and self.player_state in ["IN_PITS", "IN_GARAGE"]:
                self.event_queue.put(StintStarted(lap_number=player_scoring.mTotalLaps))
            elif new_state in ["IN_PITS", "IN_GARAGE"] and self.player_state == "ON_TRACK":
                self.event_queue.put(StintEnded(lap_number=player_scoring.mTotalLaps))
            self.player_state = new_state

    def detect_lap_events(self, player_scoring):
        current_laps = player_scoring.mTotalLaps
        last_laps = self.last_player_data.get('mTotalLaps', -1)

        # Trigger is the increment of the lap counter
        if current_laps > last_laps:
            # Data for the completed lap is in the PREVIOUS frame's data
            prev_data = self.last_player_data
            if prev_data:
                lap_time = prev_data.get('mLastLapTime', -1.0)
                lap_num_to_log = prev_data.get('mTotalLaps', current_laps)
                
                event = LapCompleted(
                    lap_number=lap_num_to_log,
                    lap_time=lap_time,
                    sector1_time=prev_data.get('mLastSector1', -1.0),
                    sector2_time=prev_data.get('mLastSector2', -1.0) - prev_data.get('mLastSector1', 0),
                    sector3_time=lap_time - prev_data.get('mLastSector2', 0),
                    is_valid=(prev_data.get('mCountLapFlag') == 2)
                )
                self.event_queue.put(event)

    def stop(self):
        self._running.clear()
        self.raw_data_queue.put(None)