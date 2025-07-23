# main.py

import webview
import os
import math
import threading
from rw_backend.core.api_bridge import ApiBridge
from rw_backend.database.manager import initialize_database
from rw_backend.simulators.lmu.collector import LMUCollector
from rw_backend.core.live_data_server import LiveDataServer

def simple_data_processor(raw_data, server: LiveDataServer):
    """
    This is a temporary processor for Chunk 3.
    It parses raw data from the collector and pushes a formatted
    LiveSessionData object to the WebSocket server.
    """
    telemetry = raw_data.get('telemetry')
    scoring = raw_data.get('scoring')

    if not telemetry or not scoring:
        return

    # --- Calculate Speed ---
    vel = telemetry.mLocalVel
    speed_ms = math.sqrt(vel.x**2 + vel.y**2 + vel.z**2)

    # --- Basic Live Data Structure ---
    # This structure must match the `LiveSessionData` TypeScript interface.
    live_data = {
        "sessionId": scoring.mSession,
        "isConnected": True,
        "sessionType": scoring.mSessionType.decode('utf-8', 'ignore').strip(),
        "track": scoring.mTrackName.decode('utf-8', 'ignore').strip(),
        "car": telemetry.mVehicleName.decode('utf-8', 'ignore').strip(),
        "currentLap": telemetry.mLapNumber,
        "position": scoring.mPosition,
        "fuelLevel": telemetry.mFuel * 100,  # Convert fraction to percentage
        "tyrePressures": {
            "frontLeft": telemetry.mTyrePressure[0],
            "frontRight": telemetry.mTyrePressure[1],
            "rearLeft": telemetry.mTyrePressure[2],
            "rearRight": telemetry.mTyrePressure[3],
        },
        "weather": "N/A",  # Placeholder
        "trackTemp": scoring.mTrackTemp,
        "airTemp": scoring.mAirTemp,
        "sessionTimeRemaining": "N/A", # Placeholder
        "bestLapTime": "N/A", # Placeholder
        # `lastLap` will be added in the full data processor in Chunk 4
    }
    server.push_data(live_data)

def status_handler(status, message):
    """Callback to print the collector's status to the console."""
    print(f"[Status Handler] Status: {status}, Message: {message}")

def main():
    """Main function to create and start the pywebview application."""
    initialize_database()
    api_bridge = ApiBridge()

    # --- START LIVE DATA SERVICES ---
    print("[Main] Initializing live data services...")
    live_data_server = LiveDataServer()
    live_data_server.start()

    # Create a lambda to pass the server instance to our simple processor
    # This links the collector's output to the server's input.
    data_callback = lambda raw_data: simple_data_processor(raw_data, live_data_server)

    lmu_collector = LMUCollector(data_callback=data_callback, status_callback=status_handler)
    lmu_collector.start()
    # --- END LIVE DATA SERVICES ---

    is_dev = os.getenv("RACEWORKSHOP_DEV_MODE") == "1"
    url = "http://localhost:5173" if is_dev else 'frontend/dist/index.html'

    print(f"--- Starting in {'DEVELOPMENT' if is_dev else 'PRODUCTION'} mode ---")
    print(f"--- Loading UI from: {url} ---")

    window = webview.create_window(
        'RaceWorkshop',
        url,
        js_api=api_bridge,
        width=1600,
        height=1200,
        min_size=(1024, 768)
    )

    # Define a function to be called when the window is closing
    def on_closing():
        print("[Main] Window is closing. Stopping collector...")
        lmu_collector.stop()

    # Bind the on_closing function to the window's closing event
    window.events.closing += on_closing

    webview.start(debug=is_dev)


if __name__ == '__main__':
    main()