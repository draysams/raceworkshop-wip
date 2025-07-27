# rw_backend/handlers/telemetry_handler.py

from rw_backend.core.events import TelemetryUpdate, LapCompleted, StintStarted, SessionEnded
from rw_backend.database.models import Lap, TelemetryChannel, TelemetrySnapshot, TelemetryValue, db

class TelemetryHandler:
    """
    Handles high-frequency telemetry updates, samples them based on distance,
    and saves them to the database for detailed lap analysis.
    """
    SAMPLING_DISTANCE = 50 # Log a snapshot every 50 meters

    def __init__(self):
        self.current_lap_model = None
        self.last_log_distance = -1
        self.channel_cache = {} # A cache to avoid frequent DB lookups for channel IDs

    def handle_event(self, event):
        if isinstance(event, LapCompleted):
            self._on_lap_completed(event)
        elif isinstance(event, StintStarted):
            self._on_stint_started(event)
        elif isinstance(event, TelemetryUpdate):
            self._on_telemetry_update(event)
        elif isinstance(event, SessionEnded):
            self._on_session_ended(event)

    def _on_stint_started(self, event: StintStarted):
        """When a stint starts, we don't have a lap model yet."""
        self.current_lap_model = None

    def _on_lap_completed(self, event: LapCompleted):
        """When a lap is completed, we need to fetch its new DB record."""
        # This ensures we are always associating telemetry with the correct lap
        self.current_lap_model = Lap.select().where(Lap.lap_number == event.lap_number).order_by(Lap.id.desc()).first()
        self.last_log_distance = -1 # Reset distance tracking for the new lap

    def _on_session_ended(self, event: SessionEnded):
        """Clear the state when the session ends."""
        self.current_lap_model = None

    def _on_telemetry_update(self, event: TelemetryUpdate):
        if not self.current_lap_model:
            return # We are not in a valid lap (e.g., in menus, first outlap not started)

        player_scoring = next((v for v in event.payload['scoring'].mVehicles if v.mIsPlayer), None)
        if not player_scoring:
            return

        current_dist = player_scoring.mLapDist

        # Check if we have traveled far enough to warrant a new snapshot
        if (current_dist - self.last_log_distance) >= self.SAMPLING_DISTANCE:
            self._create_telemetry_snapshot(event.payload, current_dist)
            self.last_log_distance = current_dist
    
    def _get_channel_id(self, channel_name):
        """
        Gets the ID for a channel name, using a cache to improve performance.
        """
        if channel_name in self.channel_cache:
            return self.channel_cache[channel_name]
        
        channel, created = TelemetryChannel.get_or_create(name=channel_name)
        self.channel_cache[channel_name] = channel.id
        return channel.id

    def _create_telemetry_snapshot(self, raw_data, lap_dist):
        """
        Creates a TelemetrySnapshot and all its associated TelemetryValue records
        in a single, efficient database transaction.
        """
        telemetry = raw_data['telemetry']
        
        # Define the data we want to save
        data_points = {
            'Throttle': telemetry.mFilteredThrottle,
            'Brake': telemetry.mFilteredBrake,
            'Steering': telemetry.mFilteredSteering,
            'Speed': telemetry.mLocalVel.z, # Assuming z is the forward velocity
            'RPM': telemetry.mEngineRPM,
            'Gear': telemetry.mGear,
            'FuelLevel': telemetry.mFuel,
            'DRS_Active': telemetry.mRearFlapActivated,
            
            # Tire Pressures
            'TirePressureFL': telemetry.mWheels[0].mPressure,
            'TirePressureFR': telemetry.mWheels[1].mPressure,
            'TirePressureRL': telemetry.mWheels[2].mPressure,
            'TirePressureRR': telemetry.mWheels[3].mPressure,

            # Tire Wear
            'TireWearFL': telemetry.mWheels[0].mWear,
            'TireWearFR': telemetry.mWheels[1].mWear,
            'TireWearRL': telemetry.mWheels[2].mWear,
            'TireWearRR': telemetry.mWheels[3].mWear,
        }

        # Add all 12 tire temperature points
        temps = ['Inner', 'Middle', 'Outer']
        wheels = ['FL', 'FR', 'RL', 'RR']
        for i, wheel_name in enumerate(wheels):
            for j, temp_name in enumerate(temps):
                key = f'TireTemp{wheel_name}{temp_name}'
                data_points[key] = telemetry.mWheels[i].mTemperature[j]

        # Use a transaction for efficiency. All these inserts will be
        # committed to the database in a single, fast operation.
        with db.atomic():
            snapshot = TelemetrySnapshot.create(lap=self.current_lap_model, lap_dist=lap_dist)
            
            telemetry_values = [
                {
                    'snapshot': snapshot,
                    'channel': self._get_channel_id(name),
                    'value': value
                }
                for name, value in data_points.items()
            ]
            
            TelemetryValue.insert_many(telemetry_values).execute()