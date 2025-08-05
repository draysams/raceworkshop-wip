"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { features } from "../../../features.config"
import { api } from "../../services/api"
import type { SessionSummary, LapData } from "../../shared/types"
import { formatTimeFromMs } from "../../shared/utils/formatters"
// --- CHANGE START: Import charting components ---
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// --- CHANGE END ---

interface SessionDetailProps {
    sessionId: number
    onBack: () => void
}

interface TelemetryData {
    [channelName: string]: { x: number; y: number }[];
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
    const [sessionData, setSessionData] = useState<{ session: SessionSummary; laps: LapData[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLap, setSelectedLap] = useState<LapData | null>(null);
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"timing" | "telemetry">("timing");

    useEffect(() => {
        if (!sessionId) return;
        setIsLoading(true);
        setError(null);

        api.sessions.getSessionDetail(sessionId)
            .then(data => {
                if (data) {
                    setSessionData(data);
                    const bestValidLap = data.laps.filter(l => l.isValid && l.lapTimeMs > 0).sort((a, b) => a.lapTimeMs - b.lapTimeMs)[0];
                    setSelectedLap(bestValidLap || data.laps[0] || null);
                } else {
                    setError("Session data could not be found.");
                }
            })
            .catch(err => {
                console.error("Failed to fetch session detail:", err);
                setError("An error occurred while fetching session details.");
            })
            .finally(() => setIsLoading(false));
    }, [sessionId]);

    useEffect(() => {
        if (!selectedLap?.id) { // Guard against missing ID
            setTelemetry(null);
            return;
        }

        setIsTelemetryLoading(true);
        api.telemetry.getLapTelemetry(selectedLap.id)
            .then(data => setTelemetry(data))
            .catch(err => console.error("Failed to fetch telemetry:", err))
            .finally(() => setIsTelemetryLoading(false));
    }, [selectedLap?.id]); // Depend on the ID to ensure re-fetch

    const { bestLap, bestSectors } = useMemo(() => {
        if (!sessionData?.laps) return { bestLap: null, bestSectors: { s1: null, s2: null, s3: null } };
        const validLaps = sessionData.laps.filter(lap => lap.isValid);
        if (validLaps.length === 0) return { bestLap: null, bestSectors: { s1: null, s2: null, s3: null } };

        const bestLap = [...validLaps].sort((a, b) => a.lapTimeMs - b.lapTimeMs)[0];
        const bestSectors = {
            s1: [...validLaps].filter(l => l.sector1Ms > 0).sort((a, b) => a.sector1Ms - b.sector1Ms)[0],
            s2: [...validLaps].filter(l => l.sector2Ms > 0).sort((a, b) => a.sector2Ms - b.sector2Ms)[0],
            s3: [...validLaps].filter(l => l.sector3Ms > 0).sort((a, b) => a.sector3Ms - b.sector3Ms)[0],
        };
        return { bestLap, bestSectors };
    }, [sessionData?.laps]);

    const optimalLapTime = (bestSectors.s1 && bestSectors.s2 && bestSectors.s3)
        ? formatTimeFromMs(bestSectors.s1.sector1Ms + bestSectors.s2.sector2Ms + bestSectors.s3.sector3Ms)
        : "--:--.---";
    
    if (isLoading) return <div className="p-6 text-center text-gray-400">Loading session details...</div>;
    if (error || !sessionData) return <div className="p-6 text-center"><p className="text-red-400">{error || "Session not found."}</p><button onClick={onBack} className="mt-4 text-sm text-accent hover:underline">Back to History</button></div>;
    
    const { session, laps } = sessionData;
    const simConfig = features[session.simulator];
    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    {/* ... Header JSX is unchanged ... */}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex gap-1 bg-surface border border-gray-800 rounded-lg p-1">
                        {/* Simplified tabs for what we have data for */}
                        <button onClick={() => setActiveTab("timing")} className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'timing' ? "bg-accent text-white" : "text-gray-400 hover:text-white hover:bg-black/50"}`}>
                            <span>⏱️</span> Timing & Scoring
                        </button>
                        <button onClick={() => setActiveTab("telemetry")} className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'telemetry' ? "bg-accent text-white" : "text-gray-400 hover:text-white hover:bg-black/50"}`}>
                            <span>📈</span> Telemetry
                        </button>
                    </div>
                </div>

                {/* --- Tab Content --- */}
                {activeTab === "timing" && (
                    <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Detailed Lap Analysis</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black">
                                    <tr>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Lap</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Lap Time</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S1</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S2</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S3</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Valid</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {laps.map((lap) => (
                                        <tr
                                            key={lap.lapNumber}
                                            onClick={() => setSelectedLap(lap)}
                                            className={`hover:bg-black/50 cursor-pointer ${selectedLap?.lapNumber === lap.lapNumber ? "bg-accent/10" : ""} ${!lap.isValid ? "opacity-60" : ""}`}
                                        >
                                            <td className="p-3 font-mono text-white">{lap.lapNumber}</td>
                                            <td className={`p-3 font-mono font-medium ${bestLap?.lapNumber === lap.lapNumber ? "text-accent font-bold" : "text-white"}`}>{lap.lapTime}</td>
                                            <td className={`p-3 font-mono ${bestSectors.s1?.lapNumber === lap.lapNumber ? "text-accent font-bold" : "text-gray-300"}`}>{lap.sector1}</td>
                                            <td className={`p-3 font-mono ${bestSectors.s2?.lapNumber === lap.lapNumber ? "text-accent font-bold" : "text-gray-300"}`}>{lap.sector2}</td>
                                            <td className={`p-3 font-mono ${bestSectors.s3?.lapNumber === lap.lapNumber ? "text-accent font-bold" : "text-gray-300"}`}>{lap.sector3}</td>
                                            <td className="p-3"><span className={`w-2 h-2 rounded-full inline-block ${lap.isValid ? "bg-green-400" : "bg-red-400"}`} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {/* --- NEW TELEMETRY TAB CONTENT --- */}
                {activeTab === "telemetry" && (
                     <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                           Telemetry for Lap {selectedLap?.lapNumber ?? ''}
                           <span className="text-gray-400 font-mono text-base ml-4">{selectedLap?.lapTime}</span>
                        </h3>
                        {isTelemetryLoading && <p className="text-gray-400">Loading telemetry...</p>}
                        {!isTelemetryLoading && telemetry && (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={telemetry.Speed} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="x" type="number" domain={['dataMin', 'dataMax']} stroke="#9CA3AF" unit="m" />
                                    <YAxis yAxisId="left" stroke="#8B5CF6" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#FBBF24" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                                        labelStyle={{ color: '#F9FAFB' }}
                                    />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" data={telemetry.Speed} dataKey="y" name="Speed (KPH)" stroke="#8B5CF6" dot={false} strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" data={telemetry.RPM} dataKey="y" name="RPM" stroke="#FBBF24" dot={false} strokeWidth={2} />
                                    {/* Add more <Line> components here for Throttle, Brake, etc. */}
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                        {!isTelemetryLoading && !telemetry && <p className="text-gray-400">No telemetry data available for this lap.</p>}
                     </div>
                )}
            </div>
        </div>
    )
}