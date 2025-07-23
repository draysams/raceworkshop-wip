# rw_backend/simulators/lmu/collector.py

import threading
import time
import math
from rw_backend.pyRfactor2SharedMemory.sharedMemoryAPI import SimInfoAPI

class LMUCollector(threading.Thread):
    """
    A thread that continuously polls Le Mans Ultimate's shared memory
    and passes the raw data to a callback function.
    """
    def __init__(self, data_callback, status_callback):
        super().__init__(daemon=True)
        self.data_callback = data_callback
        self.status_callback = status_callback
        self._running = threading.Event()
        self.info = None

    def run(self):
        print("[LMU Collector] Thread started.")
        self._running.set()
        
        # Initialize the SimInfoAPI within the thread itself.
        self.info = SimInfoAPI()

        while self._running.is_set():
            try:
                if not self.info.isSharedMemoryAvailable():
                    self.status_callback("disconnected", "Game not running or shared memory disabled.")
                    time.sleep(5) # Check less frequently if the game isn't running
                    continue

                if self.info.isOnTrack():
                    self.status_callback("connected", "Live on track")
                    
                    # Gather all relevant data structures from shared memory
                    telemetry = self.info.playersVehicleTelemetry()
                    scoring = self.info.playerScoring()
                    
                    # Bundle the raw data and send it for processing
                    raw_data_bundle = {
                        'telemetry': telemetry,
                        'scoring': scoring
                    }
                    self.data_callback(raw_data_bundle)
                    time.sleep(1 / 60) # High frequency updates for smooth telemetry
                else:
                    self.status_callback("connected", "In Menus / Spectating")
                    time.sleep(1) # Lower frequency when not in the car

            except Exception as e:
                print(f"[LMU Collector] Error in run loop: {e}")
                self.status_callback("error", "An error occurred in the collector.")
                time.sleep(5)
        
        print("[LMU Collector] Thread stopped.")
        if self.info:
            self.info.close()

    def stop(self):
        """Signals the thread to stop its execution loop."""
        print("[LMU Collector] Stop signal received.")
        self._running.clear()