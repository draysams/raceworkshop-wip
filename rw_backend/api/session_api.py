# rw_backend/api/session_api.py

import json
from rw_backend.database.models import Session, Stint, Lap
from rw_backend.dtos.session_dtos import map_session_to_summary_dto, map_lap_to_detail_dto

class SessionApi:
    def getSessionHistory(self, filters):
        print("API CALL: getSessionHistory")
        try:
            query = Session.select().order_by(Session.started_at.desc())
            sessions_dto = [map_session_to_summary_dto(s) for s in query]
            return json.dumps(sessions_dto)
        except Exception as e:
            print(f"Error fetching session history: {e}")
            return json.dumps([])

    def getSessionDetail(self, sessionId):
        print(f"API CALL: getSessionDetail for session {sessionId}")
        try:
            session = Session.get_by_id(sessionId)
            laps_query = Lap.select().join(Stint).where(Stint.session == session).order_by(Lap.lap_number)
            
            session_dto = map_session_to_summary_dto(session)
            laps_dto = [map_lap_to_detail_dto(lap) for lap in laps_query]

            return json.dumps({
                'session': session_dto,
                'laps': laps_dto
            })
        except Exception as e:
            print(f"Error fetching session detail: {e}")
            return json.dumps(None)