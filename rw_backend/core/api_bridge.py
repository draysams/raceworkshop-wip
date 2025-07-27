# rw_backend/core/api_bridge.py

from rw_backend.api.dashboard_api import DashboardApi
from rw_backend.api.session_api import SessionApi
from rw_backend.api.telemetry_api import TelemetryApi

class ApiBridge:
    """
    This class acts as a single, clean entry point for the Pywebview JS API.
    It composes the other domain-specific API classes. The JS will call methods
    like `window.pywebview.api.sessions.getSessionHistory()`.
    """
    def __init__(self):
        # Instantiate and expose the domain-specific API services
        self.dashboard = DashboardApi()
        self.sessions = SessionApi()
        self.telemetry = TelemetryApi()