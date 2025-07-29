# tests/test_stint_logic.py

import pytest
from queue import Queue
from types import SimpleNamespace
from collections import deque

from rw_backend.generators.detectors.stint_detector import StintDetector
from rw_backend.core.events import StintStarted, StintEnded

def create_mock_scoring(lap_number=0):
    return SimpleNamespace(mTotalLaps=lap_number)

def test_stint_starts_when_coming_from_garage_area():
    """Scenarios 1 & 5: StintStarted should fire if the sequence includes IN_GARAGE."""
    event_queue = Queue()
    detector = StintDetector(event_queue)
    state_history_from_garage = deque(['IN_GARAGE', 'IN_PITS', 'ON_TRACK'])
    
    detector.handle_state_transition(state_history_from_garage, create_mock_scoring())
    
    events = list(event_queue.queue)
    assert len(events) == 1 and isinstance(events[0], StintStarted)

def test_return_to_garage_fires_stint_ended():
    """Scenario 4: The transition ON_TRACK -> IN_GARAGE must fire a StintEnded event."""
    event_queue = Queue()
    detector = StintDetector(event_queue)
    state_history = deque(['ON_TRACK', 'IN_GARAGE'])

    detector.handle_state_transition(state_history, create_mock_scoring(lap_number=5))

    events = list(event_queue.queue)
    assert len(events) == 1 and isinstance(events[0], StintEnded)

def test_drive_through_sequence_fires_no_events():
    """Scenario 3: A drive-through sequence (ON_TRACK -> IN_PITS -> ON_TRACK) must fire no events."""
    event_queue = Queue()
    detector = StintDetector(event_queue)
    state_history_drive_through = deque(['ON_TRACK', 'IN_PITS', 'ON_TRACK'])
    
    detector.handle_state_transition(state_history_drive_through, create_mock_scoring())
    
    assert event_queue.empty()