import requests
import json
import os
import urllib.parse
from pathlib import Path

# --- Configuration ---
# URLs for the LMU local server
API_URL = "http://localhost:6397/rest/race/car"
BASE_IMAGE_URL = "http://localhost:6397/start/images"

# --- Output Directories ---
# A main folder to hold all generated content
OUTPUT_DIR = "lmu_seed_output"
# Where the final JSON seed file will be saved
SEED_FILE_PATH = os.path.join(OUTPUT_DIR, "seed_data.json")
# Local paths for the downloaded assets
CARS_ASSET_DIR = os.path.join(OUTPUT_DIR, "assets", "cars", "thumb")
MANUFACTURER_ASSET_DIR = os.path.join(OUTPUT_DIR, "assets", "manufacturer", "logos")


def fetch_car_data():
    """Fetches the complete car list from the game's API."""
    print(f"Attempting to fetch car data from {API_URL}...")
    try:
        response = requests.get(API_URL, timeout=5)
        response.raise_for_status()  # Raises an exception for bad status codes (4xx or 5xx)
        print("Successfully fetched data from the game API.")
        return response.json()
    except requests.exceptions.RequestException as e:
        print("\n--- ERROR ---")
        print(f"Could not connect to the Le Mans Ultimate API: {e}")
        print("Please ensure the following:")
        print("1. Le Mans Ultimate is running.")
        print("2. You are in a menu where cars are listed (e.g., Single Player car selection).")
        return None

def process_data(raw_car_list):
    """Processes the raw API data into the desired seed format."""
    processed_cars = []
    print("Processing raw data into seed format...")

    for car in raw_car_list:
        try:
            # Extract the internal ID from the vehicle file path
            # e.g., "...\61_25_IRONCD7DD0C0.VEH" -> "61_25_IRONCD7DD0C0"
            internal_id = Path(car.get("vehFile", "")).stem

            if not internal_id:
                print(f"Skipping car with missing vehFile: {car.get('displayName')}")
                continue

            # Split the fullTreePath to get season, class, and model
            tree_parts = [part.strip() for part in car.get("fullPathTree", "").split(',')]
            
            season = tree_parts[0] if len(tree_parts) > 0 else "Unknown"
            car_class = tree_parts[1] if len(tree_parts) > 1 else "Unknown"
            model = tree_parts[2] if len(tree_parts) > 2 else "Unknown"
            
            manufacturer = car.get("manufacturer", "Unknown")

            # Create the structured data object for the seed file
            seed_entry = {
                "id": car.get("id"),
                "internal_id": internal_id,
                "displayName": car.get("displayProperties", {}).get("displayName"),
                "season": season,
                "class": car_class,
                "model": model,
                "manufacturer": manufacturer,
                "thumbnail_url": f"/assets/cars/thumb/{internal_id}.webp",
                "manufacturer_thumbnail_url": f"/assets/manufacturer/logos/{manufacturer}.svg",
                "engine": car.get("engine")
            }
            processed_cars.append(seed_entry)
        except Exception as e:
            print(f"Could not process car: {car.get('displayName')}. Error: {e}")
            
    print(f"Successfully processed {len(processed_cars)} cars.")
    return processed_cars

def download_assets(processed_data):
    """Downloads all unique car thumbnails and manufacturer logos."""
    print("\n--- Starting Asset Download ---")
    
    # Create the output directories if they don't exist
    os.makedirs(CARS_ASSET_DIR, exist_ok=True)
    os.makedirs(MANUFACTURER_ASSET_DIR, exist_ok=True)

    # --- Download Car Thumbnails ---
    print(f"\nDownloading car thumbnails to '{CARS_ASSET_DIR}'...")
    for car in processed_data:
        internal_id = car["internal_id"]
        # The game uses "_frontAngle.webp" for the filename
        image_name = f"{internal_id}_frontAngle.webp"
        source_url = f"{BASE_IMAGE_URL}/cars/{image_name}"
        # Save it locally without the "_frontAngle" part for simplicity
        local_path = os.path.join(CARS_ASSET_DIR, f"{internal_id}.webp")

        if not os.path.exists(local_path):
            try:
                img_response = requests.get(source_url, stream=True, timeout=5)
                if img_response.status_code == 200:
                    with open(local_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"  Downloaded: {internal_id}.webp")
                else:
                    print(f"  NOT FOUND (404): {image_name}")
            except requests.exceptions.RequestException as e:
                print(f"  FAILED to download {image_name}: {e}")
        else:
            print(f"  Skipped (already exists): {internal_id}.webp")
            
    # --- Download Manufacturer Logos ---
    # Get a unique set of manufacturers
    unique_manufacturers = {car["manufacturer"] for car in processed_data if car["manufacturer"] != "Unknown"}
    
    print(f"\nDownloading manufacturer logos to '{MANUFACTURER_ASSET_DIR}'...")
    for manufacturer in unique_manufacturers:
        # URL encode the manufacturer name for the URL (e.g., "Mercedes-AMG")
        encoded_name = urllib.parse.quote_plus(manufacturer)
        source_url = f"{BASE_IMAGE_URL}/manufacturer/Brand={encoded_name}.svg"
        local_path = os.path.join(MANUFACTURER_ASSET_DIR, f"{manufacturer}.svg")

        if not os.path.exists(local_path):
            try:
                img_response = requests.get(source_url, stream=True, timeout=5)
                if img_response.status_code == 200:
                    with open(local_path, 'wb') as f:
                        f.write(img_response.content)
                    print(f"  Downloaded: {manufacturer}.svg")
                else:
                    print(f"  NOT FOUND (404): Brand={encoded_name}.svg")
            except requests.exceptions.RequestException as e:
                print(f"  FAILED to download {manufacturer}.svg: {e}")
        else:
            print(f"  Skipped (already exists): {manufacturer}.svg")


def main():
    """Main function to run the entire process."""
    # 1. Fetch live data from the game
    raw_data = fetch_car_data()
    if not raw_data:
        return # Stop if we couldn't get data

    # 2. Process the data into the desired format
    processed_data = process_data(raw_data)
    if not processed_data:
        print("No data was processed. Exiting.")
        return

    # 3. Save the processed data to a JSON file
    print(f"\nSaving seed data to '{SEED_FILE_PATH}'...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(SEED_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=4)
    print("Seed file created successfully.")

    # 4. Download all the required assets
    download_assets(processed_data)
    
    print("\n--- Process Complete! ---")
    print(f"Check the '{OUTPUT_DIR}' folder for your generated files.")


if __name__ == "__main__":
    main()