# rw_backend/api/dashboard_api.py

import json
from datetime import timedelta
from rw_backend.database.models import Session, Lap, Simulator, Stint
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
            
            # Get recent sessions with proper joins for the new DTO structure
            recent_sessions_query = (Session
                                   .select(Session, Simulator)
                                   .join(Simulator, on=(Session.simulator == Simulator.id))
                                   .order_by(Session.started_at.desc())
                                   .limit(3))
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
        try:
            # Get the simulator by ID
            simulator = Simulator.get_by_id(simulatorId)
            
            # Get sessions for this specific simulator
            simulator_sessions = Session.select().where(Session.simulator == simulator)
            total_sessions = simulator_sessions.count()
            
            # Get total laps for this simulator
            total_laps = (Lap
                         .select()
                         .join(Stint)
                         .join(Session)
                         .where(Session.simulator == simulator)
                         .count())

            # Calculate total drive time for this simulator
            total_duration_seconds = 0
            for session in simulator_sessions.where(Session.ended_at.is_null(False)):
                duration = session.ended_at - session.started_at
                total_duration_seconds += duration.total_seconds()
            
            # Format as H:MM:SS string, handling days if necessary
            td = timedelta(seconds=int(total_duration_seconds))
            hours, remainder = divmod(td.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            total_drive_time = f"{td.days * 24 + hours:02}:{minutes:02}:{seconds:02}"
            
            # Get recent sessions for this simulator with proper joins
            recent_sessions_query = (Session
                                   .select(Session, Simulator)
                                   .join(Simulator, on=(Session.simulator == Simulator.id))
                                   .where(Session.simulator == simulator)
                                   .order_by(Session.started_at.desc())
                                   .limit(3))
            recent_sessions = [map_session_to_summary_dto(s) for s in recent_sessions_query]

            stats = {
                "totalSessions": total_sessions,
                "totalLaps": total_laps,
                "totalDriveTime": total_drive_time,
                "recentSessions": recent_sessions,
            }
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching module dashboard stats: {e}", flush=True)
            # Fallback to global stats if there's an error
            return self.getGlobalDashboardStats()