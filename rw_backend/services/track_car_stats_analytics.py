# rw_backend/services/track_car_stats_analytics.py

import peewee as pw
from rw_backend.database.models import Session, Lap, Stint, Car, Track

class TrackCarStatsAnalytics:
    """
    Service layer for calculating the specific, aggregated stats needed for the
    new TrackCarStats page.
    """

    def _format_time(self, seconds: float | None) -> str:
        if seconds is None or seconds <= 0: return "--:--.---"
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes:02}:{remaining_seconds:06.3f}"

    def _format_hours(self, seconds: float | None) -> str:
        if seconds is None or seconds <= 0: return "0.0 HOURS"
        hours = seconds / 3600
        return f"{hours:.1f} HOURS"

    def get_track_stats(self):
        """
        Generates the top-level list of statistics for every track driven on.
        """
        print("[Analytics] Generating track stats list...", flush=True)
        stats = []
        
        # 1. Find all tracks that have at least one session
        tracks_with_sessions = Track.select().join(Session).distinct()

        for track in tracks_with_sessions:
            sessions_on_track = Session.select().where(Session.track == track)
            laps_on_track = Lap.select().join(Stint).where(Stint.session << sessions_on_track)
            valid_laps = laps_on_track.where(Lap.is_valid == True)
            
            race_sessions = sessions_on_track.where(Session.session_type == 'Race')
            race_stints = Stint.select().where(Stint.session << race_sessions)
            
            # Aggregate stats
            total_laps_count = laps_on_track.count()
            total_distance_km = (total_laps_count * track.length_m) / 1000
            total_time_seconds = valid_laps.select(pw.fn.SUM(Lap.lap_time)).scalar() or 0
            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()

            stats.append({
                "id": track.id,
                "name": track.display_name,
                "distance": f"{total_distance_km:,.1f} km",
                "timeSpent": self._format_hours(total_time_seconds),
                "validLaps": valid_laps.count(),
                "invalidLaps": total_laps_count - valid_laps.count(),
                "races": race_sessions.count(),
                "finished": race_stints.where(Stint.final_place > 0).count(), # Assumes a final_place > 0 is "finished"
                "wins": race_stints.where(Stint.final_place == 1).count(),
                "podiums": race_stints.where((Stint.final_place <= 3) & (Stint.final_place > 0)).count(),
                "bestLap": self._format_time(best_lap.lap_time if best_lap else None),
                "avgLap": self._format_time(avg_lap),
                "trackIcon": track.thumbnail_path,
            })
        return stats

    def get_car_stats_for_track(self, track_id):
        """
        Generates the detailed list of statistics for every car driven on a specific track.
        """
        print(f"[Analytics] Generating car stats for track ID: {track_id}...", flush=True)
        stats = []
        track = Track.get_by_id(track_id)
        
        # 1. Find all cars driven on this specific track
        cars_on_track = Car.select().join(Session).where(Session.track == track).distinct()

        for car in cars_on_track:
            sessions_with_car = Session.select().where((Session.track == track) & (Session.car == car))
            laps_with_car = Lap.select().join(Stint).where(Stint.session << sessions_with_car)
            valid_laps = laps_with_car.where(Lap.is_valid == True)

            race_sessions = sessions_with_car.where(Session.session_type == 'Race')
            race_stints = Stint.select().where(Stint.session << race_sessions)

            # Aggregate stats
            total_laps_count = laps_with_car.count()
            total_distance_km = (total_laps_count * track.length_m) / 1000
            total_time_seconds = valid_laps.select(pw.fn.SUM(Lap.lap_time)).scalar() or 0
            best_lap = valid_laps.order_by(Lap.lap_time.asc()).first()
            avg_lap = valid_laps.select(pw.fn.AVG(Lap.lap_time)).scalar()
            
            stats.append({
                "id": car.id,
                "name": car.display_name,
                "class": car.car_class,
                "manufacturer": car.manufacturer,
                "logo": car.manufacturer_thumbnail_url,
                "distance": f"{total_distance_km:,.1f} km",
                "timeSpent": self._format_hours(total_time_seconds),
                "validLaps": valid_laps.count(),
                "invalidLaps": total_laps_count - valid_laps.count(),
                "races": race_sessions.count(),
                "finished": race_stints.where(Stint.final_place > 0).count(),
                "wins": race_stints.where(Stint.final_place == 1).count(),
                "podiums": race_stints.where((Stint.final_place <= 3) & (Stint.final_place > 0)).count(),
                "bestLap": self._format_time(best_lap.lap_time if best_lap else None),
                "avgLap": self._format_time(avg_lap),
            })
        return stats