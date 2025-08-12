# rw_backend/dtos/session_dtos.py

import json
from datetime import timedelta
import statistics
from rw_backend.database.models import Session, Lap, Stint, Setup, Car, Track, Driver, Simulator, LapTelemetry
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
def _map_stint_to_dto(stint: Stint, all_stint_laps: list[Lap]) -> dict:
    """Calculates all detailed stats for a single stint."""
    valid_laps = [lap for lap in all_stint_laps if lap.is_valid]
    
    best_lap_s = min((lap.lap_time for lap in valid_laps), default=None)
    avg_lap_s = statistics.mean(lap.lap_time for lap in valid_laps) if valid_laps else None
    
    # Calculate Optimal Lap for the stint
    best_s1 = min((lap.sector1_time for lap in valid_laps if lap.sector1_time and lap.sector1_time > 0), default=0)
    best_s2 = min((lap.sector2_time for lap in valid_laps if lap.sector2_time and lap.sector2_time > 0), default=0)
    best_s3 = min((lap.sector3_time for lap in valid_laps if lap.sector3_time and lap.sector3_time > 0), default=0)
    optimal_lap_s = best_s1 + best_s2 + best_s3 if best_s1 and best_s2 and best_s3 else None

    # Calculate Consistency for the stint
    lap_times = [lap.lap_time for lap in valid_laps]
    consistency = "N/A"
    if len(lap_times) >= 2:
        mean_lap_time = statistics.mean(lap_times)
        std_dev = statistics.stdev(lap_times)
        consistency = f"{max(0, (1 - (std_dev / mean_lap_time)) * 100):.1f}%"

    # Derive Start/End Times
    first_lap = all_stint_laps[0] if all_stint_laps else None
    last_lap = all_stint_laps[-1] if all_stint_laps else None
    start_time = first_lap.timestamp.isoformat() if first_lap else None
    end_time = (last_lap.timestamp + timedelta(seconds=last_lap.lap_time)).isoformat() if last_lap and last_lap.lap_time > 0 else None

    # Fuel Used (This is an approximation as the first snapshot might not be at lap start)
    first_telemetry = LapTelemetry.select(LapTelemetry.fuel_level).join(Lap).where(Lap.stint == stint).order_by(LapTelemetry.id.asc()).first()
    last_telemetry = LapTelemetry.select(LapTelemetry.fuel_level).join(Lap).where(Lap.stint == stint).order_by(LapTelemetry.id.desc()).first()
    fuel_used = (first_telemetry.fuel_level - last_telemetry.fuel_level) if first_telemetry and last_telemetry else 0.0

    return {
        "id": stint.id, "stintNumber": stint.stint_number, "startedOnLap": stint.started_on_lap,
        "endedOnLap": stint.ended_on_lap, "setup": _map_setup_to_dto(stint.setup),
        "bestLap": _format_time_from_seconds(best_lap_s), "averageLap": _format_time_from_seconds(avg_lap_s),
        "optimalLap": _format_time_from_seconds(optimal_lap_s), "consistency": consistency,
        "fuelUsed": round(fuel_used, 2), "startTime": start_time, "endTime": end_time,
    }
# --- Mappers ---


def _get_session_analytics(session: Session, all_laps: list[Lap], valid_laps: list[Lap]):
    """Calculates advanced analytics for an entire session."""
    # Optimal Lap for the session
    best_s1 = min((lap.sector1_time for lap in valid_laps if lap.sector1_time and lap.sector1_time > 0), default=0)
    best_s2 = min((lap.sector2_time for lap in valid_laps if lap.sector2_time and lap.sector2_time > 0), default=0)
    best_s3 = min((lap.sector3_time for lap in valid_laps if lap.sector3_time and lap.sector3_time > 0), default=0)
    optimal_lap_s = best_s1 + best_s2 + best_s3 if best_s1 and best_s2 and best_s3 else None

    # Fuel Used for the session
    first_telemetry = LapTelemetry.select(LapTelemetry.fuel_level).join(Lap).join(Stint).where(Stint.session == session).order_by(LapTelemetry.id.asc()).first()
    last_telemetry = LapTelemetry.select(LapTelemetry.fuel_level).join(Lap).join(Stint).where(Stint.session == session).order_by(LapTelemetry.id.desc()).first()
    fuel_used = (first_telemetry.fuel_level - last_telemetry.fuel_level) if first_telemetry and last_telemetry else 0.0

    # Distance Covered
    distance_m = len(all_laps) * session.track.length_m
    
    return {
        "optimalLap": _format_time_from_seconds(optimal_lap_s),
        "fuelUsed": round(fuel_used, 2),
        "distanceCovered": round(distance_m / 1000, 2), # in KM
    }

def _get_session_analytics(session: Session, all_laps: list[Lap], valid_laps: list[Lap], stints_dto: list[dict]):
    """Calculates advanced analytics for an entire session."""
    best_s1 = min((lap.sector1_time for lap in valid_laps if lap.sector1_time and lap.sector1_time > 0), default=0)
    best_s2 = min((lap.sector2_time for lap in valid_laps if lap.sector2_time and lap.sector2_time > 0), default=0)
    best_s3 = min((lap.sector3_time for lap in valid_laps if lap.sector3_time and lap.sector3_time > 0), default=0)
    optimal_lap_s = best_s1 + best_s2 + best_s3 if best_s1 and best_s2 and best_s3 else None

    # This is the fix: Sum the fuel used from each stint instead of running a new query.
    total_fuel_used = sum(stint.get('fuelUsed', 0) for stint in stints_dto)

    distance_m = len(all_laps) * session.track.length_m
    
    return {
        "optimalLap": _format_time_from_seconds(optimal_lap_s),
        "fuelUsed": round(total_fuel_used, 2),
        "distanceCovered": round(distance_m / 1000, 2),
    }


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
    """Builds the complete, nested session object with all advanced analytics."""
    laps_query = Lap.select().join(Stint).where(Stint.session == session).order_by(Lap.lap_number)
    all_laps = list(laps_query)
    valid_laps = [lap for lap in all_laps if lap.is_valid]
    
    stints_query = Stint.select(Stint, Setup).join(Setup, join_type=pw.JOIN.LEFT_OUTER).where(Stint.session == session)
    stints_dto = [
        _map_stint_to_dto(s, [l for l in all_laps if l.stint_id == s.id]) for s in stints_query
    ]
    
    laps_dto = [map_lap_to_detail_dto(l) for l in all_laps]
    analytics = _get_session_analytics(session, all_laps, valid_laps, stints_dto)

    best_lap_s = min((lap.lap_time for lap in valid_laps), default=None)
    duration_s = (session.ended_at - session.started_at).total_seconds() if session.ended_at else 0

    return {
        "id": session.id,
        "simulator": session.simulator.name,
        "sessionType": session.session_type,
        "date": session.started_at.isoformat(),
        "dateEnded": session.ended_at.isoformat() if session.ended_at else None,
        "duration": _format_time_from_seconds(duration_s),
        "trackTemp": session.track_temp,
        "airTemp": session.air_temp,
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
        },
        "bestLap": _format_time_from_seconds(best_lap_s),
        "totalLaps": len(all_laps),
        "validLaps": len(valid_laps),
        "stints": stints_dto,
        "laps": laps_dto,
        "analytics": analytics
    }