# rw_backend/handlers/live_data_handler.py

import math
from rw_backend.core.events import TelemetryUpdate, LapCompleted
from rw_backend.core.live_data_server import LiveDataServer

# --- Helper functions ---
def Cbytestring2Python(bytestring):
    try: return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except: return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    phases = { 5: "Practice", 6: "Qualifying", 7: "Warmup", 8: "Race" }
    return phases.get(game_phase, "Unknown")

def format_time_from_seconds(seconds: float | None) -> str | None:
    if seconds is None or seconds <= 0: return None
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}:{remaining_seconds:06.3f}"

class LiveDataHandler:
    """
    Handles events related to live data and pushes formatted
    payloads to the WebSocket server for the UI.
    """
    def __init__(self, server: LiveDataServer, session_handler, lap_handler):
        self.server = server
        self.session_handler = session_handler
        self.lap_handler = lap_handler
        self.last_lap_object_sent = None

    def handle_event(self, event):
        if isinstance(event, TelemetryUpdate):
            self.on_telemetry_update(event)
        elif isinstance(event, LapCompleted):
            # When a lap is completed, we format it and store it to be sent
            # with the next telemetry update.
            # We access the format_lap_for_ui method which should be part of LapHandler
            self.last_lap_object_sent = self.lap_handler.format_lap_for_ui(event)

    def on_telemetry_update(self, event: TelemetryUpdate):
        raw_data = event.payload
        telemetry = raw_data.get('telemetry')
        scoring = raw_data.get('scoring')
        
        # --- THE FIX: ADD THIS VALIDATION BLOCK ---
        # If we are not in a session, scoring_info will be None.
        # This guard clause prevents the handler from crashing the daemon.
        scoring_info = scoring.mScoringInfo if scoring else None
        if not scoring_info or not telemetry:
            # Optionally, send a "disconnected" or "in menus" status to the UI
            # For now, we just safely exit.
            return
        # --- END OF FIX ---

        player_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
        if not player_scoring: return

        vel = telemetry.mLocalVel
        speed_ms = math.sqrt(vel.x**2 + vel.y**2 + vel.z**2)
        
        session_id = self.session_handler.current_session_model.id if self.session_handler.current_session_model else -1

        live_data = {
            "sessionId": session_id,
            "isConnected": True,
            "sessionType": map_game_phase_to_session_type(scoring_info.mGamePhase),
            "track": Cbytestring2Python(scoring_info.mTrackName),
            "car": Cbytestring2Python(telemetry.mVehicleName),
            "currentLap": player_scoring.mTotalLaps + 1,
            "position": player_scoring.mPlace,
            "fuelLevel": telemetry.mFuel,
            "tyrePressures": {
                "frontLeft": telemetry.mWheels[0].mPressure, "frontRight": telemetry.mWheels[1].mPressure,
                "rearLeft": telemetry.mWheels[2].mPressure, "rearRight": telemetry.mWheels[3].mPressure,
            },
            "trackTemp": scoring_info.mTrackTemp,
            "airTemp": scoring_info.mAmbientTemp,
            "sessionTimeRemaining": scoring_info.mEndET - scoring_info.mCurrentET,
            "bestLapTime": format_time_from_seconds(player_scoring.mBestLapTime),
            "lastLap": self.last_lap_object_sent,
        }
        
        self.server.push_data(live_data)
        
        if self.last_lap_object_sent:
            self.last_lap_object_sent = None