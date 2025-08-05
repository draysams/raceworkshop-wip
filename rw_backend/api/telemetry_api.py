# rw_backend/api/telemetry_api.py

import json
from rw_backend.database.models import LapTelemetry

class TelemetryApi:
    def getLapTelemetry(self, lapId):
        """
        Fetches all telemetry for a given lap from the wide table and transforms
        it into a chart-friendly JSON structure, including positional data for a track map.
        """
        print(f"API CALL: getLapTelemetry for lap {lapId}", flush=True)
        try:
            lap_id_int = int(lapId)

            query = (LapTelemetry
                     .select()
                     .where(LapTelemetry.lap == lap_id_int)
                     .order_by(LapTelemetry.lap_dist)
                     .dicts())
            
            # --- CHANGE START: Initialize structure to hold all telemetry channels ---
            # Define all the channels we expect to plot
            telemetry_data = {
                'Speed': [], 'RPM': [], 'Throttle': [], 'Brake': [], 'Steering': [], 'Gear': [],
                'Position': [] # Add the new channel for the track map
            }
            # --- CHANGE END ---

            for row in query:
                # Append a data point for each standard channel
                telemetry_data['Speed'].append({'x': row['lap_dist'], 'y': row['speed']})
                telemetry_data['RPM'].append({'x': row['lap_dist'], 'y': row['rpm']})
                telemetry_data['Throttle'].append({'x': row['lap_dist'], 'y': row['throttle']})
                telemetry_data['Brake'].append({'x': row['lap_dist'], 'y': row['brake']})
                telemetry_data['Steering'].append({'x': row['lap_dist'], 'y': row['steering']})
                telemetry_data['Gear'].append({'x': row['lap_dist'], 'y': row['gear']})
                
                # --- CHANGE START: Append the new positional data ---
                # The frontend will use this to draw the track map.
                # We use 'z' for the y-axis as it's typically the forward/back axis in racing sims.
                telemetry_data['Position'].append({
                    'x': row['pos_x'],
                    'y': row['pos_z'],
                    'dist': row['lap_dist'] # Include lap_dist for scrubbing correlation
                })
                # --- CHANGE END ---
            
            if not telemetry_data['Speed']:
                print(f"No telemetry data found for lap_id: {lap_id_int}", flush=True)

            return json.dumps(telemetry_data)
        except Exception as e:
            print(f"Error fetching lap telemetry: {e}", flush=True)
            return json.dumps({})