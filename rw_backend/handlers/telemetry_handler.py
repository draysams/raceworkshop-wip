# rw_backend/handlers/telemetry_handler.py

from rw_backend.core.events import TelemetryUpdate, LapStarted, SessionEnded
from rw_backend.database.models import Lap, LapTelemetry, db

class TelemetryHandler:
    # --- CHANGE START: Update constants for new sampling strategy ---
    SAMPLING_DISTANCE = 3  # Log a snapshot approximately every 3 meters
    BUFFER_SIZE = 200      # Write to the DB every 200 snapshots
    # --- CHANGE END ---

    def __init__(self):
        self.current_lap_model = None
        self.telemetry_buffer = []
        # --- NEW STATE for sampling ---
        self.last_log_distance = -1.0

    def handle_event(self, event):
        if isinstance(event, LapStarted):
            self._on_lap_started(event)
        elif isinstance(event, TelemetryUpdate):
            self._on_telemetry_update(event)
        elif isinstance(event, SessionEnded):
            self._on_session_ended(event)

    def _on_lap_started(self, event: LapStarted):
        self._flush_buffer()
        self.current_lap_model = Lap.select().order_by(Lap.id.desc()).first()
        # --- CHANGE START: Reset last_log_distance for the new lap ---
        self.last_log_distance = -1.0
        # --- CHANGE END ---
        if not self.current_lap_model or self.current_lap_model.lap_number != event.lap_number:
             print(f"[TelemetryHandler] WARNING: Mismatch finding new lap record for lap #{event.lap_number}", flush=True)
             self.current_lap_model = None

    def _on_session_ended(self, event: SessionEnded):
        self._flush_buffer()
        self.current_lap_model = None

    def _on_telemetry_update(self, event: TelemetryUpdate):
        if not self.current_lap_model or event.player_state != "ON_TRACK":
            return
        
        player_scoring = next((v for v in event.payload['scoring'].mVehicles if v.mIsPlayer), None)
        if not player_scoring:
            return

        # --- THIS IS THE NEW SAMPLING LOGIC ---
        current_dist = player_scoring.mLapDist
        
        # We only record a snapshot if the car has traveled past our next target distance.
        if current_dist >= (self.last_log_distance + self.SAMPLING_DISTANCE):
            self._add_snapshot_to_buffer(event.payload, current_dist)
            
            # Update the last logged distance to the actual distance of the snapshot we just saved.
            self.last_log_distance = current_dist

            if len(self.telemetry_buffer) >= self.BUFFER_SIZE:
                self._flush_buffer()
        # --- END NEW SAMPLING LOGIC ---
    
    def _add_snapshot_to_buffer(self, raw_data, lap_dist):
        telemetry = raw_data['telemetry']
        wheels = telemetry.mWheels
        
        # --- DATA QUALITY FIXES ---
        # 1. Calculate speed using the full 3D vector for accuracy.
        vel = telemetry.mLocalVel
        speed_kph = (vel.x**2 + vel.y**2 + vel.z**2)**0.5 * 3.6

        # 2. Helper to convert tire temperatures from Kelvin to Celsius.
        kelvin_to_celsius = lambda k: k - 273.15
        
        snapshot_data = {
            'lap': self.current_lap_model,
            'lap_dist': lap_dist,
            'elapsed_time': telemetry.mElapsedTime, # 3. Add elapsed time
            'speed': speed_kph, # Use corrected speed
            'throttle': telemetry.mFilteredThrottle, 'brake': telemetry.mFilteredBrake,
            'steering': telemetry.mFilteredSteering, 'rpm': telemetry.mEngineRPM,
            'gear': telemetry.mGear, 'pos_x': telemetry.mPos.x,
            'pos_y': telemetry.mPos.y, 'pos_z': telemetry.mPos.z,
            'fuel_level': telemetry.mFuel, 'drs_active': telemetry.mRearFlapActivated,
            'tire_pressure_fl': wheels[0].mPressure, 'tire_pressure_fr': wheels[1].mPressure,
            'tire_pressure_rl': wheels[2].mPressure, 'tire_pressure_rr': wheels[3].mPressure,
            'tire_wear_fl': wheels[0].mWear, 'tire_wear_fr': wheels[1].mWear,
            'tire_wear_rl': wheels[2].mWear, 'tire_wear_rr': wheels[3].mWear,
            # Use corrected temperatures
            'tire_temp_fl_i': kelvin_to_celsius(wheels[0].mTemperature[0]), 'tire_temp_fl_m': kelvin_to_celsius(wheels[0].mTemperature[1]), 'tire_temp_fl_o': kelvin_to_celsius(wheels[0].mTemperature[2]),
            'tire_temp_fr_i': kelvin_to_celsius(wheels[1].mTemperature[0]), 'tire_temp_fr_m': kelvin_to_celsius(wheels[1].mTemperature[1]), 'tire_temp_fr_o': kelvin_to_celsius(wheels[1].mTemperature[2]),
            'tire_temp_rl_i': kelvin_to_celsius(wheels[2].mTemperature[0]), 'tire_temp_rl_m': kelvin_to_celsius(wheels[2].mTemperature[1]), 'tire_temp_rl_o': kelvin_to_celsius(wheels[2].mTemperature[2]),
            'tire_temp_rr_i': kelvin_to_celsius(wheels[3].mTemperature[0]), 'tire_temp_rr_m': kelvin_to_celsius(wheels[3].mTemperature[1]), 'tire_temp_rr_o': kelvin_to_celsius(wheels[3].mTemperature[2]),
        }
        self.telemetry_buffer.append(snapshot_data)
        # --- END DATA QUALITY FIXES ---

    def _flush_buffer(self):
        if not self.telemetry_buffer or not self.current_lap_model:
            self.telemetry_buffer.clear()
            return
        
        print(f"[TelemetryHandler] Flushing {len(self.telemetry_buffer)} snapshots to DB for Lap number {self.current_lap_model.lap_number}...", flush=True)
        try:
            with db.atomic():
                LapTelemetry.insert_many(self.telemetry_buffer).execute()
            self.telemetry_buffer.clear()
        except Exception as e:
            print(f"[TelemetryHandler] ERROR: Failed to flush telemetry buffer: {e}", flush=True)
            self.telemetry_buffer.clear()