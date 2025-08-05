# rw_backend/api/simulator_api.py

import json
from rw_backend.database.models import Simulator

class SimulatorApi:
    def getSimulatorList(self):
        """
        Fetches a list of all simulators present in the database.
        """
        print("API CALL: getSimulatorList", flush=True)
        try:
            query = Simulator.select(Simulator.id, Simulator.name)
            # Convert the model instances to a list of simple dictionaries
            sim_list = [{"id": sim.id, "name": sim.name} for sim in query]
            return json.dumps(sim_list)
        except Exception as e:
            print(f"Error fetching simulator list: {e}", flush=True)
            return json.dumps([])