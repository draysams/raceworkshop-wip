# rw_backend/api/race_engineer_api.py

import json
from rw_backend.services.race_engineer_analytics import RaceEngineerAnalytics

class RaceEngineerApi:
    def __init__(self):
        self.analytics_service = RaceEngineerAnalytics()

    def getTrackViewStats(self):
        """Endpoint for the 'Tracks' view in the Race Engineer page."""
        try:
            stats = self.analytics_service.get_track_view_stats()
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching Race Engineer track stats: {e}", flush=True)
            return json.dumps([]) # Return an empty list on error

    def getCarViewStats(self):
        """Endpoint for the 'Cars' view in the Race Engineer page."""
        try:
            stats = self.analytics_service.get_car_view_stats()
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching Race Engineer car stats: {e}", flush=True)
            return json.dumps([])

    def getSetupViewStats(self):
        """Endpoint for the 'Setups' view in the Race Engineer page."""
        try:
            # This will need to accept carId and trackId filters from the UI
            stats = self.analytics_service.get_setup_view_stats()
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching Race Engineer setup stats: {e}", flush=True)
            return json.dumps([])