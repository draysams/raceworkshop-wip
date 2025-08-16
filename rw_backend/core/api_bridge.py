# rw_backend/core/api_bridge.py

from rw_backend.api.dashboard_api import DashboardApi
from rw_backend.api.session_api import SessionApi
from rw_backend.api.telemetry_api import TelemetryApi
from rw_backend.api.simulator_api import SimulatorApi 
from rw_backend.api.race_engineer_api import RaceEngineerApi
from rw_backend.api.track_car_stats_api import TrackCarStatsApi

class ApiBridge:
    """
    This class acts as a single, clean entry point (a Façade) for the Pywebview JS API.
    It instantiates the domain-specific services and exposes their methods directly
    to the JavaScript frontend.
    """
    def __init__(self):
        # Instantiate the domain-specific API services
        self._dashboard_api = DashboardApi()
        self._session_api = SessionApi()
        self._telemetry_api = TelemetryApi()
        self._simulator_api = SimulatorApi()
        self._race_engineer_api = RaceEngineerApi()
        self._track_car_stats_api = TrackCarStatsApi()
    # --- CHANGE START: Add pass-through methods ---

    # Dashboard Methods
    def getGlobalDashboardStats(self):
        return self._dashboard_api.getGlobalDashboardStats()

    def getModuleDashboardStats(self, simulatorId):
        return self._dashboard_api.getModuleDashboardStats(simulatorId)

    # Session Methods
    def getSessionHistory(self, filters):
        return self._session_api.getSessionHistory(filters)

    def getSessionDetail(self, sessionId):
        return self._session_api.getSessionDetail(sessionId)

    # Telemetry Methods
    def getLapTelemetry(self, lapId):
        return self._telemetry_api.getLapTelemetry(lapId)
    
    def compareLaps(self, lapId1, lapId2):
        return self._telemetry_api.compareLaps(lapId1, lapId2)
    
    # --- NEW pass-through method ---
    def getSimulatorList(self):
        return self._simulator_api.getSimulatorList()

    # Race Engineer Methods
    def getTrackViewStats(self):
        return self._race_engineer_api.getTrackViewStats()

    def getCarViewStats(self):
        return self._race_engineer_api.getCarViewStats()

    def getSetupViewStats(self):
        return self._race_engineer_api.getSetupViewStats()

    # Track & Car Stats Methods
    def getTrackStats(self):
        return self._track_car_stats_api.getTrackStats()

    def getCarStatsForTrack(self, trackId):
        return self._track_car_stats_api.getCarStatsForTrack(trackId)
    # --- CHANGE END ---