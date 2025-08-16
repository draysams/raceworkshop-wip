# rw_backend/api/track_car_stats_api.py

import json
from rw_backend.services.track_car_stats_analytics import TrackCarStatsAnalytics

class TrackCarStatsApi:
    def __init__(self):
        self.analytics_service = TrackCarStatsAnalytics()

    def getTrackStats(self):
        """Endpoint for the top-level track list in the Track & Car Stats page."""
        try:
            stats = self.analytics_service.get_track_stats()
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching Track & Car Stats (Tracks): {e}", flush=True)
            return json.dumps([])

    def getCarStatsForTrack(self, trackId):
        """Endpoint for the nested car list for a specific track."""
        try:
            stats = self.analytics_service.get_car_stats_for_track(trackId)
            return json.dumps(stats)
        except Exception as e:
            print(f"Error fetching Track & Car Stats (Cars for Track {trackId}): {e}", flush=True)
            return json.dumps([])