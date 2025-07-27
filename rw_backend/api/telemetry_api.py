# rw_backend/api/telemetry_api.py

import json
from rw_backend.database.models import TelemetrySnapshot, TelemetryValue, TelemetryChannel

class TelemetryApi:
    def getLapTelemetry(self, lapId):
        """
        Fetches all telemetry for a given lap and returns it in a format
        that is easy for the frontend to chart.
        """
        print(f"API CALL: getLapTelemetry for lap {lapId}")
        try:
            query = (TelemetryValue
                     .select(TelemetryValue.value, TelemetrySnapshot.lap_dist, TelemetryChannel.name)
                     .join(TelemetrySnapshot)
                     .join(TelemetryChannel)
                     .where(TelemetrySnapshot.lap == lapId)
                     .order_by(TelemetrySnapshot.lap_dist))

            telemetry_data = {}
            for row in query:
                channel_name = row.channel.name
                if channel_name not in telemetry_data:
                    telemetry_data[channel_name] = []
                
                telemetry_data[channel_name].append({
                    'x': row.snapshot.lap_dist,
                    'y': row.value
                })

            return json.dumps(telemetry_data)
        except Exception as e:
            print(f"Error fetching lap telemetry: {e}")
            return json.dumps({})