# rw_backend/api/telemetry_api.py

import json
from rw_backend.database.models import LapTelemetry

class TelemetryApi:
    def getLapTelemetry(self, lapId):
        """
        Fetches all telemetry for a given lap and transforms it into the
        BFF (Backend for Frontend) JSON structure the UI expects.
        """
        print(f"API CALL: getLapTelemetry for lap {lapId}", flush=True)
        try:
            lap_id_int = int(lapId)

            query = (LapTelemetry
                     .select()
                     .where(LapTelemetry.lap == lap_id_int)
                     .order_by(LapTelemetry.lap_dist)
                     .dicts())

            # --- CHANGE START: Implement the new BFF data structure ---

            # Initialize the final JSON structure with separate keys
            response_data = {
                'telemetry': {
                    'speed':    {'label': 'Speed', 'data': [], 'borderColor': '#007BFF', 'interpolate': True},
                    'throttle': {'label': 'Throttle', 'data': [], 'borderColor': '#198754', 'interpolate': True},
                    'brake':    {'label': 'Brake', 'data': [], 'borderColor': '#DC3545', 'interpolate': True},
                    'rpm':      {'label': 'RPM', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                    'gear':     {'label': 'Gear', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True, 'stepped': True},
                    'steering': {'label': 'Steering', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
                    # Note: TC and ABS are not in our DB model yet, they can be added later.
                },
                'trackpath': []
            }

            # Fetch all rows from the database in one go
            all_rows = list(query)

            # Efficiently build the data arrays
            for row in all_rows:
                dist = row['lap_dist']
                
                # Append to telemetry channels
                response_data['telemetry']['speed']['data'].append({'x': dist, 'y': row['speed']})
                response_data['telemetry']['throttle']['data'].append({'x': dist, 'y': row['throttle']})
                response_data['telemetry']['brake']['data'].append({'x': dist, 'y': row['brake']})
                response_data['telemetry']['rpm']['data'].append({'x': dist, 'y': row['rpm']})
                response_data['telemetry']['gear']['data'].append({'x': dist, 'y': row['gear']})
                response_data['telemetry']['steering']['data'].append({'x': dist, 'y': row['steering']})

                # Append to the track path
                response_data['trackpath'].append({
                    'distance': dist,
                    'x': -row['pos_x'],
                    'y': row['pos_z'] # Use Z for the 2D map's Y-axis
                })

            if not all_rows:
                print(f"No telemetry data found for lap_id: {lap_id_int}", flush=True)
            
            return json.dumps(response_data)
            # --- CHANGE END ---

        except Exception as e:
            print(f"Error fetching lap telemetry: {e}", flush=True)
            return json.dumps({'telemetry': {}, 'trackpath': []}) # Return empty valid structure on error