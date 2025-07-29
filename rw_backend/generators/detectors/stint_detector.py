# rw_backend/generators/detectors/stint_detector.py

from rw_backend.core.events import StintStarted, StintEnded

class StintDetector:
    """
    Reacts to pit stop events and specific state transition patterns to manage stints.
    This detector is stateless and relies on the EventGenerator for context.
    """
    def __init__(self, event_queue):
        self.event_queue = event_queue
    
    def handle_pit_stop(self, player_scoring, last_player_data):
        """Scenario 2: A completed pit stop (`mNumPitstops` increments) ends the old stint and begins a new one."""
        lap_ended_on = last_player_data.get('mTotalLaps', player_scoring.mTotalLaps)
        print("[StintDetector] Pit stop detected. Cycling stint.", flush=True)
        self.event_queue.put(StintEnded(lap_number=lap_ended_on))
        self.event_queue.put(StintStarted(lap_number=player_scoring.mTotalLaps))

    def handle_state_transition(self, state_history, player_scoring):
        """Handles events triggered by a change in the player's physical state."""
        new_state = state_history[-1]
        
        # Scenario 1 & 5: Start a new stint when the state history shows a transition from the garage area to the track.
        # This correctly ignores drive-throughs (ON_TRACK -> IN_PITS -> ON_TRACK).
        if new_state == "ON_TRACK" and "IN_GARAGE" in list(state_history)[-3:]:
            print(f"[StintDetector] Transition from garage area to track detected. Starting new stint.", flush=True)
            self.event_queue.put(StintStarted(lap_number=player_scoring.mTotalLaps))
        
        # Scenario 4: End a stint when the player returns to the garage from the track.
        elif new_state == "IN_GARAGE" and len(state_history) > 1 and state_history[-2] == "ON_TRACK":
            old_state = state_history[-2]
            print(f"[StintDetector] Transition {old_state}->{new_state}. Ending stint.", flush=True)
            self.event_queue.put(StintEnded(lap_number=player_scoring.mTotalLaps))