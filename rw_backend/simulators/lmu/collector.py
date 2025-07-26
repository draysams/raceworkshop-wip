# rw_backend/simulators/lmu/collector.py

import threading
import time
from queue import Queue
from rw_backend.pyRfactor2SharedMemory.sharedMemoryAPI import SimInfoAPI

class LMUCollector(threading.Thread):
    """
    A simple, "dumb" worker thread that reads all shared memory data
    at high frequency and puts it onto a queue for processing.
    """
    # --- THE FIX ---
    # The __init__ signature now correctly accepts `raw_data_queue`.
    def __init__(self, raw_data_queue: Queue):
        super().__init__(daemon=True)
        self.raw_data_queue = raw_data_queue
        self._running = threading.Event()
        self.info = None

    def run(self):
        print("[Collector] Thread started.", flush=True)
        self._running.set()
        self.info = SimInfoAPI()

        while self._running.is_set():
            try:
                if self.info.isSharedMemoryAvailable():
                    # Bundle all data structures the EventGenerator might need
                    raw_data_bundle = {
                        'telemetry': self.info.playersVehicleTelemetry(),
                        'scoring': self.info.Rf2Scor,
                        'extended': self.info.Rf2Ext
                    }
                    self.raw_data_queue.put(raw_data_bundle)
                    
                    # Poll at a high frequency when on track, lower when not
                    if self.info.Rf2Ext.mInRealtimeFC:
                        time.sleep(1 / 60)
                    else:
                        time.sleep(1 / 5)
                else:
                    time.sleep(2)
            except Exception as e:
                print(f"[Collector] Error: {e}", flush=True)
                time.sleep(5)
        
        if self.info:
            self.info.close()

    def stop(self):
        self._running.clear()