# rw_backend/generators/detectors/lap_detector.py

from rw_backend.core.events import LapCompleted, LapStarted

class LapDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue
        self.lap_start_time = 0.0
        self.last_sector_start_time = 0.0
        self.provisional_s1_time = 0.0
        self.provisional_s2_time = 0.0
        # --- CHANGE START ---
        # Removed official_s1_time and official_s2_time as they added unnecessary complexity.
        # --- CHANGE END ---

    # --- NEW METHOD START ---
    def reset_for_new_session(self, telemetry_data):
        """
        Resets all internal timers and provisional data at the start of a new session.
        This is crucial for ensuring the first out-lap is timed correctly.
        """
        print("[LapDetector] Resetting for new session.", flush=True)
        start_time = telemetry_data.mElapsedTime if telemetry_data else 0.0
        self.lap_start_time = start_time
        self.last_sector_start_time = start_time
        self.provisional_s1_time = 0.0
        self.provisional_s2_time = 0.0
    # --- NEW METHOD END ---

    def reset_for_next_lap(self, new_lap_start_time):
        """Prepares the timers for the start of a new lap."""
        self.lap_start_time = new_lap_start_time
        self.last_sector_start_time = new_lap_start_time
        self.provisional_s1_time = 0.0
        self.provisional_s2_time = 0.0

    def detect(self, player_scoring, last_player_data, telemetry_data, player_state):
        # This logic remains the same: we track provisional sector times based on sector changes.
        current_sector = player_scoring.mSector
        last_sector = last_player_data.get('mSector', -1)
        if current_sector != last_sector:
            current_time = telemetry_data.mElapsedTime
            if last_sector == 1 and current_sector == 2:
                self.provisional_s1_time = current_time - self.lap_start_time
            elif last_sector == 2 and current_sector == 0:
                self.provisional_s2_time = current_time - (self.lap_start_time + self.provisional_s1_time)
            self.last_sector_start_time = current_time

        # This logic is simplified to remove the "pending lap" state.
        current_laps = player_scoring.mTotalLaps
        last_laps = last_player_data.get('mTotalLaps', -1)
        if current_laps > last_laps and last_laps != -1:
            self._handle_lap_completion(player_scoring, last_player_data, player_state)
            # We now always reset for the next lap, the EventGenerator handles pit exit resets separately.
            self.reset_for_next_lap(player_scoring.mLapStartET)

    def get_provisional_lap_data(self, player_scoring, telemetry_data) -> dict:
        """Returns the current state of the in-progress lap for a LapAborted event."""
        s1 = self.provisional_s1_time
        s2 = self.provisional_s2_time
        s3 = 0.0

        in_sector_3 = s1 > 0 and s2 > 0
        in_sector_2 = s1 > 0 and not in_sector_3

        if in_sector_3:
            s3 = telemetry_data.mElapsedTime - self.last_sector_start_time
        elif in_sector_2:
            s2 = telemetry_data.mElapsedTime - self.last_sector_start_time
        
        lap_time = s1 + s2 + s3
        return {'lap_number': player_scoring.mTotalLaps, 'lap_time': lap_time, 'sector1_time': s1, 'sector2_time': s2, 'sector3_time': s3}

    def _handle_lap_completion(self, player_scoring, last_player_data, player_state):
        is_valid_from_sim = last_player_data.get('mCountLapFlag') == 2
        final_is_valid = is_valid_from_sim and player_state not in ["IN_GARAGE", "IN_PITS"]

        official_lap_time = player_scoring.mLastLapTime
        if official_lap_time > 0:
            s1, s2_total = player_scoring.mLastSector1, player_scoring.mLastSector2
            s2 = (s2_total - s1) if s1 > 0 and s2_total > 0 else -1.0
            s3 = (official_lap_time - s2_total) if official_lap_time > 0 and s2_total > 0 else -1.0
            lap_data = (official_lap_time, s1, s2, s3)
        else:
            s3 = player_scoring.mLapStartET - (self.lap_start_time + self.provisional_s1_time + self.provisional_s2_time)
            lap_time = self.provisional_s1_time + self.provisional_s2_time + s3
            lap_data = (lap_time, self.provisional_s1_time, self.provisional_s2_time, s3)
        
        event = LapCompleted(lap_number=last_player_data.get('mTotalLaps'), lap_time=lap_data[0], sector1_time=lap_data[1], sector2_time=lap_data[2], sector3_time=lap_data[3], is_valid=final_is_valid)
        self.event_queue.put(event)
        # --- THIS IS THE FIX ---
        # A new lap only begins if the car is still on track after the last one finished.
        # This prevents firing LapStarted for an in-lap or after returning to the garage.
        if player_state == "ON_TRACK":
            next_lap_num = player_scoring.mTotalLaps
            print(f"[LapDetector] Firing LapStarted for next lap #{next_lap_num}", flush=True)
            self.event_queue.put(LapStarted(lap_number=next_lap_num))
        # --- END FIX ---