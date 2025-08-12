# rw_backend/generators/event_generator.py

import threading
from queue import Queue
# --- CHANGE START: Removed LapStarted from imports ---
from rw_backend.core.events import TelemetryUpdate, LapAborted
# --- CHANGE END ---
from .detectors.session_detector import SessionDetector
from .detectors.lap_detector import LapDetector
from .detectors.stint_detector import StintDetector
from .detectors.player_state_detector import PlayerStateDetector
from .detectors.setup_detector import SetupDetector

class EventGenerator(threading.Thread):
    def __init__(self, raw_data_queue: Queue, event_queue: Queue):
        super().__init__(daemon=True)
        self.raw_data_queue = raw_data_queue
        self.event_queue = event_queue
        self._running = threading.Event()
        
        self.last_extended_data, self.last_player_data = {}, {}
        self.player_state_detector = PlayerStateDetector()
        self.player_state = self.player_state_detector.current_state
        self.session_detector = SessionDetector(self.event_queue)
        self.lap_detector = LapDetector(self.event_queue)
        self.stint_detector = StintDetector(self.event_queue)
        self.setup_detector = SetupDetector()
        self.current_session_car_id = None
        self.current_session_track_id = None

    def run(self):
        print("[Event Generator] Thread started.", flush=True)
        self._running.set()
        while self._running.is_set():
            raw_data = self.raw_data_queue.get()
            if raw_data is None: break

            extended = raw_data.get('extended')
            
            old_player_state = self.player_state
            new_state, session_data = self.session_detector.detect(raw_data, self.last_extended_data, self.last_player_data, old_player_state)
            
            if new_state:
                self.player_state = new_state
            
            # If the detector returned new session data, we update our internal state.
            if session_data:
                self.current_session_car_id = session_data['car_id']
                self.current_session_track_id = session_data['track_id']
                if self.player_state == "IN_GARAGE" and old_player_state == "UNKNOWN":
                    self.lap_detector.reset_for_new_session(raw_data.get('telemetry'))
             # --- CHANGE END ---

            if not extended or not extended.mSessionStarted:
                scoring = raw_data.get('scoring'); player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None) if scoring else None
                if player_scoring: self.last_player_data = {f[0]: getattr(player_scoring, f[0]) for f in player_scoring._fields_}
                if extended: self.last_extended_data = {f[0]: getattr(extended, f[0]) for f in extended._fields_}
                continue

            scoring = raw_data.get('scoring'); telemetry = raw_data.get('telemetry')
            player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None) if scoring else None
            if not player_scoring or not telemetry:
                if extended: self.last_extended_data = {f[0]: getattr(extended, f[0]) for f in extended._fields_}
                continue

            self.event_queue.put(TelemetryUpdate(payload=raw_data, player_state=self.player_state))

            old_state = self.player_state
            new_state = self.player_state_detector.update_and_get_state(player_scoring)
            self.player_state = new_state
            
            is_lap_completed = player_scoring.mTotalLaps > self.last_player_data.get('mTotalLaps', -1)
            state_has_changed = new_state != old_state
            pit_stop_completed = player_scoring.mNumPitstops > self.last_player_data.get('mNumPitstops', 0)
            
            # --- CHANGE START: Simplified event firing ---
            # The generator's responsibility is now only to fire the highest-level events.
            # Dependent events (like LapStarted) are now chained by the handlers.
            self.lap_detector.detect(player_scoring, self.last_player_data, telemetry, self.player_state)

            # --- CHANGE START: Pass setup_id to stint detector ---
            if pit_stop_completed:
                setup_id = self.setup_detector.get_setup_for_stint(self.current_session_car_id, self.current_session_track_id)
                self.stint_detector.handle_pit_stop(player_scoring, self.last_player_data, setup_id)
            
            if state_has_changed:
                if old_state == 'ON_TRACK' and new_state == 'IN_GARAGE' and not is_lap_completed:
                    provisional_data = self.lap_detector.get_provisional_lap_data(player_scoring, telemetry)
                    self.event_queue.put(LapAborted(**provisional_data))
                
                # We no longer need to fire LapStarted here.
                if old_state == 'IN_PITS' and new_state == 'ON_TRACK':
                    self.lap_detector.reset_for_next_lap(player_scoring.mLapStartET)

                # The orchestrator's job is to gather context and delegate.
                # We fetch the setup_id here and pass it unconditionally.
                setup_id = self.setup_detector.get_setup_for_stint(self.current_session_car_id, self.current_session_track_id)
                self.stint_detector.handle_state_transition(
                    self.player_state_detector.state_history, player_scoring, setup_id
                )
            # --- CHANGE END ---
            
            self.last_player_data = {f[0]: getattr(player_scoring, f[0]) for f in player_scoring._fields_}
            self.last_extended_data = {f[0]: getattr(extended, f[0]) for f in extended._fields_}

    def stop(self):
        self._running.clear()
        self.raw_data_queue.put(None)