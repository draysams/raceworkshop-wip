# rw_backend/handlers/session_handler.py

from datetime import datetime
from rw_backend.core.events import SessionStarted, SessionEnded
from rw_backend.database.models import Session

class SessionHandler:
    def __init__(self):
        self.current_session_model = None
        
    def handle_event(self, event):
        if isinstance(event, SessionStarted):
            self.on_session_started(event)
        elif isinstance(event, SessionEnded):
            self.on_session_ended(event)

    def on_session_started(self, event: SessionStarted):
        print(f"[SessionHandler] Received SessionStarted event for UID: {event.uid}", flush=True)
        
        # --- REFACTORED to use IDs from the event ---
        session, created = Session.get_or_create(
            game_session_uid=event.uid,
            defaults={
                'simulator_id': event.simulator_id,
                'track_id': event.track_id,
                'car_id': event.car_id,
                'driver_id': event.driver_id,
                'session_type': event.session_type,
                'started_at': datetime.now(),
                'track_temp': event.track_temp,
                'air_temp': event.air_temp
            }
        )
        # --- REFACTOR END ---

        if created:
            print(f"[SessionHandler] Created new Session #{session.id} in the database.", flush=True)
        else:
            print(f"[SessionHandler] Resumed existing Session #{session.id} from the database.", flush=True)
        
        self.current_session_model = session
        return session

    def on_session_ended(self, event: SessionEnded):
        if self.current_session_model:
            print(f"[SessionHandler] Received SessionEnded event. Closing session #{self.current_session_model.id}", flush=True)
            self.current_session_model.ended_at = datetime.now()
            self.current_session_model.save()
            self.current_session_model = None