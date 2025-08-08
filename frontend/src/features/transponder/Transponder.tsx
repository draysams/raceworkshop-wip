import { useState, useEffect, useMemo, useRef } from "react"
import type { LapData, LiveSessionData } from "../../shared/types";
import { formatTimeFromMs } from "../../shared/utils/formatters";
import { api } from "../../services/api";
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation";
import { FeatureLayout } from "../../components/layout/FeatureLayout";

const initialData: LiveSessionData = {
    sessionId: null,
    isConnected: false,
    sessionType: 'N/A',
    track: '...',
    car: '...',
    sessionTimeRemaining: '00:00',
    currentLap: 0,
    position: 0,
    fuelLevel: 0,
    tyrePressures: { frontLeft: 0, frontRight: 0, rearLeft: 0, rearRight: 0 },
    weather: '...',
    trackTemp: 0,
    airTemp: 0,
    bestLapTime: '--:--.---',
    optimalLapTime: '--:--.---',
    // lastLap is optional and will be undefined initially
};
export function Transponder() {
const [liveData, setLiveData] = useState<LiveSessionData>(initialData);
    
    // State for the lap history table
    const [laps, setLaps] = useState<LapData[]>([]);
    
    // Ref to track the current session ID to handle session changes
    const displayedSessionId = useRef<number | null>(null);

     // We use a ref to store the previous data without causing re-renders.
    const lastLoggedData = useRef<LiveSessionData | null>(null);

    useEffect(() => {
        // This effect runs once when the component mounts.
        // It sets up the connection and the data handler.
        console.log("[Transponder] Mounting and starting telemetry...");
        api.telemetry.start('lmu');

        // Subscribe to the data stream from api.ts
        const unsubscribe = api.telemetry.onData((data: LiveSessionData) => {

             // --- ADD THIS LINE FOR DEBUGGING ---
              // --- OPTIMIZED LOGGING LOGIC ---
            // Only log if the lap number has changed OR if a lastLap object has appeared.
            if (
                data.currentLap !== lastLoggedData.current?.currentLap ||
                (data.lastLap && !lastLoggedData.current?.lastLap)
            ) {
                console.log("[Transponder] Data received from WebSocket (on change):", data);
                lastLoggedData.current = data; // Update the ref with the latest logged data
            }
            // Update the main live data state with every message
            setLiveData(data);

            // --- Your existing robust session and lap handling logic ---
            if (data.isConnected && data.sessionId) {
                // Check for a new session
                if (displayedSessionId.current !== data.sessionId) {
                     console.log(`[Transponder] New session detected (ID: ${data.sessionId}). Clearing old lap data.`);
                    setLaps([]); // Clear laps from the previous session
                    displayedSessionId.current = data.sessionId; // Lock onto the new session ID
                }

                // If the live data includes a newly completed lap, add it to our list
                if (data.lastLap) {
                     console.log("%c[Transponder] lastLap object DETECTED!", "color: lightgreen; font-weight: bold;", JSON.stringify(data.lastLap));
                    setLaps(prevLaps => {
                        // Prevent adding the same lap twice
                        if (prevLaps.some(l => l.lapNumber === data.lastLap!.lapNumber)) {
                            return prevLaps;
                        }
                        // Append the new lap
                        return [...prevLaps, data.lastLap!];
                    });
                }
            }
        });

        // The cleanup function returned by useEffect
        return () => {
            console.log('[Transponder] Unmounting. Unsubscribing and stopping telemetry.');
            unsubscribe();      // Remove the listener from the telemetry service
            api.telemetry.stop();       // Close the WebSocket connection
        };
    }, []);

    // FIX 2: Correctly and safely find the best lap and sectors
    const { bestLap, bestSectors } = useMemo(() => {
        const validLaps = laps.filter(lap => lap.isValid);
        if (validLaps.length === 0) {
            return { bestLap: null, bestSectors: { s1: null, s2: null, s3: null } };
        }

        // Sort once to find the best lap overall
        const bestLap = [...validLaps].sort((a, b) => a.lapTimeMs - b.lapTimeMs)[0];

        // Sort individually for each sector to find the best sector times
        const bestSectors = {
            s1: [...validLaps].sort((a, b) => a.sector1Ms - b.sector1Ms)[0],
            s2: [...validLaps].sort((a, b) => a.sector2Ms - b.sector2Ms)[0],
            s3: [...validLaps].sort((a, b) => a.sector3Ms - b.sector3Ms)[0],
        };

        return { bestLap, bestSectors };
    }, [laps]);

    const optimalLapTime = (bestSectors.s1 && bestSectors.s2 && bestSectors.s3)
        ? formatTimeFromMs(bestSectors.s1.sector1Ms + bestSectors.s2.sector2Ms + bestSectors.s3.sector3Ms)
        : "--:--.---";

    const isLive = liveData.isConnected;
    const hasSessionData = liveData.track !== '...';


    return (
       <FeatureLayout header={<FeatureNavigation />}>
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold text-white">Live Transponder</h1>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${isLive ? "bg-accent-secondary animate-pulse" : "bg-gray-600"}`} />
                            <span className="text-sm text-gray-400">{isLive ? "Live" : hasSessionData ? "Session Ended" : "Disconnected"}</span>
                        </div>
                    </div>
                    <p className="text-gray-400">Real-time telemetry and session data from Le Mans Ultimate</p>
                </div>

                {!hasSessionData ? (
                    <div className="bg-surface border border-gray-800 rounded-lg p-12 text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Waiting for Connection</h3>
                        <p className="text-gray-400">Start a session in Le Mans Ultimate to see live data</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Main Timing Table */}
                        <div className="xl:col-span-3 bg-surface border border-gray-800 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">Live Timing</h3>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="text-gray-400">
                                            Best Lap: <span className="text-accent font-mono">{bestLap?.lapTime || "--:--.---"}</span>
                                        </div>
                                        <div className="text-gray-400">
                                            Optimal: <span className="text-accent font-mono">{optimalLapTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-black">
                                        <tr>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase w-16">Lap</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Lap Time</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Sector 1</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Sector 2</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Sector 3</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase w-16">Valid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {/* Current lap in progress */}
                                        {isLive && (
                                            <tr className="bg-accent/10 border-l-4 border-accent">
                                                <td className="p-3 font-mono text-white font-bold">{'OUT'}</td>
                                                <td className="p-3 font-mono text-white">--:--.---</td>
                                                <td className="p-3 font-mono text-accent">--:--.---</td>
                                                <td className="p-3 font-mono text-accent">--:--.---</td>
                                                <td className="p-3 font-mono text-accent">--:--.---</td>
                                                <td className="p-3">
                                                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                                </td>
                                            </tr>
                                        )}

                                        {/* Completed laps */}
                                        {laps.map((lap) => {
                                            const isBestLap = bestLap && lap.lapNumber === bestLap.lapNumber;
                                            const isBestS1 = bestSectors.s1 && lap.lapNumber === bestSectors.s1.lapNumber;
                                            const isBestS2 = bestSectors.s2 && lap.lapNumber === bestSectors.s2.lapNumber;
                                            const isBestS3 = bestSectors.s3 && lap.lapNumber === bestSectors.s3.lapNumber;

                                            return (
                                                <tr
                                                    key={lap.lapNumber}
                                                    className={`hover:bg-black/50 ${isBestLap ? "bg-accent/10" : ""} ${!lap.isValid ? "opacity-60" : ""}`}
                                                >
                                                    <td className="p-3 font-mono text-white">{lap.lapNumber}</td>
                                                    <td
                                                        className={`p-3 font-mono font-medium ${isBestLap ? "text-accent font-bold" : "text-white"}`}
                                                    >
                                                        {lap.lapTime}
                                                    </td>
                                                    <td className={`p-3 font-mono ${isBestS1 ? "text-accent font-bold" : "text-gray-300"}`}>
                                                        {lap.sector1}
                                                    </td>
                                                    <td className={`p-3 font-mono ${isBestS2 ? "text-accent font-bold" : "text-gray-300"}`}>
                                                        {lap.sector2}
                                                    </td>
                                                    <td className={`p-3 font-mono ${isBestS3 ? "text-accent font-bold" : "text-gray-300"}`}>
                                                        {lap.sector3}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`w-2 h-2 rounded-full inline-block ${lap.isValid ? "bg-green-400" : "bg-red-400"}`}
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {laps.length === 0 && (
                                <div className="p-12 text-center">
                                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h4 className="text-white font-medium mb-2">Waiting for lap data</h4>
                                    <p className="text-gray-400 text-sm">Complete a lap to see timing data</p>
                                </div>
                            )}
                        </div>

                        {/* Session Info Sidebar */}
                        <div className="space-y-6">
                            {/* Session Details */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Session Info</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Track:</span>
                                        <span className="text-white">{liveData.track}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Car:</span>
                                        <span className="text-white">{liveData.car}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Session:</span>
                                        <span className="text-white">{liveData.sessionType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Time Left:</span>
                                        <span className="text-white font-mono">{liveData.sessionTimeRemaining}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Position:</span>
                                        <span className="text-white">{liveData.position}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Current Lap Info */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Current Lap</h3>
                                <div className="text-center">
                                    <div className="text-3xl font-mono font-bold text-accent mb-2">{liveData.currentLap}</div>
                                    <div className="text-sm text-gray-400">Lap Number</div>
                                </div>
                            </div>

                            {/* Fuel Level */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Fuel</h3>
                                <div className="text-center mb-4">
                                    <div className="text-2xl font-mono font-bold text-white">{liveData.fuelLevel}%</div>
                                </div>
                                <div className="w-full bg-primary rounded-full h-3">
                                    <div
                                        className="bg-accent-secondary h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${liveData.fuelLevel}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tyre Pressures */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Tyre Pressures</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">
                                            {liveData.tyrePressures.frontLeft.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">FL</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">
                                            {liveData.tyrePressures.frontRight.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">FR</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">
                                            {liveData.tyrePressures.rearLeft.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">RL</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">
                                            {liveData.tyrePressures.rearRight.toFixed(1)}
                                        </div>
                                        <div className="text-xs text-gray-400">RR</div>
                                    </div>
                                </div>
                            </div>

                            {/* Weather */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Conditions</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Weather:</span>
                                        <span className="text-white">{liveData.weather}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Track Temp:</span>
                                        <span className="text-white">{liveData.trackTemp}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Air Temp:</span>
                                        <span className="text-white">{liveData.airTemp}°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FeatureLayout>
    )
}
