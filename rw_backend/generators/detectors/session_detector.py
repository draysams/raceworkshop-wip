# rw_backend/generators/detectors/session_detector.py

from rw_backend.core.events import SessionStarted, SessionEnded
from rw_backend.database.models import Simulator, Track, Car, Driver
import time
import peewee as pw # Import peewee for the `fn.ABS` function

def Cbytestring2Python(bytestring):
    try: return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except: return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    phases = { 0: "Testday", 1: "Practice", 2: "Practice", 3: "Practice", 4: "Practice", 5: "Qualifying", 6: "Qualifying", 7: "Qualifying", 8: "Qualifying", 9: "Warmup", 10: "Race", 11: "Race", 12: "Race", 13: "Race" }
    return phases.get(game_phase, "Unknown")

class SessionDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue

    def detect(self, raw_data, last_extended_data, last_player_data, player_state):
        extended = raw_data.get('extended')
        if not extended:
            return None, None

        was_session_started = last_extended_data.get('mSessionStarted', False)
        
        if extended.mSessionStarted and not was_session_started:
            session_data = self._build_session_data(raw_data)
            if session_data:
                self.event_queue.put(SessionStarted(**session_data))
                return "IN_GARAGE", session_data
            return None, None

        if not extended.mSessionStarted and was_session_started:
            self.event_queue.put(SessionEnded())
            return "UNKNOWN", None
        
        if extended.mSessionStarted and was_session_started:
            player_scoring = next((v for v in raw_data['scoring'].mVehicles if v.mIsPlayer), None)
            if not player_scoring: return None, None
            
            laps_reset = player_scoring.mTotalLaps == 0 and last_player_data.get('mTotalLaps', 0) > 0
            if player_state == "IN_GARAGE" and laps_reset:
                print("[SessionDetector] Restart detected. Cycling session.", flush=True)
                self.event_queue.put(SessionEnded())
                session_data = self._build_session_data(raw_data)
                if session_data:
                    self.event_queue.put(SessionStarted(**session_data))
                    return "IN_GARAGE", session_data
                return None, None
        
        return None, None

    def _build_session_data(self, raw_data) -> dict | None:
        extended = raw_data.get('extended')
        scoring = raw_data.get('scoring')
        telemetry = raw_data.get('telemetry')
        scoring_info = scoring.mScoringInfo
        player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
        
        if not (scoring_info and player_scoring and telemetry and extended):
            return None

        simulator, _ = Simulator.get_or_create(name="Le Mans Ultimate")
        driver, _ = Driver.get_or_create(name=Cbytestring2Python(player_scoring.mDriverName))
        car_model_str = Cbytestring2Python(player_scoring.mVehicleName) or Cbytestring2Python(telemetry.mVehicleName)
        car, _ = Car.get_or_create(
            model=car_model_str,
            defaults={'car_class': Cbytestring2Python(player_scoring.mVehicleClass)}
        )
        
        track_name_from_sim = Cbytestring2Python(scoring_info.mTrackName)
        track_dist_from_sim = scoring_info.mLapDist
        
        track = (Track
                 .select()
                 .where(Track.display_name == track_name_from_sim)
                 .order_by(pw.fn.ABS(Track.length_m - track_dist_from_sim))
                 .first())
        
        if not track:
             # If no seeded track is found, create a new one as a fallback.
                print(f"[SessionDetector] WARNING: No seeded track found for '{track_name_from_sim}' with length {track_dist_from_sim:.0f}m. Creating new entry.", flush=True)
                track_id = f"unseeded-{track_name_from_sim}-{int(track_dist_from_sim)}"
                
                # --- THIS IS THE FIX ---
                # The 'defaults' dictionary must provide a value for ALL non-nullable columns.
                # We will provide sensible, empty placeholders.
                track, _ = Track.get_or_create(
                    id=track_id,
                    defaults={
                        'internal_name': track_name_from_sim,
                        'display_name': track_name_from_sim,
                        'short_name': track_name_from_sim,
                        'length_m': track_dist_from_sim,
                        'type': 'Unknown',
                        'image_path': '', # Provide empty string default
                        'thumbnail_path': '' # Provide empty string default
                    }
                )

        ticks_uid = extended.mTicksSessionStarted
        uid = f"{track.display_name}-{ticks_uid}"
        
        return {
            "uid": uid,
            "simulator_id": simulator.id,
            "track_id": track.id,
            "car_id": car.id,
            "driver_id": driver.id,
            "session_type": map_game_phase_to_session_type(scoring_info.mSession),
            "track_temp": scoring_info.mTrackTemp,
            "air_temp": scoring_info.mAmbientTemp
        }