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

            # Initialize the final JSON structure with separate keys
            response_data = {
                'telemetry': {
                    'speed':    {'label': 'Speed', 'data': [], 'borderColor': '#007BFF', 'interpolate': True},
                    'throttle': {'label': 'Throttle', 'data': [], 'borderColor': '#198754', 'interpolate': True},
                    'brake':    {'label': 'Brake', 'data': [], 'borderColor': '#DC3545', 'interpolate': True},
                    'rpm':      {'label': 'RPM', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                    'gear':     {'label': 'Gear', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True, 'stepped': True},
                    'steering': {'label': 'Steering', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
                    'fuelLevel': {'label': 'Fuel Level', 'data': [], 'borderColor': '#FF6B35', 'interpolate': True},
                    'tirePressure': {
                        'fl': {'label': 'Tire Pressure FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                        'fr': {'label': 'Tire Pressure FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                        'rl': {'label': 'Tire Pressure RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                        'rr': {'label': 'Tire Pressure RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                    },
                    'tireWear': {
                        'fl': {'label': 'Tire Wear FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                        'fr': {'label': 'Tire Wear FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                        'rl': {'label': 'Tire Wear RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                        'rr': {'label': 'Tire Wear RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                    },
                    'tireTemp': {
                        'fl': {'label': 'Tire Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                        'fr': {'label': 'Tire Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                        'rl': {'label': 'Tire Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                        'rr': {'label': 'Tire Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                    },
                    'brakeTemp': {
                        'fl': {'label': 'Brake Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                        'fr': {'label': 'Brake Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                        'rl': {'label': 'Brake Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                        'rr': {'label': 'Brake Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                    },
                    'rideHeight': {
                        'fl': {'label': 'Ride Height FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                        'fr': {'label': 'Ride Height FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                        'rl': {'label': 'Ride Height RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                        'rr': {'label': 'Ride Height RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                    },
                    'timeIntoLap': {'label': 'Time Into Lap', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                    'estimatedLapTime': {'label': 'Estimated Lap Time', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True},
                    'trackEdge': {'label': 'Track Edge', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
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
                response_data['telemetry']['fuelLevel']['data'].append({'x': dist, 'y': row['fuel_level']})
                
                # Tire pressures
                response_data['telemetry']['tirePressure']['fl']['data'].append({'x': dist, 'y': row['tire_pressure_fl']})
                response_data['telemetry']['tirePressure']['fr']['data'].append({'x': dist, 'y': row['tire_pressure_fr']})
                response_data['telemetry']['tirePressure']['rl']['data'].append({'x': dist, 'y': row['tire_pressure_rl']})
                response_data['telemetry']['tirePressure']['rr']['data'].append({'x': dist, 'y': row['tire_pressure_rr']})
                
                # Tire wear
                response_data['telemetry']['tireWear']['fl']['data'].append({'x': dist, 'y': row['tire_wear_fl']})
                response_data['telemetry']['tireWear']['fr']['data'].append({'x': dist, 'y': row['tire_wear_fr']})
                response_data['telemetry']['tireWear']['rl']['data'].append({'x': dist, 'y': row['tire_wear_rl']})
                response_data['telemetry']['tireWear']['rr']['data'].append({'x': dist, 'y': row['tire_wear_rr']})
                
                # Tire temps
                response_data['telemetry']['tireTemp']['fl']['data'].append({'x': dist, 'y': row['tire_temp_fl']})
                response_data['telemetry']['tireTemp']['fr']['data'].append({'x': dist, 'y': row['tire_temp_fr']})
                response_data['telemetry']['tireTemp']['rl']['data'].append({'x': dist, 'y': row['tire_temp_rl']})
                response_data['telemetry']['tireTemp']['rr']['data'].append({'x': dist, 'y': row['tire_temp_rr']})
                
                # Brake temps
                response_data['telemetry']['brakeTemp']['fl']['data'].append({'x': dist, 'y': row['brake_temp_fl']})
                response_data['telemetry']['brakeTemp']['fr']['data'].append({'x': dist, 'y': row['brake_temp_fr']})
                response_data['telemetry']['brakeTemp']['rl']['data'].append({'x': dist, 'y': row['brake_temp_rl']})
                response_data['telemetry']['brakeTemp']['rr']['data'].append({'x': dist, 'y': row['brake_temp_rr']})
                
                # Ride height
                response_data['telemetry']['rideHeight']['fl']['data'].append({'x': dist, 'y': row['ride_height_fl']})
                response_data['telemetry']['rideHeight']['fr']['data'].append({'x': dist, 'y': row['ride_height_fr']})
                response_data['telemetry']['rideHeight']['rl']['data'].append({'x': dist, 'y': row['ride_height_rl']})
                response_data['telemetry']['rideHeight']['rr']['data'].append({'x': dist, 'y': row['ride_height_rr']})
                
                # Session context fields
                response_data['telemetry']['timeIntoLap']['data'].append({'x': dist, 'y': row['time_into_lap']})
                response_data['telemetry']['estimatedLapTime']['data'].append({'x': dist, 'y': row['estimated_lap_time']})
                response_data['telemetry']['trackEdge']['data'].append({'x': dist, 'y': row['track_edge']})

                # Append to the track path
                response_data['trackpath'].append({
                    'distance': dist,
                    'x': -row['pos_x'],
                    'y': row['pos_z'] # Use Z for the 2D map's Y-axis
                })

            if not all_rows:
                print(f"No telemetry data found for lap_id: {lap_id_int}", flush=True)
            
            return json.dumps(response_data)

        except Exception as e:
            print(f"Error fetching lap telemetry: {e}", flush=True)
            return json.dumps({'telemetry': {}, 'trackpath': []}) # Return empty valid structure on error

    def compareLaps(self, lapId1, lapId2):
        """
        Fetches telemetry data for two laps and returns them in a comparison format.
        """
        print(f"API CALL: compareLaps for laps {lapId1} and {lapId2}", flush=True)
        try:
            lap_id_1_int = int(lapId1)
            lap_id_2_int = int(lapId2)

            # Fetch data for both laps
            query1 = (LapTelemetry
                     .select()
                     .where(LapTelemetry.lap == lap_id_1_int)
                     .order_by(LapTelemetry.lap_dist)
                     .dicts())
            
            query2 = (LapTelemetry
                     .select()
                     .where(LapTelemetry.lap == lap_id_2_int)
                     .order_by(LapTelemetry.lap_dist)
                     .dicts())

            # Initialize the comparison response structure
            response_data = {
                'lap1': {
                    'lapId': lap_id_1_int,
                    'telemetry': {
                        'speed':    {'label': 'Speed', 'data': [], 'borderColor': '#007BFF', 'interpolate': True},
                        'throttle': {'label': 'Throttle', 'data': [], 'borderColor': '#198754', 'interpolate': True},
                        'brake':    {'label': 'Brake', 'data': [], 'borderColor': '#DC3545', 'interpolate': True},
                        'rpm':      {'label': 'RPM', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                        'gear':     {'label': 'Gear', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True, 'stepped': True},
                        'steering': {'label': 'Steering', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
                        'fuelLevel': {'label': 'Fuel Level', 'data': [], 'borderColor': '#FF6B35', 'interpolate': True},
                        'tirePressure': {
                            'fl': {'label': 'Tire Pressure FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Pressure FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Pressure RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Pressure RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'tireWear': {
                            'fl': {'label': 'Tire Wear FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Wear FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Wear RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Wear RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'tireTemp': {
                            'fl': {'label': 'Tire Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'brakeTemp': {
                            'fl': {'label': 'Brake Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Brake Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Brake Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Brake Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'rideHeight': {
                            'fl': {'label': 'Ride Height FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Ride Height FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Ride Height RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Ride Height RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'timeIntoLap': {'label': 'Time Into Lap', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                        'estimatedLapTime': {'label': 'Estimated Lap Time', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True},
                        'trackEdge': {'label': 'Track Edge', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
                    },
                    'trackpath': []
                },
                'lap2': {
                    'lapId': lap_id_2_int,
                    'telemetry': {
                        'speed':    {'label': 'Speed', 'data': [], 'borderColor': '#FF6B35', 'interpolate': True},
                        'throttle': {'label': 'Throttle', 'data': [], 'borderColor': '#FFD700', 'interpolate': True},
                        'brake':    {'label': 'Brake', 'data': [], 'borderColor': '#FF69B4', 'interpolate': True},
                        'rpm':      {'label': 'RPM', 'data': [], 'borderColor': '#00CED1', 'interpolate': True},
                        'gear':     {'label': 'Gear', 'data': [], 'borderColor': '#32CD32', 'interpolate': True, 'stepped': True},
                        'steering': {'label': 'Steering', 'data': [], 'borderColor': '#9370DB', 'interpolate': True},
                        'fuelLevel': {'label': 'Fuel Level', 'data': [], 'borderColor': '#FF6B35', 'interpolate': True},
                        'tirePressure': {
                            'fl': {'label': 'Tire Pressure FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Pressure FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Pressure RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Pressure RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'tireWear': {
                            'fl': {'label': 'Tire Wear FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Wear FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Wear RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Wear RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'tireTemp': {
                            'fl': {'label': 'Tire Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Tire Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Tire Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Tire Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'brakeTemp': {
                            'fl': {'label': 'Brake Temp FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Brake Temp FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Brake Temp RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Brake Temp RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'rideHeight': {
                            'fl': {'label': 'Ride Height FL', 'data': [], 'borderColor': '#28a745', 'interpolate': True},
                            'fr': {'label': 'Ride Height FR', 'data': [], 'borderColor': '#17a2b8', 'interpolate': True},
                            'rl': {'label': 'Ride Height RL', 'data': [], 'borderColor': '#ffc107', 'interpolate': True},
                            'rr': {'label': 'Ride Height RR', 'data': [], 'borderColor': '#dc3545', 'interpolate': True}
                        },
                        'timeIntoLap': {'label': 'Time Into Lap', 'data': [], 'borderColor': '#6f42c1', 'interpolate': True},
                        'estimatedLapTime': {'label': 'Estimated Lap Time', 'data': [], 'borderColor': '#fd7e14', 'interpolate': True},
                        'trackEdge': {'label': 'Track Edge', 'data': [], 'borderColor': '#0dcaf0', 'interpolate': True},
                    },
                    'trackpath': []
                }
            }

            # Process lap 1 data
            all_rows_1 = list(query1)
            for row in all_rows_1:
                dist = row['lap_dist']
                
                # Append to telemetry channels for lap 1
                response_data['lap1']['telemetry']['speed']['data'].append({'x': dist, 'y': row['speed']})
                response_data['lap1']['telemetry']['throttle']['data'].append({'x': dist, 'y': row['throttle']})
                response_data['lap1']['telemetry']['brake']['data'].append({'x': dist, 'y': row['brake']})
                response_data['lap1']['telemetry']['rpm']['data'].append({'x': dist, 'y': row['rpm']})
                response_data['lap1']['telemetry']['gear']['data'].append({'x': dist, 'y': row['gear']})
                response_data['lap1']['telemetry']['steering']['data'].append({'x': dist, 'y': row['steering']})
                response_data['lap1']['telemetry']['fuelLevel']['data'].append({'x': dist, 'y': row['fuel_level']})
                
                # Tire pressures
                response_data['lap1']['telemetry']['tirePressure']['fl']['data'].append({'x': dist, 'y': row['tire_pressure_fl']})
                response_data['lap1']['telemetry']['tirePressure']['fr']['data'].append({'x': dist, 'y': row['tire_pressure_fr']})
                response_data['lap1']['telemetry']['tirePressure']['rl']['data'].append({'x': dist, 'y': row['tire_pressure_rl']})
                response_data['lap1']['telemetry']['tirePressure']['rr']['data'].append({'x': dist, 'y': row['tire_pressure_rr']})
                
                # Tire wear
                response_data['lap1']['telemetry']['tireWear']['fl']['data'].append({'x': dist, 'y': row['tire_wear_fl']})
                response_data['lap1']['telemetry']['tireWear']['fr']['data'].append({'x': dist, 'y': row['tire_wear_fr']})
                response_data['lap1']['telemetry']['tireWear']['rl']['data'].append({'x': dist, 'y': row['tire_wear_rl']})
                response_data['lap1']['telemetry']['tireWear']['rr']['data'].append({'x': dist, 'y': row['tire_wear_rr']})
                
                # Tire temps
                response_data['lap1']['telemetry']['tireTemp']['fl']['data'].append({'x': dist, 'y': row['tire_temp_fl']})
                response_data['lap1']['telemetry']['tireTemp']['fr']['data'].append({'x': dist, 'y': row['tire_temp_fr']})
                response_data['lap1']['telemetry']['tireTemp']['rl']['data'].append({'x': dist, 'y': row['tire_temp_rl']})
                response_data['lap1']['telemetry']['tireTemp']['rr']['data'].append({'x': dist, 'y': row['tire_temp_rr']})
                
                # Brake temps
                response_data['lap1']['telemetry']['brakeTemp']['fl']['data'].append({'x': dist, 'y': row['brake_temp_fl']})
                response_data['lap1']['telemetry']['brakeTemp']['fr']['data'].append({'x': dist, 'y': row['brake_temp_fr']})
                response_data['lap1']['telemetry']['brakeTemp']['rl']['data'].append({'x': dist, 'y': row['brake_temp_rl']})
                response_data['lap1']['telemetry']['brakeTemp']['rr']['data'].append({'x': dist, 'y': row['brake_temp_rr']})
                
                # Ride height
                response_data['lap1']['telemetry']['rideHeight']['fl']['data'].append({'x': dist, 'y': row['ride_height_fl']})
                response_data['lap1']['telemetry']['rideHeight']['fr']['data'].append({'x': dist, 'y': row['ride_height_fr']})
                response_data['lap1']['telemetry']['rideHeight']['rl']['data'].append({'x': dist, 'y': row['ride_height_rl']})
                response_data['lap1']['telemetry']['rideHeight']['rr']['data'].append({'x': dist, 'y': row['ride_height_rr']})
                
                # Session context fields
                response_data['lap1']['telemetry']['timeIntoLap']['data'].append({'x': dist, 'y': row['time_into_lap']})
                response_data['lap1']['telemetry']['estimatedLapTime']['data'].append({'x': dist, 'y': row['estimated_lap_time']})
                response_data['lap1']['telemetry']['trackEdge']['data'].append({'x': dist, 'y': row['track_edge']})

                # Append to track path for lap 1
                response_data['lap1']['trackpath'].append({
                    'distance': dist,
                    'x': -row['pos_x'],
                    'y': row['pos_z']
                })

            # Process lap 2 data
            all_rows_2 = list(query2)
            for row in all_rows_2:
                dist = row['lap_dist']
                
                # Append to telemetry channels for lap 2
                response_data['lap2']['telemetry']['speed']['data'].append({'x': dist, 'y': row['speed']})
                response_data['lap2']['telemetry']['throttle']['data'].append({'x': dist, 'y': row['throttle']})
                response_data['lap2']['telemetry']['brake']['data'].append({'x': dist, 'y': row['brake']})
                response_data['lap2']['telemetry']['rpm']['data'].append({'x': dist, 'y': row['rpm']})
                response_data['lap2']['telemetry']['gear']['data'].append({'x': dist, 'y': row['gear']})
                response_data['lap2']['telemetry']['steering']['data'].append({'x': dist, 'y': row['steering']})
                response_data['lap2']['telemetry']['fuelLevel']['data'].append({'x': dist, 'y': row['fuel_level']})
                
                # Tire pressures
                response_data['lap2']['telemetry']['tirePressure']['fl']['data'].append({'x': dist, 'y': row['tire_pressure_fl']})
                response_data['lap2']['telemetry']['tirePressure']['fr']['data'].append({'x': dist, 'y': row['tire_pressure_fr']})
                response_data['lap2']['telemetry']['tirePressure']['rl']['data'].append({'x': dist, 'y': row['tire_pressure_rl']})
                response_data['lap2']['telemetry']['tirePressure']['rr']['data'].append({'x': dist, 'y': row['tire_pressure_rr']})
                
                # Tire wear
                response_data['lap2']['telemetry']['tireWear']['fl']['data'].append({'x': dist, 'y': row['tire_wear_fl']})
                response_data['lap2']['telemetry']['tireWear']['fr']['data'].append({'x': dist, 'y': row['tire_wear_fr']})
                response_data['lap2']['telemetry']['tireWear']['rl']['data'].append({'x': dist, 'y': row['tire_wear_rl']})
                response_data['lap2']['telemetry']['tireWear']['rr']['data'].append({'x': dist, 'y': row['tire_wear_rr']})
                
                # Tire temps
                response_data['lap2']['telemetry']['tireTemp']['fl']['data'].append({'x': dist, 'y': row['tire_temp_fl']})
                response_data['lap2']['telemetry']['tireTemp']['fr']['data'].append({'x': dist, 'y': row['tire_temp_fr']})
                response_data['lap2']['telemetry']['tireTemp']['rl']['data'].append({'x': dist, 'y': row['tire_temp_rl']})
                response_data['lap2']['telemetry']['tireTemp']['rr']['data'].append({'x': dist, 'y': row['tire_temp_rr']})
                
                # Brake temps
                response_data['lap2']['telemetry']['brakeTemp']['fl']['data'].append({'x': dist, 'y': row['brake_temp_fl']})
                response_data['lap2']['telemetry']['brakeTemp']['fr']['data'].append({'x': dist, 'y': row['brake_temp_fr']})
                response_data['lap2']['telemetry']['brakeTemp']['rl']['data'].append({'x': dist, 'y': row['brake_temp_rl']})
                response_data['lap2']['telemetry']['brakeTemp']['rr']['data'].append({'x': dist, 'y': row['brake_temp_rr']})
                
                # Ride height
                response_data['lap2']['telemetry']['rideHeight']['fl']['data'].append({'x': dist, 'y': row['ride_height_fl']})
                response_data['lap2']['telemetry']['rideHeight']['fr']['data'].append({'x': dist, 'y': row['ride_height_fr']})
                response_data['lap2']['telemetry']['rideHeight']['rl']['data'].append({'x': dist, 'y': row['ride_height_rl']})
                response_data['lap2']['telemetry']['rideHeight']['rr']['data'].append({'x': dist, 'y': row['ride_height_rr']})
                
                # Session context fields
                response_data['lap2']['telemetry']['timeIntoLap']['data'].append({'x': dist, 'y': row['time_into_lap']})
                response_data['lap2']['telemetry']['estimatedLapTime']['data'].append({'x': dist, 'y': row['estimated_lap_time']})
                response_data['lap2']['telemetry']['trackEdge']['data'].append({'x': dist, 'y': row['track_edge']})

                # Append to track path for lap 2
                response_data['lap2']['trackpath'].append({
                    'distance': dist,
                    'x': -row['pos_x'],
                    'y': row['pos_z']
                })

            if not all_rows_1:
                print(f"No telemetry data found for lap_id: {lap_id_1_int}", flush=True)
            if not all_rows_2:
                print(f"No telemetry data found for lap_id: {lap_id_2_int}", flush=True)
            
            return json.dumps(response_data)

        except Exception as e:
            print(f"Error comparing laps: {e}", flush=True)
            return json.dumps({'lap1': {'lapId': lapId1, 'telemetry': {}, 'trackpath': []}, 
                             'lap2': {'lapId': lapId2, 'telemetry': {}, 'trackpath': []}})