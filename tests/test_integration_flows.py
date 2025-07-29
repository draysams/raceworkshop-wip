# tests/test_integration_flows.py

import pytest
from queue import Queue
import time

from rw_backend.core.events import (
    StintStarted, StintEnded, LapCompleted, LapAborted
)

def test_flow_first_out_lap_sequence(event_system, create_mock_bundle):
    """Integration Test for Scenario 1: First Out-Lap (GARAGE -> PITS -> ON_TRACK)"""
    generator, raw_data_queue, event_queue = event_system
    generator.start()

    raw_data_queue.put(create_mock_bundle(mInGarageStall=True))
    raw_data_queue.put(create_mock_bundle(mInGarageStall=False, mInPits=True))
    raw_data_queue.put(create_mock_bundle(mInGarageStall=False, mInPits=False))

    time.sleep(0.1); generator.stop()

    # We only care about the final output: was a stint started?
    stint_starts = [e for e in event_queue.queue if isinstance(e, StintStarted)]
    assert len(stint_starts) == 1, "A single StintStarted event should be fired"

def test_flow_standard_pit_stop_sequence(event_system, create_mock_bundle):
    """Integration Test for Scenario 2: Standard Pit Stop"""
    generator, raw_data_queue, event_queue = event_system
    generator.start()

    # 1. Establish initial state on track
    raw_data_queue.put(create_mock_bundle(mTotalLaps=8, mNumPitstops=0))
    time.sleep(0.05)
    while not event_queue.empty(): event_queue.get() # Clear initial StintStarted event

    # 2. The pit stop sequence over multiple frames
    raw_data_queue.put(create_mock_bundle(mTotalLaps=8, mInPits=True, mNumPitstops=0))
    raw_data_queue.put(create_mock_bundle(mTotalLaps=9, mInPits=True, mNumPitstops=1)) # Pit stop completes
    raw_data_queue.put(create_mock_bundle(mTotalLaps=9, mInPits=False, mNumPitstops=1))

    time.sleep(0.1); generator.stop()

    # Assert the final sequence of events is correct
    events_of_interest = [e for e in event_queue.queue if isinstance(e, (StintEnded, StintStarted))]
    event_types = [type(e) for e in events_of_interest]
    assert event_types == [StintEnded, StintStarted], "The order must be StintEnded, then StintStarted"

def test_flow_drive_through_sequence(event_system, create_mock_bundle):
    """Integration Test for Scenario 3: Drive-Through"""
    generator, raw_data_queue, event_queue = event_system
    generator.start()

    # 1. Establish initial state on track
    raw_data_queue.put(create_mock_bundle())
    time.sleep(0.05)
    while not event_queue.empty(): event_queue.get()
    
    # 2. The drive-through sequence
    raw_data_queue.put(create_mock_bundle(mInPits=True))
    raw_data_queue.put(create_mock_bundle(mInPits=False))

    time.sleep(0.1); generator.stop()

    stint_events = [e for e in event_queue.queue if isinstance(e, (StintStarted, StintEnded))]
    assert len(stint_events) == 0, "A drive-through sequence should not generate any stint events"

def test_flow_in_lap_to_garage_and_lap_first_rule(event_system, create_mock_bundle):
    """Integration Test for Scenario 4 (Lap First Rule)"""
    generator, raw_data_queue, event_queue = event_system
    generator.start()

    # 1. Establish initial state on track
    raw_data_queue.put(create_mock_bundle(mTotalLaps=5, mCountLapFlag=2))
    time.sleep(0.05)
    while not event_queue.empty(): event_queue.get()
    
    # 2. On a single frame, lap completes AND player returns to garage
    raw_data_queue.put(create_mock_bundle(
        mTotalLaps=6, mLastLapTime=90.0, mInGarageStall=True
    ))
    
    time.sleep(0.1); generator.stop()
    
    events = list(event_queue.queue)
    lap_events = [e for e in events if isinstance(e, LapCompleted)]
    assert len(lap_events) == 1 and lap_events[0].is_valid is False, "A single, invalid LapCompleted event should be fired"

    event_types = [type(e) for e in events if isinstance(e, (LapCompleted, StintEnded))]
    assert event_types == [LapCompleted, StintEnded], "Event order must be LapCompleted, then StintEnded"