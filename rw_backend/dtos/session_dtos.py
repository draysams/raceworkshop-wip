# rw_backend/dtos/session_dtos.py

from rw_backend.database.models import Session, Lap, Stint

# --- Helper Functions ---

def _format_time_from_seconds(seconds: float | None) -> str | None:
    """Converts seconds into a MM:SS.mmm format string."""
    if seconds is None or seconds <= 0:
        return None
    minutes = int(seconds // 60)
    remaining_seconds = seconds % 60
    return f"{minutes}:{remaining_seconds:06.3f}"

# --- Mappers ---

def map_session_to_summary_dto(session: Session) -> dict:
    """
    Maps a Session database model to the SessionSummary DTO structure
    expected by the frontend.
    """
    laps = list(Lap.select().join(Stint).where(Stint.session == session))
    valid_laps = [lap for lap in laps if lap.is_valid]

    best_lap_s = min((lap.lap_time for lap in valid_laps), default=None)
    average_lap_s = (sum(lap.lap_time for lap in valid_laps) / len(valid_laps)) if valid_laps else None

    duration_s = (session.ended_at - session.started_at).total_seconds() if session.ended_at else 0

    return {
        "id": session.id,
        "simulator": "lmu",
        "track": session.track_name,
        "car": session.car_model,
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
    """
    Maps a Lap database model to the LapData DTO structure
    expected by the frontend.
    """
    return {
        "lapNumber": lap.lap_number,
        "lapTime": _format_time_from_seconds(lap.lap_time),
        "lapTimeMs": lap.lap_time * 1000,
        "sector1": _format_time_from_seconds(lap.sector1_time),
        "sector1Ms": lap.sector1_time * 1000 if lap.sector1_time else 0,
        "sector2": _format_time_from_seconds(lap.sector2_time),
        "sector2Ms": lap.sector2_time * 1000 if lap.sector2_time else 0,
        "sector3": _format_time_from_seconds(lap.sector3_time),
        "sector3Ms": lap.sector3_time * 1000 if lap.sector3_time else 0,
        "isValid": lap.is_valid,
        "delta": 0,
        "fuelUsed": 0,
        "tyrePressure": {"fl": 0, "fr": 0, "rl": 0, "rr": 0},
        "speed": {"sector1": 0, "sector2": 0, "sector3": 0, "topSpeed": 0},
    }