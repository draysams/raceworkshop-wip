# rw_backend/handlers/telemetry_handler.py

from rw_backend.core.events import TelemetryUpdate, LapStarted, SessionEnded
from rw_backend.database.models import Lap, Stint, LapTelemetry, db

class TelemetryHandler:
    SAMPLING_DISTANCE = 3
    BUFFER_SIZE = 200

    def __init__(self):
        self.current_lap_model = None
        self.telemetry_buffer = []
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
        self.last_log_distance = -1.0
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

        current_dist = player_scoring.mLapDist
        if current_dist >= (self.last_log_distance + self.SAMPLING_DISTANCE):
            self._add_snapshot_to_buffer(event.payload, current_dist)
            self.last_log_distance = current_dist
            if len(self.telemetry_buffer) >= self.BUFFER_SIZE:
                self._flush_buffer()
    
    def _add_snapshot_to_buffer(self, raw_data, lap_dist):
        telemetry = raw_data['telemetry']
        scoring_info = raw_data['scoring'].mScoringInfo
        player_scoring = next((v for v in raw_data['scoring'].mVehicles if v.mIsPlayer), None)
        wheels = telemetry.mWheels
        
        vel = telemetry.mLocalVel
        speed_kph = (vel.x**2 + vel.y**2 + vel.z**2)**0.5 * 3.6
        kelvin_to_celsius = lambda k: k - 273.15
        
        # --- CHANGE START: Populate the new enriched data structure ---
        snapshot_data = {
            'lap': self.current_lap_model,
            'lap_dist': lap_dist,
            'elapsed_time': telemetry.mElapsedTime,
            'delta_time': telemetry.mDeltaTime,
            
            'pos_x': telemetry.mPos.x, 'pos_y': telemetry.mPos.y, 'pos_z': telemetry.mPos.z,
            
            'throttle': telemetry.mFilteredThrottle, 'brake': telemetry.mFilteredBrake,
            'steering': telemetry.mFilteredSteering, 'speed': speed_kph,
            'rpm': telemetry.mEngineRPM, 'gear': telemetry.mGear,
            
            'fuel_level': telemetry.mFuel,
            
            'time_into_lap': player_scoring.mTimeIntoLap,
            'lap_start_et': player_scoring.mLapStartET, 'estimated_lap_time': player_scoring.mEstimatedLapTime,
            'track_edge': player_scoring.mTrackEdge,
            
            'tire_pressure_fl': wheels[0].mPressure, 'tire_pressure_fr': wheels[1].mPressure,
            'tire_pressure_rl': wheels[2].mPressure, 'tire_pressure_rr': wheels[3].mPressure,

            'tire_wear_fl': wheels[0].mWear, 'tire_wear_fr': wheels[1].mWear,
            'tire_wear_rl': wheels[2].mWear, 'tire_wear_rr': wheels[3].mWear,
            
            # Simplified to outer temp only and converted to Celsius
            'tire_temp_fl': kelvin_to_celsius(wheels[0].mTemperature[2]),
            'tire_temp_fr': kelvin_to_celsius(wheels[1].mTemperature[2]),
            'tire_temp_rl': kelvin_to_celsius(wheels[2].mTemperature[2]),
            'tire_temp_rr': kelvin_to_celsius(wheels[3].mTemperature[2]),

            # New brake temp and ride height data
            'brake_temp_fl': kelvin_to_celsius(wheels[0].mBrakeTemp), 'brake_temp_fr': kelvin_to_celsius(wheels[1].mBrakeTemp),
            'brake_temp_rl': kelvin_to_celsius(wheels[2].mBrakeTemp), 'brake_temp_rr': kelvin_to_celsius(wheels[3].mBrakeTemp),

            'ride_height_fl': wheels[0].mRideHeight, 'ride_height_fr': wheels[1].mRideHeight,
            'ride_height_rl': wheels[2].mRideHeight, 'ride_height_rr': wheels[3].mRideHeight,
        }
        self.telemetry_buffer.append(snapshot_data)
        # --- CHANGE END ---

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