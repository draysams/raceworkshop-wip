# rw_backend/api/dashboard_api.py

import json
from rw_backend.database.models import Session, Simulator, Track, Car
from rw_backend.services.dashboard_analytics import DashboardAnalytics
from rw_backend.dtos.session_dtos import map_session_to_summary_dto

class DashboardApi:
    def __init__(self):
        self.analytics_service = DashboardAnalytics()

    def getGlobalDashboardStats(self):
        print("API CALL: getGlobalDashboardStats", flush=True)
        try:
            analytics_data = self.analytics_service.generate_stats()
            
            # --- THIS IS THE FIX ---
            # The query now eagerly loads the related Car and Track models, ensuring
            # the DTO mapper has the data it needs.
            recent_sessions_query = (Session
                                   .select()
                                   .join(Track, on=(Session.track == Track.id))
                                   .join(Car, on=(Session.car == Car.id))
                                   .order_by(Session.started_at.desc())
                                   .limit(3))
            # --- END FIX ---
            
            recent_sessions_data = [map_session_to_summary_dto(s) for s in recent_sessions_query]
            
            response = {
                "analytics": analytics_data,
                "recentSessions": recent_sessions_data
            }
            
            return json.dumps(response)
        except Exception as e:
            print(f"Error fetching global dashboard stats: {e}", flush=True)
            return json.dumps({"analytics": {}, "recentSessions": []})

    def getModuleDashboardStats(self, simulatorId):
        print(f"API CALL: getModuleDashboardStats for {simulatorId}", flush=True)
        try:
            analytics_data = self.analytics_service.generate_stats(simulator_id=simulatorId)
            
            simulator = Simulator.get_by_id(simulatorId)

            # --- THIS IS THE FIX ---
            # The same eager loading logic is applied here.
            recent_sessions_query = (Session
                                   .select()
                                   .join(Track, on=(Session.track == Track.id))
                                   .join(Car, on=(Session.car == Car.id))
                                   .where(Session.simulator == simulator)
                                   .order_by(Session.started_at.desc())
                                   .limit(3))
            # --- END FIX ---

            recent_sessions_data = [map_session_to_summary_dto(s) for s in recent_sessions_query]

            response = {
                "analytics": analytics_data,
                "recentSessions": recent_sessions_data
            }
            
            return json.dumps(response)
        except Exception as e:
            print(f"Error fetching module dashboard stats: {e}", flush=True)
            return json.dumps({"analytics": {}, "recentSessions": []})