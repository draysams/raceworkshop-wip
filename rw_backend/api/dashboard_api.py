# rw_backend/api/dashboard_api.py

import json
from datetime import timedelta
from rw_backend.database.models import Session, Lap
from rw_backend.dtos.session_dtos import map_session_to_summary_dto

class DashboardApi:
    def getGlobalDashboardStats(self):
        print("API CALL: getGlobalDashboardStats", flush=True)
        try:
            total_sessions = Session.select().count()
            total_laps = Lap.select().count()

            total_duration_seconds = 0
            for session in Session.select().where(Session.ended_at.is_null(False)):
                duration = session.ended_at - session.started_at
                total_duration_seconds += duration.total_seconds()
            
            # Format as H:MM:SS string, handling days if necessary
            td = timedelta(seconds=int(total_duration_seconds))
            hours, remainder = divmod(td.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            total_drive_time = f"{td.days * 24 + hours:02}:{minutes:02}:{seconds:02}"
            
            recent_sessions_query = Session.select().order_by(Session.started_at.desc()).limit(3)
            recent_sessions = [map_session_to_summary_dto(s) for s in recent_sessions_query]

            stats = {
                "totalSessions": total_sessions,
                "totalLaps": total_laps,
                "totalDriveTime": total_drive_time,
                "recentSessions": recent_sessions,
            }
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching global dashboard stats: {e}", flush=True)
            return json.dumps({})

    def getModuleDashboardStats(self, simulatorId):
        print(f"API CALL: getModuleDashboardStats for {simulatorId}", flush=True)
        # NOTE: This is a placeholder for now. For this to work correctly, a `simulator`
        # field needs to be added to the `Session` model. For now, it returns global stats.
        # We will implement the full, detailed query in the next step.
        return self.getGlobalDashboardStats()