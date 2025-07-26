from rw_backend.core.events import LapCompleted

class LapDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue
        # --- FIX #2 STATE ---
        # This will hold the data of a lap that has just finished,
        # so we can wait one frame for its time to become valid.
        self.pending_lap_completion = None

    def detect(self, player_scoring, last_player_data):
        # --- FIX #2 PART 1: Check for a pending lap first ---
        if self.pending_lap_completion:
            # The lap time for the *previous* lap is now valid in the *current* frame.
            lap_time = player_scoring.mLastLapTime
            
            if lap_time > 0:
                # We have a valid time, so we can now fire the event
                lap_data = self.pending_lap_completion
                s1 = lap_data.get('sector1_time', -1.0)
                s2_total = lap_data.get('sector2_time', -1.0)

                s2 = (s2_total - s1) if s1 > 0 and s2_total > 0 else -1.0
                s3 = (lap_time - s2_total) if lap_time > 0 and s2_total > 0 else -1.0

                event = LapCompleted(
                    lap_number=lap_data.get('lap_number'),
                    lap_time=lap_time,
                    sector1_time=s1,
                    sector2_time=s2,
                    sector3_time=s3,
                    is_valid=lap_data.get('is_valid')
                )
                self.event_queue.put(event)
                self.pending_lap_completion = None # Clear the pending lap

        current_laps = player_scoring.mTotalLaps
        last_laps = last_player_data.get('mTotalLaps', -1)

        # --- FIX #2 PART 2: Detect the lap increment ---
        if current_laps > last_laps and last_laps != -1:
            # A lap has just finished, but its time is not yet available.
            # We store the lap's metadata from the previous frame.
            self.pending_lap_completion = {
                'lap_number': last_player_data.get('mTotalLaps'),
                'is_valid': (last_player_data.get('mCountLapFlag') == 2),
                'sector1_time': last_player_data.get('mLastSector1'),
                'sector2_time': last_player_data.get('mLastSector2'),
            }