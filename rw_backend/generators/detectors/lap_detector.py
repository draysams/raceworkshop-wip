# rw_backend/generators/detectors/lap_detector.py

from rw_backend.core.events import LapCompleted

class LapDetector:
    def __init__(self, event_queue):
        self.event_queue = event_queue
        
        # --- State for Progressive Timing (Approach C) ---
        # These variables will track the timing of the lap currently in progress.
        self.lap_start_time = 0.0
        self.provisional_s1_time = 0.0
        self.provisional_s2_time = 0.0

    def detect(self, player_scoring, last_player_data, telemetry_data):
        """
        Detects lap and sector completions using a hybrid approach.
        - Uses official shared memory times for flying laps.
        - Calculates times for out-laps based on sector crossings.
        """
        # --- Part 1: Track Sector Crossings for Provisional Timing ---
        current_sector = player_scoring.mSector
        last_sector = last_player_data.get('mSector', -1)
        
        if current_sector != last_sector:
            # The sector has just changed. We record the timestamp.
            current_time = telemetry_data.mElapsedTime
            
            if last_sector == 1 and current_sector == 2: # Crossed S1 line
                self.provisional_s1_time = current_time - self.lap_start_time
            elif last_sector == 2 and current_sector == 0: # Crossed S2 line
                # Note: mCurSector2 is the time from lap start to S2 line.
                self.provisional_s2_time = current_time - (self.lap_start_time + self.provisional_s1_time)

        # --- Part 2: Detect Lap Completion ---
        current_laps = player_scoring.mTotalLaps
        last_laps = last_player_data.get('mTotalLaps', -1)

        if current_laps > last_laps and last_laps != -1:
            # A lap has just finished. The official times are now available on THIS frame.
            
            official_lap_time = player_scoring.mLastLapTime
            is_valid_flying_lap = official_lap_time > 0

            lap_number_to_log = last_player_data.get('mTotalLaps')
            is_valid_lap_flag = last_player_data.get('mCountLapFlag') == 2
            
            if is_valid_flying_lap:
                # --- FLYING LAP LOGIC ---
                # Use the official, high-precision data from the sim.
                s1 = player_scoring.mLastSector1
                s2_total = player_scoring.mLastSector2
                s2 = (s2_total - s1) if s1 > 0 and s2_total > 0 else -1.0
                s3 = (official_lap_time - s2_total) if official_lap_time > 0 and s2_total > 0 else -1.0
                
                final_lap_time = official_lap_time
                final_s1 = s1
                final_s2 = s2
                final_s3 = s3

            else:
                # --- OUT-LAP / INVALID LAP LOGIC ---
                # The official time is invalid, so we use our provisional calculated times.
                lap_end_time = player_scoring.mLapStartET # This is the ElapsedTime at the S/F line
                
                # Final sector (Sector 3) time calculation
                provisional_s3_time = lap_end_time - (self.lap_start_time + self.provisional_s1_time + self.provisional_s2_time)
                
                final_s1 = self.provisional_s1_time
                final_s2 = self.provisional_s2_time
                final_s3 = provisional_s3_time
                final_lap_time = final_s1 + final_s2 + final_s3
            
            # Dispatch the event with the best available data
            event = LapCompleted(
                lap_number=lap_number_to_log,
                lap_time=final_lap_time,
                sector1_time=final_s1,
                sector2_time=final_s2,
                sector3_time=final_s3,
                is_valid=is_valid_lap_flag
            )
            self.event_queue.put(event)

            # --- Part 3: Reset State for the New Lap ---
            self._reset_lap_state(player_scoring.mLapStartET)

    def _reset_lap_state(self, new_lap_start_time):
        """Resets the provisional timing variables for the next lap."""
        self.lap_start_time = new_lap_start_time
        self.provisional_s1_time = 0.0
        self.provisional_s2_time = 0.0