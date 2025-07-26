# rw_backend/generators/event_generator.py

import threading
from queue import Queue
from rw_backend.core.events import TelemetryUpdate
from .detectors.session_detector import SessionDetector
from .detectors.lap_detector import LapDetector
from .detectors.stint_detector import StintDetector

class EventGenerator(threading.Thread):
    """
    The brain of the daemon. Consumes raw data, orchestrates event detection,
    and produces high-level events using a robust, state-first processing order.
    """
    def __init__(self, raw_data_queue: Queue, event_queue: Queue):
        super().__init__(daemon=True)
        self.raw_data_queue = raw_data_queue
        self.event_queue = event_queue
        self._running = threading.Event()
        
        # State Tracking
        self.last_extended_data = {}
        self.last_player_data = {}
        self.player_state = "UNKNOWN"  # ON_TRACK, IN_PITS, IN_GARAGE

        # Initialize Detectors
        self.session_detector = SessionDetector(self.event_queue)
        self.lap_detector = LapDetector(self.event_queue)
        self.stint_detector = StintDetector(self.event_queue)

    def run(self):
        print("[Event Generator] Thread started.", flush=True)
        self._running.set()
        while self._running.is_set():
            raw_data = self.raw_data_queue.get()
            if raw_data is None: break

            extended = raw_data.get('extended')
            
            # --- 1. SESSION DETECTION ---
            session_state_change = self.session_detector.detect(raw_data, self.last_extended_data)
            if session_state_change:
                self.player_state = session_state_change

            if not extended or not extended.mSessionStarted:
                self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_} if extended else {}
                continue

            # --- 2. DATA VALIDATION ---
            scoring = raw_data.get('scoring')
            # --- CHANGE START ---
            # We now need the telemetry object here to pass to the lap detector.
            telemetry = raw_data.get('telemetry')
            player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None) if scoring else None
            
            if not player_scoring or not telemetry:
            # --- CHANGE END ---
                self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_} if extended else {}
                continue

            # --- 3. EMIT LIVE TELEMETRY ---
            self.event_queue.put(TelemetryUpdate(payload=raw_data))

            # --- 4. DETECT DISCRETE EVENTS ---
            # --- CHANGE START ---
            # The telemetry object is now passed to the lap_detector.
            self.lap_detector.detect(player_scoring, self.last_player_data, telemetry)
            # --- CHANGE END ---
            
            stint_state_change = self.stint_detector.detect(player_scoring, self.last_player_data, self.player_state)
            if stint_state_change:
                self.player_state = stint_state_change

            # --- 5. UPDATE STATE FOR NEXT FRAME ---
            self.last_player_data = {field[0]: getattr(player_scoring, field[0]) for field in player_scoring._fields_}
            self.last_extended_data = {field[0]: getattr(extended, field[0]) for field in extended._fields_}

    def stop(self):
        self._running.clear()
        self.raw_data_queue.put(None)