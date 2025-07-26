# rw_backend/handlers/session_handler.py

from datetime import datetime
from rw_backend.core.events import SessionStarted, SessionEnded
from rw_backend.database.models import Session

class SessionHandler:
    """Handles session-related events to manage the database."""
    def __init__(self):
        self.current_session_model = None
        # On startup, we don't need to resume here. The event generator will
        # compare against the DB and only fire a SessionStarted event if it's new.
        
    def handle_event(self, event):
        if isinstance(event, SessionStarted):
            self.on_session_started(event)
        elif isinstance(event, SessionEnded):
            self.on_session_ended(event)

    def on_session_started(self, event: SessionStarted):
        print(f"[SessionHandler] Received SessionStarted event for UID: {event.uid}", flush=True)
        # Check if this session already exists from a previous run (resumption case)
        session, created = Session.get_or_create(
            game_session_uid=event.uid,
            defaults={
                'track_name': event.track_name,
                'session_type': event.session_type,
                'player_name': event.player_name,
                'car_model': event.car_model,
                'car_class': event.car_class,
                'started_at': datetime.now(),
                'track_temp': event.track_temp,
                'air_temp': event.air_temp
            }
        )
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