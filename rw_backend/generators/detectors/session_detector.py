# rw_backend/generators/detectors/session_detector.py

from rw_backend.core.events import SessionStarted, SessionEnded

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

    def detect(self, raw_data, last_extended_data):
        extended = raw_data.get('extended')
        if not extended:
            return None # No change in player state

        was_session_started = last_extended_data.get('mSessionStarted', False)
        
        # --- Transition TO a started session ---
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
                return "IN_GARAGE" # Return the new player state

        # --- Transition FROM a started session ---
        if not extended.mSessionStarted and was_session_started:
            self.event_queue.put(SessionEnded())
            return "UNKNOWN" # Return the new player state
        
        return None # No change