Excellent. With the code in place, we move to the most important part: the end-to-end verification test. This will confirm that every piece of the live data pipeline we just built is working in concert.

Here is your detailed guide for testing and verifying **Chunk 3**. Follow these steps in order.

---

### **Testing & Verification Plan for Chunk 3**

**Goal:** To prove that live data from the simulator is being collected by the Python backend, transmitted over WebSockets, received by the React frontend, and displayed correctly and in real-time on the "Live Transponder" screen.

#### **Phase 1: Setup**

1.  **Start the Simulator:** Launch Le Mans Ultimate. For now, just leave it on the main menu.
2.  **Start the Application:**
    *   Open your terminal to the project root (`raceworkshop-python/`).
    *   Ensure your Python virtual environment is activated.
    *   Run the development command:
        ```bash
        npm run dev
        ```
3.  **Arrange Your Windows:** For the best testing experience, arrange your screen so you can see three things at once:
    *   The RaceWorkshop application window.
    *   The terminal running the `npm run dev` command.
    *   The developer tools console for the RaceWorkshop UI (Right-click in the app -> "Inspect").

#### **Phase 2: Initial Connection Test**

This tests if the collector and WebSocket server start correctly and if the UI connects to them.

1.  **Check Terminal Logs:** Look at the terminal running `npm run dev`. You should see the following log lines appear, confirming the backend services have started:
    *   `[LMU Collector] Thread started.`
    *   `[Live Data Server] Starting WebSocket server on ws://localhost:8765`
    *   `[Status Handler] Status: disconnected, Message: Game not running...` (This might appear briefly before it connects).
    *   `[Status Handler] Status: connected, Message: In Menus / Spectating`

2.  **Navigate to the Transponder:** In the RaceWorkshop application, click on the "Le Mans Ultimate" icon in the sidebar, and then click on the "Transponder" tab.

3.  **Check Browser Console Logs:** Look at the developer tools console. You should see:
    *   `[Transponder] Mounting and starting telemetry...`
    *   `[Telemetry] Starting for lmu... Connecting to ws://localhost:8765`
    *   `[Telemetry] WebSocket connection established.`

4.  **Check Terminal Logs Again:** The `Live Data Server` should now report a client connection:
    *   `[Live Data Server] Client connected. Total clients: 1`

**✅ Verification Point 1:** If you see all these logs, it confirms that the backend services started correctly and the frontend successfully established a WebSocket connection. The pipeline is open.

#### **Phase 3: Live Telemetry Test (On Track)**

This is the core test. We will go on track and verify that the data flows correctly.

1.  **Go On Track in LMU:**
    *   In Le Mans Ultimate, start any single-player session (a Practice session is perfect).
    *   Choose any car and track.
    *   Click "Drive" to load onto the track.

2.  **Observe the UI:** As soon as you are in the car on the track, the "Live Transponder" view should come to life. Verify the following:
    *   **Connection Status:** The status indicator at the top right should turn green and say "Live".
    *   **Session Info (Sidebar):** The "Track" and "Car" fields should update to show the correct information for your current session.
    *   **Live Data (Sidebar):** The "Fuel", "Tyre Pressures", "Current Lap" should all show initial, non-zero values.
    *   **Driving Data:** As you start driving, verify that **Speed** and **RPM** are updating smoothly and in real-time. Change gears and confirm the **Gear** indicator updates.

3.  **Observe the Terminal:** The status handler log should now be reporting:
    *   `[Status Handler] Status: connected, Message: Live on track`

**✅ Verification Point 2:** If the UI is showing live, dynamic data that matches what you are doing in the game, it confirms that the `LMUCollector` is successfully reading shared memory and the data is being correctly transmitted and displayed.

#### **Phase 4: Lap Completion Test**

This tests the `lastLap` logic that will be crucial for our persistent lap recording in the next chunk.

1.  **Complete a Full Lap:** Drive a complete, valid lap in the simulator.
2.  **Cross the Start/Finish Line.**
3.  **Observe the UI:** The moment you cross the line to complete the lap, you should see a new row appear in the **Live Timing table**.
    *   The row should show "Lap 1".
    *   It should have a valid "Lap Time" and times for Sector 1, 2, and 3.
    *   The "Valid" indicator should be green.

4.  **Complete an Invalid Lap:** Drive another lap, but this time, go off track to invalidate it.
5.  **Cross the Start/Finish Line again.**
6.  **Observe the UI:** A new "Lap 2" row should appear, but this time the "Valid" indicator should be red.

**✅ Verification Point 3:** If new lap rows are appearing in the timing table as you complete them, it confirms that the `lastLap` data is being correctly identified, packaged, sent, and rendered by the UI.

#### **Phase 5: Teardown Test**

This ensures the application cleans up after itself correctly.

1.  **Close the RaceWorkshop Application Window.**
2.  **Observe the Python Terminal:** You should immediately see the shutdown logs:
    *   `[Main] Window is closing. Stopping collector...`
    *   `[LMU Collector] Stop signal received.`
    *   `[LMU Collector] Thread stopped.`
3.  **Observe the Browser Console:** It might show a WebSocket disconnection error, which is expected and normal.
4.  **Observe Terminal 1 (Vite Server):** It should still be running, which is correct. You can stop it with `Ctrl+C`.

**✅ Verification Point 4:** If the collector thread stops cleanly upon window close, it confirms our resource management is working correctly.

---

If you can successfully pass all these verification points, then **Chunk 3 is officially complete and successful**. We have a working, real-time telemetry application.

Please proceed with the test plan. Let me know the results or if you encounter any unexpected behavior at any step.