# main.py (FINAL VERSION FOR CHUNK 3)

import webview
import os
import math
import threading
import json
import ctypes
from rw_backend.core.api_bridge import ApiBridge
from rw_backend.database.manager import initialize_database
from rw_backend.simulators.lmu.collector import LMUCollector
from rw_backend.core.live_data_server import LiveDataServer

def Cbytestring2Python(bytestring):
    """Helper function to decode C byte strings from the library."""
    try:
        return bytes(bytestring).partition(b'\0')[0].decode('utf-8').strip()
    except:
        return ""

def map_game_phase_to_session_type(game_phase: int) -> str:
    """Maps the integer mGamePhase to a human-readable session type."""
    phases = {
        5: "Practice",
        6: "Qualifying",
        7: "Warmup",
        8: "Race"
    }
    return phases.get(game_phase, "Unknown")

def simple_data_processor(raw_data, server: LiveDataServer):
    """
    Parses raw data from the collector and pushes a formatted
    LiveSessionData object to the WebSocket server.
    """
    telemetry = raw_data.get('telemetry')
    scoring = raw_data.get('scoring')
    scoring_info = scoring.mScoringInfo if scoring else None
    
    if not telemetry or not scoring_info:
        return

    player_vehicle_scoring = next((v for v in scoring.mVehicles if v.mIsPlayer), None)
    if not player_vehicle_scoring:
        return

    vel = telemetry.mLocalVel
    speed_ms = math.sqrt(vel.x**2 + vel.y**2 + vel.z**2)

    # --- Build Live Data Structure using CORRECT field names from the dump ---
    live_data = {
        "sessionId": scoring_info.mSession,
        "isConnected": True,
        "sessionType": map_game_phase_to_session_type(scoring_info.mGamePhase), # CORRECTED
        "track": Cbytestring2Python(scoring_info.mTrackName),
        "car": Cbytestring2Python(telemetry.mVehicleName),
        "currentLap": player_vehicle_scoring.mTotalLaps + 1,
        "position": player_vehicle_scoring.mPlace,
        "fuelLevel": telemetry.mFuel, # The original was sending 8400%, now it will be 84.0
        "tyrePressures": {
            "frontLeft": telemetry.mWheels[0].mPressure,
            "frontRight": telemetry.mWheels[1].mPressure,
            "rearLeft": telemetry.mWheels[2].mPressure,
            "rearRight": telemetry.mWheels[3].mPressure,
        },
        "weather": "N/A",
        "trackTemp": scoring_info.mTrackTemp,
        "airTemp": scoring_info.mAmbientTemp, # CORRECTED from mAirTemp
        "sessionTimeRemaining": scoring_info.mEndET - scoring_info.mCurrentET,
        "bestLapTime": format_time_from_seconds(player_vehicle_scoring.mBestLapTime),
        # lastLap will be implemented in Chunk 4
    }
    server.push_data(live_data)

def format_time_from_seconds(seconds: float) -> str | None:
    if seconds is None or seconds <= 0:
        return None
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}:{remaining_seconds:06.3f}"

def status_handler(status, message):
    print(f"[Status Handler] Status: {status}, Message: {message}", flush=True)

def main():
    initialize_database()
    api_bridge = ApiBridge()
    print("[Main] Initializing live data services...", flush=True)
    live_data_server = LiveDataServer()
    live_data_server.start()
    data_callback = lambda raw_data: simple_data_processor(raw_data, live_data_server)
    lmu_collector = LMUCollector(data_callback=data_callback, status_callback=status_handler)
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