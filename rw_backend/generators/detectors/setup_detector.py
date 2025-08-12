# rw_backend/generators/detectors/setup_detector.py

import json
import hashlib
import requests
from rw_backend.database.models import Setup

class SetupDetector:
    """
    Detects the active car setup by calling the LMU Garage API
    and finds or creates a corresponding record in the database.
    """
    LMU_SUMMARY_API_URL = "http://localhost:6397/rest/garage/summary"
    LMU_OVERVIEW_API_URL = "http://localhost:6397/rest/garage/UIScreen/CarSetupOverview"

    def get_setup_for_stint(self, car_id, track_id):
        """
        Fetches the current setup, calculates its checksum from the summary,
        and returns the database ID, creating a new record if needed by fetching
        richer data from the overview endpoint.
        """
        try:
            # --- STEP 1: Get summary data for identification ---
            summary_response = requests.get(self.LMU_SUMMARY_API_URL, timeout=1)
            summary_response.raise_for_status()
            summary_data = summary_response.json()
            
            setup_name = summary_data.get('activeSetup')
            settings_summary_obj = summary_data.get('settingSummaries')

            if not setup_name or not settings_summary_obj:
                print("[SetupDetector] WARNING: Could not find setup info in /summary response.", flush=True)
                return None
            
            # --- THIS IS THE FIX: Create checksum from the settingSummaries object ---
            settings_summary_json = json.dumps(settings_summary_obj, sort_keys=True)
            checksum = hashlib.sha256(settings_summary_json.encode('utf-8')).hexdigest()
            # --- END FIX ---

            # --- STEP 2: Check if this exact setup already exists ---
            existing_setup = Setup.get_or_none(checksum=checksum)
            if existing_setup:
                print(f"[SetupDetector] Existing setup '{setup_name}' (ID #{existing_setup.id}) detected.", flush=True)
                return existing_setup.id

            # --- STEP 3: If new, and only if new, get the detailed data ---
            print(f"[SetupDetector] New setup '{setup_name}' detected. Fetching details...", flush=True)
            overview_response = requests.get(self.LMU_OVERVIEW_API_URL, timeout=1)
            overview_response.raise_for_status()
            overview_data = overview_response.json()

            # Extract the necessary objects for storage
            setup_details_obj = overview_data.get('carSetup', {}).get('garageValues', {})
            weather_details_obj = overview_data.get('currentWeather', {})
            
            summary_json = json.dumps(summary_data, sort_keys=True)
            setup_details_json = json.dumps(setup_details_obj, sort_keys=True)
            weather_details_json = json.dumps(weather_details_obj, sort_keys=True)

            # --- STEP 4: Create the new record with all data ---
            new_setup = Setup.create(
                car_id=car_id,
                track_id=track_id,
                name=setup_name,
                checksum=checksum,
                summary_data=summary_json,
                setup_details=setup_details_json,
                weather_details=weather_details_json
            )
            
            print(f"[SetupDetector] Stored new setup with ID #{new_setup.id}", flush=True)
            return new_setup.id

        except requests.exceptions.RequestException as e:
            print(f"[SetupDetector] WARNING: Could not connect to LMU Garage API: {e}", flush=True)
            return None
        except Exception as e:
            print(f"[SetupDetector] ERROR: An error occurred while fetching setup: {e}", flush=True)
            return None