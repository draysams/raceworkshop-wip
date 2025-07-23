# rw_backend/simulators/lmu/collector.py

import threading
import time
from rw_backend.pyRfactor2SharedMemory.sharedMemoryAPI import SimInfoAPI

class LMUCollector(threading.Thread):
    def __init__(self, data_callback, status_callback):
        super().__init__(daemon=True)
        self.data_callback = data_callback
        self.status_callback = status_callback
        self._running = threading.Event()
        self.info = None

    def run(self):
        print("[LMU Collector] Thread started.", flush=True)
        self._running.set()
        
        self.info = SimInfoAPI()

        while self._running.is_set():
            try:
                if not self.info.isSharedMemoryAvailable():
                    self.status_callback("disconnected", "Game not running or shared memory disabled.")
                    time.sleep(5)
                    continue

                if self.info.isOnTrack():
                    self.status_callback("connected", "Live on track")
                    
                    # --- THE FIX ---
                    # 1. Get player-specific telemetry data
                    telemetry = self.info.playersVehicleTelemetry()
                    
                    # 2. Get the entire scoring structure, which contains session info AND all vehicles
                    scoring = self.info.Rf2Scor
                    
                    # Bundle the raw data structures and send them for processing
                    raw_data_bundle = {
                        'telemetry': telemetry,
                        'scoring': scoring  # Pass the whole scoring object
                    }
                    self.data_callback(raw_data_bundle)
                    time.sleep(1 / 60)
                else:
                    self.status_callback("connected", "In Menus / Spectating")
                    time.sleep(1)

            except Exception as e:
                print(f"[LMU Collector] Error in run loop: {e}", flush=True)
                self.status_callback("error", "An error occurred in the collector.")
                time.sleep(5)
        
        print("[LMU Collector] Thread stopped.", flush=True)
        if self.info:
            self.info.close()

    def stop(self):
        print("[LMU Collector] Stop signal received.", flush=True)
        self._running.clear()