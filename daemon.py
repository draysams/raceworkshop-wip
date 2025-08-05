# daemon.py

import time
from queue import Queue
from rw_backend.simulators.lmu.collector import LMUCollector
from rw_backend.generators.event_generator import EventGenerator
from rw_backend.database.manager import connect_db, close_db, initialize_database
from rw_backend.handlers.session_handler import SessionHandler
from rw_backend.handlers.stint_handler import StintHandler
from rw_backend.handlers.lap_handler import LapHandler
from rw_backend.handlers.live_data_handler import LiveDataHandler
from rw_backend.handlers.telemetry_handler import TelemetryHandler
from rw_backend.core.events import TelemetryUpdate, SessionEnded
from rw_backend.core.live_data_server import LiveDataServer

def run_daemon():
    print("[Daemon] Starting background process with Event-Driven Architecture...", flush=True)
    initialize_database()
    connect_db()
    raw_data_queue = Queue()
    event_queue = Queue()
    live_data_server = LiveDataServer()
    
    # --- CHANGE START: Pass event_queue to handlers ---
    session_handler = SessionHandler()
    # StintHandler and LapHandler now need access to the event queue to chain events.
    stint_handler = StintHandler(session_handler, event_queue)
    lap_handler = LapHandler(stint_handler, event_queue)
    live_data_handler = LiveDataHandler(live_data_server, session_handler, lap_handler)
    telemetry_handler = TelemetryHandler()

    handlers = [session_handler, stint_handler, lap_handler, live_data_handler, telemetry_handler]
    # --- CHANGE END ---
    
    collector = LMUCollector(raw_data_queue=raw_data_queue)
    event_generator = EventGenerator(raw_data_queue=raw_data_queue, event_queue=event_queue)
    
    collector.start()
    event_generator.start()
    live_data_server.start()
    
    print("[Daemon] Event bus running. Monitoring for events...", flush=True)
    try:
        while True:
            event = event_queue.get()
            if not isinstance(event, TelemetryUpdate):
                print(f"[{time.strftime('%H:%M:%S')}] EVENT DISPATCH: {type(event).__name__}", flush=True)
            for handler in handlers:
                handler.handle_event(event)
    except KeyboardInterrupt:
        print("\n[Daemon] Shutdown signal received.", flush=True)
    finally:
        collector.stop()
        event_generator.stop()
        final_event = SessionEnded()
        for handler in handlers:
            handler.handle_event(final_event)
        close_db()
        print("[Daemon] Services shut down. Exiting.", flush=True)

if __name__ == '__main__':
    run_daemon()