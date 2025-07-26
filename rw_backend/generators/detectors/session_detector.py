# rw_backend/generators/detectors/session_detector.py

from rw_backend.core.events import SessionStarted, SessionEnded
import time

# --- Helper functions ---
def Cbytestring2Python(bytestring):
    try: return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except: return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    phases = { 5: "Practice", 6: "Qualifying", 7: "Warmup", 8: "Race" }
    return phases.get(game_phase, "Unknown")

class SessionDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue

    # --- CHANGE START ---
    # The detect method signature is updated to receive more context from the orchestrator.
    def detect(self, raw_data, last_extended_data, last_player_data, player_state):
    # --- CHANGE END ---
        extended = raw_data.get('extended')
        if not extended:
            return None # No data, no change

        was_session_started = last_extended_data.get('mSessionStarted', False)
        
        # --- Main Trigger 1: A new session starts from the main menu ---
        if extended.mSessionStarted and not was_session_started:
            self._start_new_session(raw_data)
            return "IN_GARAGE" # Return the new player state

        # --- Main Trigger 2: The session has completely ended (e.g., returned to main menu) ---
        if not extended.mSessionStarted and was_session_started:
            self.event_queue.put(SessionEnded())
            return "UNKNOWN" # Return the new player state
        
        # --- CHANGE START ---
        # --- Main Trigger 3: A "Restart" has been detected from within the garage ---
        if extended.mSessionStarted and was_session_started:
            player_scoring = next((v for v in raw_data['scoring'].mVehicles if v.mIsPlayer), None)
            if not player_scoring:
                return None
            
            # The key condition for a restart: laps have reset to 0 while in the garage.
            laps_reset = player_scoring.mTotalLaps == 0 and last_player_data.get('mTotalLaps', 0) > 0
            
            if player_state == "IN_GARAGE" and laps_reset:
                # The user clicked "Restart". We must end the old session and start a new one.
                print("[SessionDetector] Restart detected. Cycling session.", flush=True)
                self.event_queue.put(SessionEnded())
                self._start_new_session(raw_data)
                # The state remains IN_GARAGE, but it's a new logical session.
                return "IN_GARAGE" 
        # --- CHANGE END ---

        return None # No change

    def _start_new_session(self, raw_data):
        """Helper method to create and dispatch a new SessionStarted event."""
        extended = raw_data.get('extended')
        scoring = raw_data.get('scoring')
        telemetry = raw_data.get('telemetry')
        scoring_info = scoring.mScoringInfo
        player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
        
        if scoring_info and player_scoring and telemetry and extended:
            # --- CHANGE START ---
            # The UID is now built from the reliable TicksSessionStarted value,
            # ensuring it's unique for every logical session.
            ticks_uid = extended.mTicksSessionStarted
            uid = f"{Cbytestring2Python(scoring_info.mTrackName)}-{ticks_uid}"
            # --- CHANGE END ---
            
            event = SessionStarted(
                uid=uid,
                track_name=Cbytestring2Python(scoring_info.mTrackName),
                session_type=map_game_phase_to_session_type(scoring_info.mGamePhase),
                player_name=Cbytestring2Python(player_scoring.mDriverName),
                car_model=Cbytestring2Python(telemetry.mVehicleName),
                car_class=Cbytestring2Python(player_scoring.mVehicleClass),
                track_temp=scoring_info.mTrackTemp,
                air_temp=scoring_info.mAmbientTemp
            )
            self.event_queue.put(event)