# rw_backend/api/session_api.py

import json
from rw_backend.database.models import Session, Stint, Lap, Track, Car, Simulator
from rw_backend.dtos.session_dtos import map_session_to_summary_dto, map_lap_to_detail_dto

class SessionApi:
    def getSessionHistory(self, filters):
        print("API CALL: getSessionHistory, flush=True")
        try:
            # --- CHANGE START: The query joins are now explicit ---
            # Peewee needs to be told how to connect tables that don't have a direct,
            # sequential relationship in the chain. We explicitly join FROM Session each time.
            query = (Session
                     .select(Session, Track, Car, Simulator)
                     .join(Simulator, on=(Session.simulator == Simulator.id))
                     .join(Track, on=(Session.track == Track.id))
                     .join(Car, on=(Session.car == Car.id))
                     .order_by(Session.started_at.desc()))
            # --- CHANGE END ---
            
            sessions_dto = [map_session_to_summary_dto(s) for s in query]
            return json.dumps(sessions_dto)
        except Exception as e:
            print(f"Error fetching session history: {e}", flush=True)
            return json.dumps([])

    def getSessionDetail(self, sessionId):
        print(f"API CALL: getSessionDetail for session {sessionId}", flush=True)
        try:
            # --- CHANGE START: The query for a single session also needs explicit joins ---
            session = (Session
                       .select(Session, Track, Car, Simulator)
                       .join(Simulator, on=(Session.simulator == Simulator.id))
                       .join(Track, on=(Session.track == Track.id))
                       .join(Car, on=(Session.car == Car.id))
                       .where(Session.id == sessionId)
                       .get())
            # --- CHANGE END ---

            laps_query = Lap.select().join(Stint).where(Stint.session == session).order_by(Lap.lap_number)
            
            session_dto = map_session_to_summary_dto(session)
            laps_dto = [map_lap_to_detail_dto(lap) for lap in laps_query]

            return json.dumps({
                'session': session_dto,
                'laps': laps_dto
            })
        except Exception as e:
            print(f"Error fetching session detail: {e}", flush=True)
            return json.dumps(None)