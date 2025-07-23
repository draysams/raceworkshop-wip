# main.py (DIAGNOSTIC VERSION FOR LAP DETECTION)

import webview
import os
import math
import threading
import json
from rw_backend.core.api_bridge import ApiBridge
from rw_backend.database.manager import initialize_database
from rw_backend.simulators.lmu.collector import LMUCollector
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

# --- Stateful Classes ---

class StatusManager:
    """A simple class to prevent spamming status logs."""
    def __init__(self):
        self.last_status = None
        self.last_message = None

    def log(self, status, message):
        if status != self.last_status or message != self.last_message:
            print(f"[Status Handler] Status: {status}, Message: {message}", flush=True)
            self.last_status = status
            self.last_message = message

# In main.py, replace the entire LiveProcessor class

class LiveProcessor:
    """
    Holds the state of the live session to detect changes,
    like the start of a new session or the completion of a lap.
    """
    def __init__(self, server: LiveDataServer):
        self.server = server
        self.last_player_data = {}
        self.last_session_id = -1
        # --- NEW STATE ---
        self.pending_lap_to_send = None

    def process_data(self, raw_data):
        telemetry = raw_data.get('telemetry')
        scoring = raw_data.get('scoring')
        scoring_info = scoring.mScoringInfo if scoring else None
        
        if not telemetry or not scoring_info: return

        player_vehicle_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
        if not player_vehicle_scoring: return

        current_session_id = scoring_info.mSession
        if self.last_session_id != current_session_id:
            print(f"[Processor] New session detected (ID: {current_session_id}). Resetting state.", flush=True)
            self.last_player_data = {}
            self.last_session_id = current_session_id
            self.pending_lap_to_send = None

        # --- REVISED LAP LOGIC ---
        # 1. Check if a lap was just completed IN THE CURRENT FRAME
        if player_vehicle_scoring.mLastLapTime > 0:
            # Check if this is a genuinely new lap we haven't processed yet
            if player_vehicle_scoring.mTotalLaps > self.last_player_data.get('mTotalLaps', -1):
                print(f"[Processor] Lap #{player_vehicle_scoring.mTotalLaps} data captured!", flush=True)
                
                # Construct the lap object RIGHT NOW while the data is valid
                self.pending_lap_to_send = {
                    "lapNumber": player_vehicle_scoring.mTotalLaps,
                    "lapTime": format_time_from_seconds(player_vehicle_scoring.mLastLapTime),
                    "lapTimeMs": player_vehicle_scoring.mLastLapTime * 1000,
                    "sector1": format_time_from_seconds(player_vehicle_scoring.mLastSector1),
                    "sector1Ms": player_vehicle_scoring.mLastSector1 * 1000,
                    "sector2": format_time_from_seconds(player_vehicle_scoring.mLastSector2 - player_vehicle_scoring.mLastSector1),
                    "sector2Ms": (player_vehicle_scoring.mLastSector2 - player_vehicle_scoring.mLastSector1) * 1000,
                    "sector3": format_time_from_seconds(player_vehicle_scoring.mLastLapTime - player_vehicle_scoring.mLastSector2),
                    "sector3Ms": (player_vehicle_scoring.mLastLapTime - player_vehicle_scoring.mLastSector2) * 1000,
                    "isValid": True, # Placeholder
                    "delta": 0, "fuelUsed": 0, "tyrePressure": {}, "speed": {},
                }
        
        # 2. Prepare the payload for this frame
        vel = telemetry.mLocalVel
        speed_ms = math.sqrt(vel.x**2 + vel.y**2 + vel.z**2)

        live_data = {
            "sessionId": current_session_id,
            "isConnected": True,
            "sessionType": map_game_phase_to_session_type(scoring_info.mGamePhase),
            "track": Cbytestring2Python(scoring_info.mTrackName),
            "car": Cbytestring2Python(telemetry.mVehicleName),
            "currentLap": player_vehicle_scoring.mTotalLaps + 1,
            "position": player_vehicle_scoring.mPlace,
            "fuelLevel": telemetry.mFuel,
            "tyrePressures": {
                "frontLeft": telemetry.mWheels[0].mPressure, "frontRight": telemetry.mWheels[1].mPressure,
                "rearLeft": telemetry.mWheels[2].mPressure, "rearRight": telemetry.mWheels[3].mPressure,
            },
            "trackTemp": scoring_info.mTrackTemp,
            "airTemp": scoring_info.mAmbientTemp,
            "sessionTimeRemaining": scoring_info.mEndET - scoring_info.mCurrentET,
            "bestLapTime": format_time_from_seconds(player_vehicle_scoring.mBestLapTime),
            "lastLap": self.pending_lap_to_send, # 3. Attach the pending lap
        }

        # 4. Critical Debug Log
        if self.pending_lap_to_send is not None:
            print("\n--- SENDING WEBSOCKET PAYLOAD WITH COMPLETED LAP ---", flush=True)
            print(json.dumps(live_data, indent=2), flush=True)
            print("--- END OF PAYLOAD ---\n", flush=True)

        self.server.push_data(live_data)
        
        # 5. Clear the pending lap after sending it to ensure it's only sent once
        if self.pending_lap_to_send is not None:
            self.pending_lap_to_send = None

        # 6. Update state for the next frame
        self.last_player_data = {field[0]: getattr(player_vehicle_scoring, field[0]) for field in player_vehicle_scoring._fields_}

def main():
    initialize_database()
    api_bridge = ApiBridge()
    
    print("[Main] Initializing live data services...", flush=True)
    live_data_server = LiveDataServer()
    live_data_server.start()
    
    live_processor = LiveProcessor(server=live_data_server)
    
    # --- Instantiate the new StatusManager ---
    status_manager = StatusManager()

    lmu_collector = LMUCollector(
        data_callback=live_processor.process_data,
        status_callback=status_manager.log # Use the manager's log method
    )
    lmu_collector.start()

    is_dev = os.getenv("RACEWORKSHOP_DEV_MODE") == "1"
    url = "http://localhost:5173" if is_dev else 'frontend/dist/index.html'
    
    print(f"--- Starting in {'DEVELOPMENT' if is_dev else 'PRODUCTION'} mode ---", flush=True)
    print(f"--- Loading UI from: {url} ---", flush=True)
    
    window = webview.create_window('RaceWorkshop', url, js_api=api_bridge, width=1600, height=1200, min_size=(1024, 768))
    
    def on_closing():
        print("[Main] Window is closing. Stopping collector...", flush=True)
        lmu_collector.stop()
    
    window.events.closing += on_closing
    webview.start(debug=is_dev)

if __name__ == '__main__':
    main()