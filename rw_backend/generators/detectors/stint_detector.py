# rw_backend/generators/detectors/stint_detector.py

from rw_backend.core.events import StintStarted, StintEnded

class StintDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue
    
    def detect(self, player_scoring, last_player_data, current_player_state):
        """
        Detects stint changes based on reliable triggers.
        Returns the new player state if a change occurred, otherwise None.
        """
        new_state = self._get_current_physical_state(player_scoring)
        
        # --- CHANGE START ---
        # The entire logic block has been re-engineered to prioritize the most
        # important triggers and fire events in the correct order.

        # Primary Trigger: A pit stop was just completed. This is the most complex
        # event as it signifies BOTH the end of one stint and the start of another.
        current_pitstops = player_scoring.mNumPitstops
        last_pitstops = last_player_data.get('mNumPitstops', 0)

        if current_pitstops > last_pitstops:
            # A pit stop was completed. This is the definitive end of the previous stint.
            # We use the lap number from the *previous* frame to correctly attribute the in-lap.
            lap_ended_on = last_player_data.get('mTotalLaps', player_scoring.mTotalLaps)
            
            # Fire events in the correct order: END old stint, then START new one.
            self.event_queue.put(StintEnded(lap_number=lap_ended_on))
            self.event_queue.put(StintStarted(lap_number=player_scoring.mTotalLaps))
            
            # The state has changed, so we return it to sync the orchestrator.
            return new_state

        # Secondary Triggers: These handle cases that are not a completed pit stop.
        # We only check these if the primary trigger was not met.
        if new_state != current_player_state:
            # Case A: Starting the very first stint of the session from the garage.
            if new_state == "ON_TRACK" and current_player_state in ["IN_PITS", "IN_GARAGE"]:
                self.event_queue.put(StintStarted(lap_number=player_scoring.mTotalLaps))
                return new_state
            
            # Case B: Ending a stint by using the "Return to Garage" menu option from the track.
            elif new_state == "IN_GARAGE" and current_player_state == "ON_TRACK":
                self.event_queue.put(StintEnded(lap_number=player_scoring.mTotalLaps))
                return new_state
            
            # Case C: Any other physical state change (e.g., ON_TRACK -> IN_PITS).
            # We don't fire an event, but we must return the new state to keep the 
            # orchestrator's state machine in sync.
            else:
                return new_state
        # --- CHANGE END ---

        return None # No state change and no events to fire.

    def _get_current_physical_state(self, player_scoring):
        """Helper to determine the car's physical location."""
        if player_scoring.mInGarageStall:
            return "IN_GARAGE"
        elif player_scoring.mInPits:
            return "IN_PITS"
        else:
            return "ON_TRACK"