# rw_backend/generators/detectors/player_state_detector.py

from collections import deque

class PlayerStateDetector:
    """
    A state machine that tracks the player's current and historical physical state.
    This is the single source of truth for the player's location (garage, pits, track).
    """
    def __init__(self, history_length=4):
        self.state_history = deque(maxlen=history_length)
        self.current_state = "UNKNOWN"

    def _determine_physical_state(self, player_scoring) -> str:
        """Determines the raw physical state from the current game data."""
        if not player_scoring:
            return "UNKNOWN"
        if player_scoring.mInGarageStall:
            return "IN_GARAGE"
        if player_scoring.mInPits:
            return "IN_PITS"
        return "ON_TRACK"

    def update_and_get_state(self, player_scoring) -> str:
        """
        Updates the state machine with the latest data and returns the new current state.
        If a state change occurs, it's added to the history.
        """
        new_state = self._determine_physical_state(player_scoring)
        
        if new_state != self.current_state:
            self.state_history.append(new_state)
            self.current_state = new_state
            
        return self.current_state