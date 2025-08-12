# rw_backend/services/dashboard_analytics.py

from datetime import datetime, timedelta
import peewee as pw
from rw_backend.database.models import Session, Lap, Stint, Car, Track, Driver
import statistics

class DashboardAnalytics:
    """A service class dedicated to calculating advanced statistics for the dashboard."""

    def _get_total_stats(self, simulator_id=None):
        try:
            # ... (logic is unchanged) ...
            base_session_query = Session.select()
            base_lap_query = Lap.select().join(Stint).join(Session)
            if simulator_id:
                base_session_query = base_session_query.where(Session.simulator == simulator_id)
                base_lap_query = base_lap_query.where(Session.simulator == simulator_id)
            total_sessions = base_session_query.count()
            total_laps = base_lap_query.count()
            total_duration_seconds_obj = base_lap_query.select(pw.fn.SUM(Lap.lap_time)).scalar()
            total_duration_seconds = total_duration_seconds_obj or 0
            td = timedelta(seconds=int(total_duration_seconds))
            hours, remainder = divmod(td.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            track_time = f"{td.days * 24 + hours:02}:{minutes:02}:{seconds:02}"
            total_distance_m_obj = (Lap
                                   .select(pw.fn.SUM(Track.length_m))
                                   .join(Stint)
                                   .join(Session)
                                   .join(Track, on=(Session.track == Track.id))
                                   .where(Lap.id << [l.id for l in base_lap_query])
                                   .scalar())
            total_distance_km = (total_distance_m_obj or 0) / 1000
            return {
                "total_sessions": total_sessions, "total_laps": total_laps,
                "track_time": track_time, "total_distance_driven_km": round(total_distance_km, 2),
            }
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_total_stats: {e}", flush=True)
            return {}

    def _get_most_driven(self, simulator_id=None):
        try:
            # ... (logic is unchanged) ...
            base_query = Session.select()
            if simulator_id:
                base_query = base_query.where(Session.simulator == simulator_id)
            most_driven_car_query = (Car
                                     .select(Car.display_name, pw.fn.COUNT(Session.id).alias('session_count'))
                                     .join(Session, on=(Car.id == Session.car))
                                     .where(Session.id << [s.id for s in base_query])
                                     .group_by(Car.display_name)
                                     .order_by(pw.fn.COUNT(Session.id).desc())
                                     .first())
            most_driven_track_query = (Track
                                       .select(Track.display_name, pw.fn.COUNT(Session.id).alias('session_count'))
                                       .join(Session, on=(Track.id == Session.track))
                                       .where(Session.id << [s.id for s in base_query])
                                       .group_by(Track.display_name)
                                       .order_by(pw.fn.COUNT(Session.id).desc())
                                       .first())
            return {
                "most_driven_car": most_driven_car_query.display_name if most_driven_car_query else "N/A",
                "most_driven_track": most_driven_track_query.display_name if most_driven_track_query else "N/A",
            }
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_most_driven: {e}", flush=True)
            return {}

    def _get_combo_stats(self, simulator_id=None):
        try:
            # --- THIS IS THE FIX ---
            base_query = (Session
                          .select(Car.display_name.alias('car_name'), Track.display_name.alias('track_name'))
                          .join(Car, on=(Session.car == Car.id))
                          .join(Track, on=(Session.track == Track.id)))
            
            if simulator_id:
                base_query = base_query.where(Session.simulator == simulator_id)
            
            # By using .dicts(), we guarantee the result is a dictionary, making access safe.
            combo_query_result = (base_query
                                  .group_by(Car.display_name, Track.display_name)
                                  .order_by(pw.fn.COUNT(Session.id).desc())
                                  .dicts() # <-- Force result to be a dictionary
                                  .first())

            if combo_query_result:
                # Access the aliased fields using dictionary keys for safety.
                car_name = combo_query_result['car_name']
                track_name = combo_query_result['track_name']
                favorite_combo = f"{car_name} at {track_name}"
            else:
                favorite_combo = "N/A"

            return {"favorite_combo": favorite_combo}
            # --- END FIX ---
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_combo_stats: {e}", flush=True)
            return {}

    def _get_progression_stats(self, simulator_id=None):
        try:
            # ... (logic is unchanged) ...
            seven_days_ago = datetime.now() - timedelta(days=7)
            all_time_pbs_base = (Lap.select(Session.car, Session.track, pw.fn.MIN(Lap.lap_time).alias('best_lap')).join(Stint).join(Session).where(Lap.is_valid == True))
            if simulator_id:
                 all_time_pbs_base = all_time_pbs_base.where(Session.simulator == simulator_id)
            all_time_pbs = all_time_pbs_base.group_by(Session.car, Session.track)
            new_pbs_query_base = (Lap.select().join(Stint).join(Session).join(all_time_pbs, on=((Session.car == all_time_pbs.c.car_id) & (Session.track == all_time_pbs.c.track_id))).where((Lap.lap_time == all_time_pbs.c.best_lap) & (Lap.timestamp >= seven_days_ago) & (Lap.is_valid == True)))
            if simulator_id:
                new_pbs_query_base = new_pbs_query_base.where(Session.simulator == simulator_id)
            new_pbs_last_7_days = new_pbs_query_base.count()
            return {"new_pbs_last_7_days": new_pbs_last_7_days, "on_fire_track": "N/A"}
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_progression_stats: {e}", flush=True)
            return {}

    def _get_consistency_score(self, simulator_id=None):
        try:
            # ... (logic is unchanged) ...
            last_session_query = Session.select()
            if simulator_id:
                last_session_query = last_session_query.where(Session.simulator == simulator_id)
            last_session = last_session_query.where(Session.ended_at.is_null(False)).order_by(Session.started_at.desc()).first()
            if not last_session: return "N/A"
            laps = (Lap.select(Lap.lap_time).join(Stint).where((Stint.session == last_session) & (Lap.is_valid == True)))
            lap_times = [lap.lap_time for lap in laps]
            if len(lap_times) < 2: return "100.0%"
            mean_lap_time = statistics.mean(lap_times)
            std_dev = statistics.stdev(lap_times)
            consistency = (1 - (std_dev / mean_lap_time)) * 100
            return f"{max(0, consistency):.1f}%"
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_consistency_score: {e}", flush=True)
            return "N/A"

    def _get_misc_stats(self, simulator_id=None):
        try:
            # ... (logic is unchanged) ...
            total_stats = self._get_total_stats(simulator_id)
            total_laps, total_sessions = total_stats.get('total_laps', 0), total_stats.get('total_sessions', 0)
            avg_laps_per_session = round(total_laps / total_sessions, 1) if total_sessions > 0 else 0
            base_query = Session.select(pw.fn.strftime('%w', Session.started_at).alias('day_of_week'), pw.fn.COUNT(Session.id).alias('session_count'))
            if simulator_id:
                base_query = base_query.where(Session.simulator == simulator_id)
            query = (base_query.group_by(pw.fn.strftime('%w', Session.started_at)).order_by(pw.fn.COUNT(Session.id).desc()).first())
            days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            most_active_day = days[int(query.day_of_week)] if query else "N/A"
            return {"average_laps_per_session": avg_laps_per_session, "most_active_day": most_active_day}
        except Exception as e:
            print(f"ANALYTICS ERROR in _get_misc_stats: {e}", flush=True)
            return {}

    def generate_stats(self, simulator_id=None):
        """Generates the full, combined dictionary of all dashboard analytics."""
        print("ANALYTICS: Generating full stats...", flush=True)
        all_stats = {}
        all_stats.update(self._get_total_stats(simulator_id))
        all_stats.update(self._get_most_driven(simulator_id))
        all_stats.update(self._get_combo_stats(simulator_id))
        all_stats.update(self._get_progression_stats(simulator_id))
        all_stats.update(self._get_misc_stats(simulator_id))
        all_stats["consistency_score"] = self._get_consistency_score(simulator_id)
        print("ANALYTICS: Stats generation complete.", flush=True)
        return all_stats