# rw_backend/api/session_api.py

import json
# --- CHANGE START: Import the new detail mapper ---
from rw_backend.database.models import Session, Track, Car, Simulator
from rw_backend.dtos.session_dtos import map_session_to_summary_dto, map_session_to_detail_dto
# --- CHANGE END ---

class SessionApi:
    def getSessionHistory(self, filters):
        print("API CALL: getSessionHistory", flush=True)
        try:
            # This query correctly pre-fetches the related models for the summary DTO
            query = (Session
                     .select(Session, Track, Car, Simulator)
                     .join(Simulator, on=(Session.simulator == Simulator.id))
                     .join(Track, on=(Session.track == Track.id))
                     .join(Car, on=(Session.car == Car.id))
                     .order_by(Session.started_at.desc()))
            
            sessions_dto = [map_session_to_summary_dto(s) for s in query]
            return json.dumps(sessions_dto)
        except Exception as e:
            print(f"Error fetching session history: {e}", flush=True)
            return json.dumps([])

    def getSessionDetail(self, sessionId):
        print(f"API CALL: getSessionDetail for session {sessionId}", flush=True)
        try:
            # --- CHANGE START: Logic is now simpler and uses the new detail DTO ---
            # We still need to fetch the base session object first
            session = (Session
                       .select(Session, Track, Car, Simulator)
                       .join(Simulator, on=(Session.simulator == Simulator.id))
                       .join(Track, on=(Session.track == Track.id))
                       .join(Car, on=(Session.car == Car.id))
                       .where(Session.id == sessionId)
                       .get())
            
            # The new mapper handles all the complex data aggregation and nesting.
            session_detail_dto = map_session_to_detail_dto(session)

            return json.dumps(session_detail_dto)
            # --- CHANGE END ---
        except Exception as e:
            print(f"Error fetching session detail: {e}", flush=True)
            return json.dumps(None)