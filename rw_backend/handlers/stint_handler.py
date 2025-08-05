# rw_backend/handlers/stint_handler.py

from rw_backend.core.events import StintStarted, StintEnded, SessionStarted, SessionEnded, LapStarted
from rw_backend.database.models import Stint

class StintHandler:
    def __init__(self, session_handler, event_queue): # <-- Add event_queue
        self.session_handler = session_handler
        self.event_queue = event_queue # <-- Store event_queue
        self.current_stint_model = None

    def handle_event(self, event):
        if isinstance(event, SessionStarted):
            self.current_stint_model = None
        elif isinstance(event, StintStarted):
            self.on_stint_started(event)
        elif isinstance(event, StintEnded):
            self.on_stint_ended(event)
        elif isinstance(event, SessionEnded):
            self.on_session_ended()

    def on_stint_started(self, event: StintStarted):
        session = self.session_handler.current_session_model
        if not session:
            print("[StintHandler] WARNING: Received StintStarted but no active session.", flush=True)
            return

        stint_num = 1
        last_stint = Stint.select().where(Stint.session == session).order_by(Stint.stint_number.desc()).first()
        if last_stint:
            stint_num = last_stint.stint_number + 1
        
        print(f"[StintHandler] Starting Stint #{stint_num}", flush=True)
        self.current_stint_model = Stint.create(
            session=session,
            stint_number=stint_num,
            started_on_lap=event.lap_number
        )
        
        # --- EVENT CHAINING START ---
        # A new stint always begins with a new lap (the out-lap).
        # We fire this event here to guarantee it happens *after* the stint record is created.
        print(f"[StintHandler] Firing LapStarted for lap #{event.lap_number}", flush=True)
        self.event_queue.put(LapStarted(lap_number=event.lap_number))
        # --- EVENT CHAINING END ---

    def on_stint_ended(self, event: StintEnded):
        if self.current_stint_model:
            print(f"[StintHandler] Ending Stint #{self.current_stint_model.stint_number}", flush=True)
            self.current_stint_model.ended_on_lap = event.lap_number
            self.current_stint_model.save()
            self.current_stint_model = None
            
    def on_session_ended(self):
        if self.current_stint_model and self.current_stint_model.ended_on_lap is None:
            print("[StintHandler] Session ended, closing final open stint.", flush=True)
            self.on_stint_ended(StintEnded(lap_number=0))