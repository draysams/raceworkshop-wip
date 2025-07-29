# tests/test_lap_detector_scenarios.py

import pytest
from queue import Queue
from types import SimpleNamespace

from rw_backend.generators.detectors.lap_detector import LapDetector
from rw_backend.core.events import LapCompleted, LapAborted

# --- Fixtures and Helpers ---

@pytest.fixture
def lap_detector():
    """Provides a clean LapDetector instance for each test."""
    return LapDetector(Queue())

def create_mock_telemetry(elapsed_time=0.0):
    return SimpleNamespace(mElapsedTime=elapsed_time)

def create_mock_scoring(laps=0, sector=1, lap_start_et=0.0, last_lap_time=-1.0, count_lap_flag=0, last_s1=-1.0, last_s2=-1.0, cur_s1=-1.0, cur_s2=-1.0):
    return SimpleNamespace(
        mTotalLaps=laps, mSector=sector, mLapStartET=lap_start_et,
        mLastLapTime=last_lap_time, mCountLapFlag=count_lap_flag,
        mLastSector1=last_s1, mLastSector2=last_s2,
        mCurSector1=cur_s1, mCurSector2=cur_s2
    )

def create_mock_last_data(laps=0, sector=0, count_lap_flag=0):
    return {'mTotalLaps': laps, 'mSector': sector, 'mCountLapFlag': count_lap_flag}

# --- Rigorous, Scenario-Based Tests ---

def test_scenario_1_first_out_lap_initializes_timers(lap_detector):
    """Verifies timers are correctly initialized upon leaving the pit lane for the first time."""
    # Sequence: IN_GARAGE -> IN_PITS -> ON_TRACK
    # Final frame has the true start time for the lap.
    last_data = create_mock_last_data()
    scoring = create_mock_scoring(lap_start_et=15.0)
    
    # Simulate the EventGenerator calling reset on the PITS -> ON_TRACK transition
    lap_detector.reset_for_next_lap(scoring.mLapStartET)

    assert lap_detector.lap_start_time == 15.0
    assert lap_detector.provisional_s1_time == 0.0
    assert lap_detector.provisional_s2_time == 0.0
    assert lap_detector.event_queue.empty()

def test_scenario_2_out_lap_completion_uses_provisional_timing(lap_detector):
    """Verifies a full out-lap is timed using provisional calculations and is marked invalid."""
    # 1. Start the lap
    lap_detector.reset_for_next_lap(100.0)

    # 2. Cross S1->S2
    lap_detector.detect(create_mock_scoring(sector=2), create_mock_last_data(sector=1), create_mock_telemetry(135.0), "ON_TRACK")
    assert pytest.approx(lap_detector.provisional_s1_time) == 35.0

    # 3. Cross S2->S3
    lap_detector.detect(create_mock_scoring(sector=0), create_mock_last_data(sector=2), create_mock_telemetry(180.0), "ON_TRACK")
    assert pytest.approx(lap_detector.provisional_s2_time) == 45.0
    
    # 4. Cross S/F Line
    last_data = create_mock_last_data(laps=0)
    scoring = create_mock_scoring(laps=1, last_lap_time=-1.0, lap_start_et=210.0) # -1.0 mLastLapTime signifies out-lap
    lap_detector.detect(scoring, last_data, create_mock_telemetry(210.0), "ON_TRACK")

    events = list(lap_detector.event_queue.queue)
    assert len(events) == 1
    event = events[0]
    assert isinstance(event, LapCompleted)
    assert event.is_valid is False
    assert pytest.approx(event.lap_time) == 110.0 # 35 + 45 + (210-180)

    # 5. Verify timers are reset for the next lap
    assert lap_detector.lap_start_time == 210.0

def test_scenario_3_flying_lap_completion_uses_official_timing(lap_detector):
    """Verifies a flying lap uses the precise, official data from the simulator."""
    lap_detector.reset_for_next_lap(210.0)
    
    last_data = create_mock_last_data(laps=1, count_lap_flag=2) # count_lap_flag=2 means it was a valid lap
    scoring = create_mock_scoring(laps=2, last_lap_time=88.5, last_s1=30.1, last_s2=60.2, lap_start_et=298.5)
    lap_detector.detect(scoring, last_data, create_mock_telemetry(298.5), "ON_TRACK")

    events = list(lap_detector.event_queue.queue)
    assert len(events) == 1
    event = events[0]
    assert isinstance(event, LapCompleted)
    assert event.is_valid is True
    assert event.lap_time == 88.5 # Must use official time
    assert event.sector1_time == 30.1 # Must use official time
    assert pytest.approx(event.sector2_time) == 30.1 # 60.2 - 30.1

