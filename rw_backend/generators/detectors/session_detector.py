# rw_backend/generators/detectors/session_detector.py

from rw_backend.core.events import SessionStarted, SessionEnded
# --- CHANGE START: Import new models for lookups ---
from rw_backend.database.models import Simulator, Track, Car, Driver
# --- CHANGE END ---
import time

def Cbytestring2Python(bytestring):
    try: return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except: return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    phases = { 5: "Practice", 6: "Qualifying", 7: "Warmup", 8: "Race" }
    return phases.get(game_phase, "Unknown")

class SessionDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue

    def detect(self, raw_data, last_extended_data, last_player_data, player_state):
        extended = raw_data.get('extended')
        if not extended: return None

        was_session_started = last_extended_data.get('mSessionStarted', False)
        
        if extended.mSessionStarted and not was_session_started:
            self._start_new_session(raw_data)
            return "IN_GARAGE"

        if not extended.mSessionStarted and was_session_started:
            self.event_queue.put(SessionEnded())
            return "UNKNOWN"
        
        if extended.mSessionStarted and was_session_started:
            player_scoring = next((v for v in raw_data['scoring'].mVehicles if v.mIsPlayer), None)
            if not player_scoring: return None
            
            laps_reset = player_scoring.mTotalLaps == 0 and last_player_data.get('mTotalLaps', 0) > 0
            if player_state == "IN_GARAGE" and laps_reset:
                print("[SessionDetector] Restart detected. Cycling session.", flush=True)
                self.event_queue.put(SessionEnded())
                self._start_new_session(raw_data)
                return "IN_GARAGE" 
        
        return None

    def _start_new_session(self, raw_data):
        """
        Looks up/creates records in normalized tables and dispatches a SessionStarted event.
        """
        extended = raw_data.get('extended')
        scoring = raw_data.get('scoring')
        telemetry = raw_data.get('telemetry')
        scoring_info = scoring.mScoringInfo
        player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
        
        if scoring_info and player_scoring and telemetry and extended:
            # --- REFACTORED to use get_or_create on new tables ---
            simulator, _ = Simulator.get_or_create(name="Le Mans Ultimate")
            track, _ = Track.get_or_create(name=Cbytestring2Python(scoring_info.mTrackName))
            driver, _ = Driver.get_or_create(name=Cbytestring2Python(player_scoring.mDriverName))
            car, _ = Car.get_or_create(
                model=Cbytestring2Python(telemetry.mVehicleName),
                defaults={'car_class': Cbytestring2Python(player_scoring.mVehicleClass)}
            )

            ticks_uid = extended.mTicksSessionStarted
            uid = f"{track.name}-{ticks_uid}"
            
            event = SessionStarted(
                uid=uid,
                simulator_id=simulator.id,
                track_id=track.id,
                car_id=car.id,
                driver_id=driver.id,
                session_type=map_game_phase_to_session_type(scoring_info.mGamePhase),
                track_temp=scoring_info.mTrackTemp,
                air_temp=scoring_info.mAmbientTemp
            )
            self.event_queue.put(event)
            # --- REFACTOR END ---