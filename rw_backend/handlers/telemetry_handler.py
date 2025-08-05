# rw_backend/handlers/telemetry_handler.py

from rw_backend.core.events import TelemetryUpdate, LapStarted, SessionEnded
from rw_backend.database.models import Lap, LapTelemetry, db

class TelemetryHandler:
    BUFFER_SIZE = 200

    def __init__(self):
        self.current_lap_model = None
        self.telemetry_buffer = []

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
        if not self.current_lap_model or self.current_lap_model.lap_number != event.lap_number:
             print(f"[TelemetryHandler] WARNING: Mismatch finding new lap record for lap #{event.lap_number}", flush=True)
             self.current_lap_model = None

    def _on_session_ended(self, event: SessionEnded):
        self._flush_buffer()
        self.current_lap_model = None

    def _on_telemetry_update(self, event: TelemetryUpdate):
        # --- THIS IS THE FIX ---
        # We only buffer telemetry data if a lap is active AND the car is physically on track.
        if not self.current_lap_model or event.player_state != "ON_TRACK":
            return
        # --- END FIX ---
        
        self._add_snapshot_to_buffer(event.payload)
        if len(self.telemetry_buffer) >= self.BUFFER_SIZE:
            self._flush_buffer()
    
    def _add_snapshot_to_buffer(self, raw_data):
        telemetry = raw_data['telemetry']
        player_scoring = next((v for v in raw_data['scoring'].mVehicles if v.mIsPlayer), None)
        if not player_scoring: return
        wheels = telemetry.mWheels
        
        snapshot_data = {
            'lap': self.current_lap_model, 'lap_dist': player_scoring.mLapDist,
            'throttle': telemetry.mFilteredThrottle, 'brake': telemetry.mFilteredBrake,
            'steering': telemetry.mFilteredSteering, 'speed': telemetry.mLocalVel.z * 3.6,
            'rpm': telemetry.mEngineRPM, 'gear': telemetry.mGear,
            'pos_x': telemetry.mPos.x, 'pos_y': telemetry.mPos.y, 'pos_z': telemetry.mPos.z,
            'fuel_level': telemetry.mFuel, 'drs_active': telemetry.mRearFlapActivated,
            'tire_pressure_fl': wheels[0].mPressure, 'tire_pressure_fr': wheels[1].mPressure,
            'tire_pressure_rl': wheels[2].mPressure, 'tire_pressure_rr': wheels[3].mPressure,
            'tire_wear_fl': wheels[0].mWear, 'tire_wear_fr': wheels[1].mWear,
            'tire_wear_rl': wheels[2].mWear, 'tire_wear_rr': wheels[3].mWear,
            'tire_temp_fl_i': wheels[0].mTemperature[0], 'tire_temp_fl_m': wheels[0].mTemperature[1], 'tire_temp_fl_o': wheels[0].mTemperature[2],
            'tire_temp_fr_i': wheels[1].mTemperature[0], 'tire_temp_fr_m': wheels[1].mTemperature[1], 'tire_temp_fr_o': wheels[1].mTemperature[2],
            'tire_temp_rl_i': wheels[2].mTemperature[0], 'tire_temp_rl_m': wheels[2].mTemperature[1], 'tire_temp_rl_o': wheels[2].mTemperature[2],
            'tire_temp_rr_i': wheels[3].mTemperature[0], 'tire_temp_rr_m': wheels[3].mTemperature[1], 'tire_temp_rr_o': wheels[3].mTemperature[2],
        }
        self.telemetry_buffer.append(snapshot_data)

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