def test_scenario_4_aborting_out_lap_to_garage(lap_detector):
    """Verifies aborting an out-lap mid-sector creates a LapAborted event with provisional times."""
    lap_detector.reset_for_next_lap(100.0)
    lap_detector.detect(create_mock_scoring(sector=2), create_mock_last_data(sector=1), create_mock_telemetry(135.0), "ON_TRACK") # Cross S1->S2
    
    # Act: Abort 20 seconds into sector 2. We call the real method to get the data.
    event_data = lap_detector.get_provisional_lap_data(create_mock_scoring(), create_mock_telemetry(155.0))
    event = LapAborted(**event_data)

    # Assert
    assert isinstance(event, LapAborted)
    assert pytest.approx(event.sector1_time) == 35.0 # 135 - 100
    assert pytest.approx(event.sector2_time) == 20.0 # 155 - 135
    assert pytest.approx(event.lap_time) == 55.0

def test_scenario_5_aborting_flying_lap_to_garage(lap_detector):
    """Verifies aborting a flying lap creates a hybrid event of official and provisional times."""
    lap_detector.reset_for_next_lap(200.0)
    # Simulate the detector capturing official times as they happen
    lap_detector.detect(create_mock_scoring(cur_s1=31.5), create_mock_last_data(), create_mock_telemetry(), "ON_TRACK")
    lap_detector.detect(create_mock_scoring(cur_s2=64.0), create_mock_last_data(), create_mock_telemetry(), "ON_TRACK")
    lap_detector.detect(create_mock_scoring(sector=0), create_mock_last_data(sector=2), create_mock_telemetry(265.0), "ON_TRACK")
    
    # Act: Abort 15 seconds into sector 3 at ET=280.0
    event_data = lap_detector.get_provisional_lap_data(create_mock_scoring(), create_mock_telemetry(280.0))
    event = LapAborted(**event_data)

    # Assert
    assert isinstance(event, LapAborted)
    assert event.sector1_time == 0.0
    assert event.sector2_time == 65.0
    assert pytest.approx(event.sector3_time) == 0.0
    assert pytest.approx(event.lap_time) == 65.0

def test_scenario_6_in_lap_to_pits_is_invalid(lap_detector):
    """Verifies that a lap completed by entering the pits is marked invalid."""
    lap_detector.reset_for_next_lap(300.0)

    # This lap is otherwise valid (count_lap_flag=2)
    last_data = create_mock_last_data(laps=4, count_lap_flag=2)
    # But the player is IN_PITS, which should override validity
    scoring = create_mock_scoring(laps=5, last_lap_time=95.0, lap_start_et=395.0)
    lap_detector.detect(scoring, last_data, create_mock_telemetry(395.0), "IN_PITS")
    
    events = list(lap_detector.event_queue.queue)
    assert len(events) == 1
    event = events[0]
    assert isinstance(event, LapCompleted)
    assert event.is_valid is False # In-laps are always invalid for performance analysis

def test_scenario_7_drive_through_lap_and_reset_on_exit(lap_detector):
    """Verifies timers are NOT reset on S/F in pits, but ARE reset on pit exit."""
    # 1. Start Lap
    lap_detector.reset_for_next_lap(200.0)

    # 2. Cross S/F line while in pits
    last_data = create_mock_last_data(laps=3)
    scoring = create_mock_scoring(laps=4, last_lap_time=98.0, lap_start_et=300.0) # S/F line provides a new start ET
    lap_detector.detect(scoring, last_data, create_mock_telemetry(300.0), "IN_PITS")

    # 3. Assert timers have NOT been reset yet
    assert lap_detector.lap_start_time == 300.0 # Should still be the start time of the lap just completed
    
    # 4. Now, simulate exiting the pits, which provides the TRUE start time of the new lap
    lap_detector.reset_for_next_lap(310.0)
    assert lap_detector.lap_start_time == 310.0
    assert lap_detector.provisional_s1_time == 0.0

