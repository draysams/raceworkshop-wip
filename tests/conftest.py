# tests/conftest.py

import pytest
from queue import Queue
from types import SimpleNamespace
import time

from rw_backend.generators.event_generator import EventGenerator

@pytest.fixture
def event_system():
    """Sets up the EventGenerator and its queues for integration tests."""
    raw_data_queue = Queue()
    event_queue = Queue()
    generator = EventGenerator(raw_data_queue, event_queue)
    
    yield generator, raw_data_queue, event_queue
    
    if generator.is_alive():
        generator.stop()
        generator.join(timeout=1)

@pytest.fixture
def create_mock_bundle():
    """A fixture that returns a factory function for creating mock raw_data bundles."""
    def _create_mock_bundle(**kwargs):
        player_scoring_data = {
            'mIsPlayer': True, 'mTotalLaps': 0, 'mSector': 1, 'mInPits': False,
            'mInGarageStall': False, 'mNumPitstops': 0, 'mCountLapFlag': 0,
            'mLastLapTime': -1.0, 'mLastSector1': -1.0, 'mLastSector2': -1.0,
            'mCurSector1': -1.0, 'mCurSector2': -1.0,  # <-- FIX: Add missing attributes
            'mLapStartET': 100.0, 'mDriverName': b'Test Driver',
            'mVehicleClass': b'Hypercar', 'mVehicleName': b'Test Car'
        }
        telemetry_data = {'mElapsedTime': 105.0, 'mVehicleName': b'Test Car'}
        scoring_info_data = {'mTrackName': b'Test Track', 'mGamePhase': 5, 'mTrackTemp': 30.0, 'mAmbientTemp': 25.0}
        extended_data = {'mSessionStarted': True, 'mTicksSessionStarted': 12345}

        player_scoring_data.update(kwargs)

        mock_player_scoring = SimpleNamespace(**player_scoring_data)
        mock_player_scoring._fields_ = [(key,) for key in player_scoring_data.keys()]

        mock_extended = SimpleNamespace(**extended_data)
        mock_extended._fields_ = [(key,) for key in extended_data.keys()]
        
        mock_scoring = SimpleNamespace(
            mVehicles=[mock_player_scoring],
            mScoringInfo=SimpleNamespace(**scoring_info_data)
        )
        mock_telemetry = SimpleNamespace(**telemetry_data)
        
        return {'scoring': mock_scoring, 'telemetry': mock_telemetry, 'extended': mock_extended}
    
    return _create_mock_bundle