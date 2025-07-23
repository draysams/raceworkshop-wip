# rw_backend/core/live_data_server.py

import asyncio
import websockets
import threading
import json
from queue import Queue, Empty

class LiveDataServer:
    """
    Manages a WebSocket server to stream live data to the frontend.
    Runs in its own thread.
    """
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.clients = set()
        self.data_queue = Queue()
        self.server_thread = threading.Thread(target=self._run_server_in_thread, daemon=True)

    async def _register(self, websocket):
        """Adds a new client and waits for them to disconnect."""
        self.clients.add(websocket)
        print(f"[Live Data Server] Client connected. Total clients: {len(self.clients)}")
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)
            print(f"[Live Data Server] Client disconnected. Total clients: {len(self.clients)}")

    async def _broadcast_data(self):
        """Continuously checks the queue and sends data to all clients."""
        while True:
            try:
                # Use a non-blocking get to avoid halting the async loop
                message = self.data_queue.get_nowait()
                if self.clients:
                    # websockets.broadcast is a convenient way to send to all clients
                    websockets.broadcast(self.clients, message)
            except Empty:
                # If the queue is empty, wait briefly to yield control
                await asyncio.sleep(1 / 100) # Sleep for 10ms

    async def _main(self):
        """The main async function that starts the server and broadcaster."""
        print(f"[Live Data Server] Starting WebSocket server on ws://{self.host}:{self.port}")
        async with websockets.serve(self._register, self.host, self.port):
            await self._broadcast_data()

    def _run_server_in_thread(self):
        """Entry point for the thread, runs the asyncio event loop."""
        try:
            asyncio.run(self._main())
        except Exception as e:
            print(f"[Live Data Server] Thread error: {e}")

    def start(self):
        """Starts the server thread."""
        self.server_thread.start()

    def push_data(self, data: dict):
        """Public, thread-safe method to add data to the broadcast queue."""
        # We serialize to JSON here to offload that work from the server's async loop.
        self.data_queue.put(json.dumps(data))