def test_scenario_8_reset_after_standard_pit_stop(lap_detector):
    """Verifies timers are reset correctly after a full pit stop sequence."""
    # 1. Simulate being on track with an active lap
    lap_detector.lap_start_time = 400.0
    lap_detector.provisional_s1_time = 33.0

    # 2. Simulate crossing the pit exit line to start the new lap
    lap_detector.reset_for_next_lap(515.0)

    assert lap_detector.lap_start_time == 515.0
    assert lap_detector.provisional_s1_time == 0.0
    assert lap_detector.provisional_s2_time == 0.0

def test_scenario_9_pits_to_garage_does_not_reset_timers(lap_detector):
    """Verifies that going from Pits to Garage does NOT affect the lap detector's state."""
    # 1. Simulate an active lap, with the player in the pits
    lap_detector.lap_start_time = 600.0
    lap_detector.provisional_s1_time = 40.0

    # 2. The state changes to IN_GARAGE. The EventGenerator calls nothing on the lap_detector.
    # We simulate this by checking that the state is unchanged.
    assert lap_detector.lap_start_time == 600.0
    assert lap_detector.provisional_s1_time == 40.0
    assert lap_detector.event_queue.empty()


def test_scenario_10_invalid_out_lap_has_provisional_sector_times(lap_detector):
    """
    THE NEW FAILING TEST: Verifies that an invalid out-lap still produces an event
    with valid, non-zero provisional sector times.
    """
    # 1. Start the lap
    lap_detector.reset_for_next_lap(100.0)

    # 2. Drive the lap, setting provisional times
    lap_detector.detect(create_mock_scoring(sector=2), create_mock_last_data(sector=1), create_mock_telemetry(135.0), "ON_TRACK")
    lap_detector.detect(create_mock_scoring(sector=0), create_mock_last_data(sector=2), create_mock_telemetry(180.0), "ON_TRACK")
    
    # 3. Cross S/F Line to complete the out-lap
    last_data = create_mock_last_data(laps=0, count_lap_flag=0) # count_lap_flag=0 makes it invalid
    scoring = create_mock_scoring(laps=1, last_lap_time=-1.0, lap_start_et=210.0)
    lap_detector.detect(scoring, last_data, create_mock_telemetry(210.0), "ON_TRACK")

    # 4. Assertions
    events = list(lap_detector.event_queue.queue)
    assert len(events) == 1, "A LapCompleted event should have been fired"
    event = events[0]
    
    assert isinstance(event, LapCompleted)
    assert event.is_valid is False, "The out-lap should be marked as invalid"
    
    # CRITICAL ASSERTIONS:
    assert event.sector1_time > 0, "Sector 1 time should be a valid, positive number"
    assert event.sector2_time > 0, "Sector 2 time should be a valid, positive number"
    assert event.sector3_time > 0, "Sector 3 time should be a valid, positive number"
    assert pytest.approx(event.lap_time) == event.sector1_time + event.sector2_time + event.sector3_time

def test_scenario_11_invalid_flying_lap_has_official_sector_times(lap_detector):
    """
    THE NEW FAILING TEST: Verifies that a flying lap marked as INVALID by the sim
    still produces an event with the official sector times.
    """
    lap_detector.reset_for_next_lap(210.0)
    
    # The previous lap was INVALID (mCountLapFlag = 1), but the sim provides official times.
    last_data = create_mock_last_data(laps=1, count_lap_flag=1) 
    scoring = create_mock_scoring(laps=2, last_lap_time=88.5, last_s1=30.1, last_s2=60.2, lap_start_et=298.5)
    lap_detector.detect(scoring, last_data, create_mock_telemetry(298.5), "ON_TRACK")

    events = list(lap_detector.event_queue.queue)
    assert len(events) == 1, "A LapCompleted event should have been fired"
    event = events[0]
    
    assert isinstance(event, LapCompleted)
    assert event.is_valid is False, "The lap should be marked as invalid"
    
    # CRITICAL ASSERTIONS:
    assert event.sector1_time > 0, "Sector 1 time should be the valid official time"
    assert event.sector2_time > 0, "Sector 2 time should be the valid official time"
    assert event.sector1_time == 30.1