# rw_backend/dtos/session_dtos.py

import json
from rw_backend.database.models import Session, Lap, Stint, Setup, Car, Track, Driver, Simulator
import peewee as pw

# --- Helper Functions ---
def _format_time_from_seconds(seconds: float | None) -> str | None:
    if seconds is None or seconds <= 0:
        return None
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}:{remaining_seconds:06.3f}"

# --- NEW: Helper mapper for Setup ---
def _map_setup_to_dto(setup: Setup) -> dict | None:
    if not setup:
        return None
    return {
        "id": setup.id,
        "name": setup.name,
        "summary": json.loads(setup.summary_data),
        "details": json.loads(setup.setup_details),
        "weather": json.loads(setup.weather_details)
    }

# --- NEW: Helper mapper for Stint ---
def _map_stint_to_dto(stint: Stint) -> dict:
    return {
        "id": stint.id,
        "stintNumber": stint.stint_number,
        "startedOnLap": stint.started_on_lap,
        "endedOnLap": stint.ended_on_lap,
        "setup": _map_setup_to_dto(stint.setup)
    }

# --- Mappers ---

def map_session_to_summary_dto(session: Session) -> dict:
    laps = list(Lap.select().join(Stint).where(Stint.session == session))
    valid_laps = [lap for lap in laps if lap.is_valid]
    best_lap_s = min((lap.lap_time for lap in valid_laps), default=None)
    average_lap_s = (sum(lap.lap_time for lap in valid_laps) / len(valid_laps)) if valid_laps else None
    duration_s = (session.ended_at - session.started_at).total_seconds() if session.ended_at else 0
    
    return {
        "id": session.id,
        "simulator": session.simulator.name.lower().replace(" ", ""),
        "track": {
            "id": session.track.id,
            "displayName": session.track.display_name,
            "shortName": session.track.short_name
        },
        "car": {
            "id": session.car.id,
            "displayName": session.car.display_name,
            "class": session.car.car_class
        },
        "sessionType": session.session_type,
        "date": session.started_at.isoformat(),
        "dateEnded": session.ended_at.isoformat() if session.ended_at else None,
        "duration": _format_time_from_seconds(duration_s) or "0:00.000",
        "durationMs": duration_s * 1000,
        "bestLap": _format_time_from_seconds(best_lap_s),
        "bestLapMs": best_lap_s * 1000 if best_lap_s else None,
        "averageLap": _format_time_from_seconds(average_lap_s),
        "averageLapMs": average_lap_s * 1000 if average_lap_s else None,
        "totalLaps": len(laps),
        "validLaps": len(valid_laps),
        "distance": 0.0,
        "fuelUsed": 0.0,
        "weather": "Clear",
        "trackTemp": session.track_temp,
        "airTemp": session.air_temp,
    }

def map_lap_to_detail_dto(lap: Lap) -> dict:
    return {
        "id": lap.id,
        "lapNumber": lap.lap_number,
        "stintId": lap.stint.id,
        "lapTime": _format_time_from_seconds(lap.lap_time),
        "lapTimeMs": lap.lap_time * 1000 if lap.lap_time else 0,
        "sector1": _format_time_from_seconds(lap.sector1_time),
        "sector1Ms": lap.sector1_time * 1000 if lap.sector1_time else 0,
        "sector2": _format_time_from_seconds(lap.sector2_time),
        "sector2Ms": lap.sector2_time * 1000 if lap.sector2_time else 0,
        "sector3": _format_time_from_seconds(lap.sector3_time),
        "sector3Ms": lap.sector3_time * 1000 if lap.sector3_time else 0,
        "isValid": lap.is_valid,
    }

# --- NEW: Mapper for the complete, nested Session Detail object ---
def map_session_to_detail_dto(session: Session) -> dict:
    """
    Builds the complete, nested session object required by the Session Detail UI.
    This is the main "chunky" DTO.
    """
    # Eagerly fetch all related data in as few queries as possible
    stints_query = Stint.select(Stint, Setup).join(Setup, join_type=pw.JOIN.LEFT_OUTER).where(Stint.session == session)
    laps_query = Lap.select().join(Stint).where(Stint.session == session).order_by(Lap.lap_number)

    stints_dto = [_map_stint_to_dto(s) for s in stints_query]
    laps_dto = [map_lap_to_detail_dto(l) for l in laps_query]

    # Use the summary DTO as a base to avoid duplicating logic
    summary = map_session_to_summary_dto(session)
    
    # Add the detailed, nested data
    summary.update({
        "stints": stints_dto,
        "laps": laps_dto,
        # Add full track and car objects
        "track": {
            "id": session.track.id,
            "displayName": session.track.display_name,
            "shortName": session.track.short_name,
            "lengthM": session.track.length_m,
            "type": session.track.type,
            "imagePath": session.track.image_path
        },
        "car": {
            "id": session.car.id,
            "displayName": session.car.display_name,
            "model": session.car.model,
            "class": session.car.car_class,
            "season": session.car.season,
            "manufacturer": session.car.manufacturer,
            "engine": session.car.engine,
            "thumbnailUrl": session.car.thumbnail_url
        }
    })
    
    return summary