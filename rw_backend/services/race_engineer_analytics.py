# rw_backend/services/race_engineer_analytics.py

import peewee as pw
from rw_backend.database.models import Session, Lap, Stint, Car, Track, Setup, LapTelemetry
import statistics
import json

class RaceEngineerAnalytics:
    """
    Service layer for calculating all complex, aggregated stats for the Race Engineer page.
    """

    def _format_time(self, seconds: float | None) -> str | None:
        if seconds is None or seconds <= 0: return "N/A"
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}:{remaining_seconds:06.3f}"

    # --- TRACK VIEW ---
    def get_track_view_stats(self):
        # ... (This method is unchanged and correct) ...
        print("[Analytics] Generating track view stats...", flush=True)
        stats = []
        tracks = Track.select().join(Session).distinct()

        for track in tracks:
            sessions_on_track = Session.select().where(Session.track == track)
            laps_on_track = Lap.select().join(Stint).where(Stint.session << sessions_on_track)
            valid_laps = laps_on_track.where(Lap.is_valid == True)
            
            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()
            
            best_s1 = valid_laps.select(pw.fn.MIN(Lap.sector1_time)).where(Lap.sector1_time > 0).scalar() or 0
            best_s2 = valid_laps.select(pw.fn.MIN(Lap.sector2_time)).where(Lap.sector2_time > 0).scalar() or 0
            best_s3 = valid_laps.select(pw.fn.MIN(Lap.sector3_time)).where(Lap.sector3_time > 0).scalar() or 0
            optimal_time = best_s1 + best_s2 + best_s3 if best_s1 > 0 and best_s2 > 0 and best_s3 > 0 else 0
            
            race_stints = Stint.select().join(Session).where((Session.track == track) & (Session.session_type == 'Race'))
            wins = race_stints.where(Stint.final_place == 1).count()
            podiums = race_stints.where((Stint.final_place <= 3) & (Stint.final_place > 0)).count()
            
            cars_on_track_list = self._get_car_stats_for_track(track, sessions_on_track)
            recent_sessions = self._get_recent_sessions_for_query(sessions_on_track)

            stats.append({
                "id": track.id, "name": track.display_name, "country": "N/A",
                "length": track.length_m / 1000,
                "sessions": sessions_on_track.count(), "cars": cars_on_track_list,
                "totalValidLaps": valid_laps.count(), "totalInvalidLaps": laps_on_track.where(Lap.is_valid == False).count(),
                "raceSessions": sessions_on_track.where(Session.session_type == 'Race').count(),
                "practiceSessions": sessions_on_track.where(Session.session_type == 'Practice').count(),
                "wins": wins, "podiums": podiums,
                "avgLapTime": self._format_time(avg_lap),
                "bestLapTime": self._format_time(best_lap.lap_time if best_lap else None),
                "optimalTime": self._format_time(optimal_time),
                "worldRecord": self._format_time(best_lap.lap_time if best_lap else None),
                "totalDistance": (laps_on_track.count() * track.length_m) / 1000,
                "recentSessions": recent_sessions,
                "lapTimeProgression": [],
            })
        return stats

    def _get_car_stats_for_track(self, track, sessions_on_track):
        cars_list = []
        cars_driven_query = Car.select().join(Session).where(Session.track == track).distinct()
        
        for car in cars_driven_query:
            sessions_with_car = sessions_on_track.where(Session.car == car)
            laps_with_car = Lap.select().join(Stint).where(Stint.session << sessions_with_car)
            valid_laps_with_car = laps_with_car.where(Lap.is_valid == True)
            best_lap_obj = valid_laps_with_car.order_by(Lap.lap_time.asc()).first()
            avg_lap_obj = valid_laps_with_car.select(pw.fn.AVG(Lap.lap_time)).scalar()
            
            cars_list.append({
                "name": car.display_name,
                "validLaps": valid_laps_with_car.count(),
                "invalidLaps": laps_with_car.where(Lap.is_valid == False).count(),
                "bestLap": self._format_time(best_lap_obj.lap_time if best_lap_obj else None),
                "avgLap": self._format_time(avg_lap_obj),
                "sessions": sessions_with_car.count(),
                "distance": (laps_with_car.count() * track.length_m) / 1000
            })
        return cars_list

    # --- CAR VIEW ---
    def get_car_view_stats(self):
        print("[Analytics] Generating car view stats...", flush=True)
        stats = []
        cars = Car.select().join(Session).distinct()

        for car in cars:
            sessions_with_car = Session.select().where(Session.car == car)
            laps_with_car = Lap.select().join(Stint).where(Stint.session << sessions_with_car)
            valid_laps = laps_with_car.where(Lap.is_valid == True)
            
            total_distance_obj = (Lap.select(pw.fn.SUM(Track.length_m)).join(Stint).join(Session).join(Track)
                                  .where(Session.car == car).scalar())
            
            race_sessions_count = sessions_with_car.where(Session.session_type == 'Race').count()
            race_stints = Stint.select().join(Session).where((Session.car == car) & (Session.session_type == 'Race'))
            wins = race_stints.where(Stint.final_place == 1).count()
            podiums = race_stints.where((Stint.final_place <= 3) & (Stint.final_place > 0)).count()

            top_track_obj = (Track.select(Track.display_name, pw.fn.COUNT(Lap.id).alias('lap_count'), pw.fn.SUM(Track.length_m).alias('total_dist'))
                             .join(Session).join(Stint).join(Lap)
                             .where(Session.car == car)
                             .group_by(Track.display_name).order_by(pw.fn.COUNT(Lap.id).desc()).first())

            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()
            valid_laps_count = valid_laps.count()
            total_laps_count = laps_with_car.count()
            
            track_performance = self._get_track_performance_for_car(car)
            recent_sessions = self._get_recent_sessions_for_query(sessions_with_car)

            stats.append({
                "id": car.id, "name": car.display_name, "manufacturer": car.manufacturer,
                "totalDistance": (total_distance_obj or 0) / 1000,
                "validLaps": valid_laps_count, "invalidLaps": total_laps_count - valid_laps_count,
                "sessions": sessions_with_car.count(), "wins": wins, "podiums": podiums,
                "topTrack": top_track_obj.display_name if top_track_obj else "N/A",
                "topTrackLaps": top_track_obj.lap_count if top_track_obj else 0,
                "topTrackDistance": (top_track_obj.total_dist or 0) / 1000 if top_track_obj else 0,
                "avgLapTime": self._format_time(avg_lap),
                "bestOverallLap": self._format_time(best_lap.lap_time if best_lap else None),
                "reliability": (valid_laps_count / total_laps_count * 100) if total_laps_count > 0 else 100,
                "winRate": (wins / race_sessions_count * 100) if race_sessions_count > 0 else 0,
                "podiumRate": (podiums / race_sessions_count * 100) if race_sessions_count > 0 else 0,
                "trackPerformance": track_performance,
                "recentSessions": recent_sessions,
            })
        return stats
        
    def _get_track_performance_for_car(self, car):
        track_perf = []
        tracks_driven = Track.select().join(Session).where(Session.car == car).distinct()
        
        for track in tracks_driven:
            sessions_on_track = Session.select().where((Session.car == car) & (Session.track == track))
            laps_on_track = Lap.select().join(Stint).where(Stint.session << sessions_on_track)
            valid_laps = laps_on_track.where(Lap.is_valid == True)
            
            first_lap = valid_laps.order_by(Lap.created_at.asc()).first()
            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()

            improvement = "N/A"
            if first_lap and best_lap and valid_laps.count() > 1:
                improvement = f"{first_lap.lap_time - best_lap.lap_time:.3f}s"

            race_stints = Stint.select().join(Session).where((Session.car == car) & (Session.track == track) & (Session.session_type == 'Race'))
            
            track_perf.append({
                "track": track.display_name, "country": "N/A",
                "sessions": sessions_on_track.count(), "validLaps": valid_laps.count(),
                "invalidLaps": laps_on_track.where(Lap.is_valid == False).count(),
                "distance": (laps_on_track.count() * track.length_m) / 1000,
                "bestLap": self._format_time(best_lap.lap_time if best_lap else None),
                "avgLap": self._format_time(avg_lap),
                "wins": race_stints.where(Stint.final_place == 1).count(),
                "podiums": race_stints.where((Stint.final_place <= 3) & (Stint.final_place > 0)).count(),
                "worldRecord": self._format_time(best_lap.lap_time if best_lap else None), # User PB
                "improvement": improvement
            })
        return track_perf

    # --- SETUP VIEW ---
    def get_setup_view_stats(self):
        print("[Analytics] Generating setup view stats...", flush=True)
        stats = []
        setups = Setup.select().join(Stint).distinct() # Only show setups that have been used

        for setup in setups:
            stints_with_setup = Stint.select().where(Stint.setup == setup)
            laps_with_setup = Lap.select().where(Lap.stint << stints_with_setup)
            valid_laps = laps_with_setup.where(Lap.is_valid == True)
            
            if not valid_laps.exists(): continue

            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()
            
            best_s1 = valid_laps.select(pw.fn.MIN(Lap.sector1_time)).where(Lap.sector1_time > 0).scalar() or 0
            best_s2 = valid_laps.select(pw.fn.MIN(Lap.sector2_time)).where(Lap.sector2_time > 0).scalar() or 0
            best_s3 = valid_laps.select(pw.fn.MIN(Lap.sector3_time)).where(Lap.sector3_time > 0).scalar() or 0
            optimal_time = best_s1 + best_s2 + best_s3 if best_s1 > 0 and best_s2 > 0 and best_s3 > 0 else 0
            
            total_laps_count = laps_with_setup.count()
            valid_laps_count = valid_laps.count()

            first_telemetry = LapTelemetry.select().join(Lap).where(Lap.stint << stints_with_setup).order_by(LapTelemetry.id.asc()).first()
            last_telemetry = LapTelemetry.select().join(Lap).where(Lap.stint << stints_with_setup).order_by(LapTelemetry.id.desc()).first()
            fuel_used = (first_telemetry.fuel_level - last_telemetry.fuel_level) if first_telemetry and last_telemetry else 0
            distance_km = (total_laps_count * setup.track.length_m) / 1000
            
            lap_times = [l.lap_time for l in valid_laps]
            consistency = (1 - (statistics.stdev(lap_times) / statistics.mean(lap_times))) * 100 if len(lap_times) > 1 else 100

            stats.append({
                "id": setup.id, "name": setup.name, "car": setup.car.display_name, "track": setup.track.display_name,
                "bestLapTime": self._format_time(best_lap.lap_time if best_lap else None),
                "avgLapTime": self._format_time(avg_lap), "optimalTime": self._format_time(optimal_time),
                "totalDistance": distance_km, "laps": total_laps_count, "validLaps": valid_laps_count,
                "invalidLaps": total_laps_count - valid_laps_count,
                "consistency": consistency,
                "reliability": (valid_laps_count / total_laps_count * 100) if total_laps_count > 0 else 100,
                "fuelEfficiency": (fuel_used / distance_km) * 100 if distance_km > 0 else 0,
                "sessions": Stint.select(Stint.session).where(Stint.setup == setup).distinct().count(),
                "dateCreated": setup.created_at.isoformat(),
                "lastUsed": max(s.created_at for s in stints_with_setup).isoformat(),
                "setupDetails": json.loads(setup.setup_details),
                "conditions": json.loads(setup.weather_details),
            })
        return stats

    def _get_recent_sessions_for_query(self, session_query):
        recent_sessions = []
        query = (session_query
                 .join(Car, on=(Session.car == Car.id))
                 .join(Track, on=(Session.track == Track.id))
                 .order_by(Session.created_at.desc())
                 .limit(3))
        
        for session in query:
            best_lap = Lap.select(pw.fn.MIN(Lap.lap_time)).join(Stint).where((Stint.session == session) & (Lap.is_valid == True)).scalar()
            final_stint = session.stints.order_by(Stint.stint_number.desc()).first()
            result = f"P{final_stint.final_place}" if session.session_type == 'Race' and final_stint and final_stint.final_place else "-"
            
            recent_sessions.append({
                "date": session.created_at.strftime('%Y-%m-%d'), "type": session.session_type,
                "laps": Lap.select().join(Stint).where(Stint.session == session).count(),
                "bestLap": self._format_time(best_lap),
                "car": session.car.display_name, "track": session.track.display_name,
                "result": result
            })
        return recent_sessions