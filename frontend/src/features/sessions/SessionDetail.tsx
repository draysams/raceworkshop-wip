"use client"

import { useState } from "react"
import { features } from "../../../features.config"
import { useEffect, useMemo } from "react"; // Add useEffect and useMemo
import type { SessionSummary, LapData } from "../../shared/types";
import { formatTimeFromMs } from "../../shared/utils/formatters";
import { api } from "../../services/api";


interface SessionDetailProps {
    sessionId: number
    onBack: () => void
}


export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
    const [session, setSession] = useState<SessionSummary | null>(null);
    const [laps, setLaps] = useState<LapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "timing" | "telemetry" | "analysis" | "comparison">("timing");

    useEffect(() => {
        if (!sessionId) return;
        setIsLoading(true);
        setError(null);

      api.db.getSessionDetail(sessionId)
        .then(data => {
        if (data) {
            setSession(data.session);
            setLaps(data.laps);
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

    const { bestLap, bestSectors } = useMemo(() => {
        if (!laps || laps.length === 0) return { bestLap: null, bestSectors: { s1: null, s2: null, s3: null } };
        const validLaps = laps.filter(lap => lap.isValid);
        if (validLaps.length === 0) return { bestLap: null, bestSectors: { s1: null, s2: null, s3: null } };

        const bestLap = [...validLaps].sort((a, b) => a.lapTimeMs - b.lapTimeMs)[0];
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

    const formatDelta = (deltaMs: number) => {
        if (deltaMs === 0) return "—"
        const sign = deltaMs > 0 ? "+" : ""
        const seconds = Math.abs(deltaMs) / 1000
        return `${sign}${seconds.toFixed(3)}`
    }

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading session details...</div>;
    }

    if (error || !session) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-400">{error || "Session not found."}</p>
                <button onClick={onBack} className="mt-4 text-sm text-accent hover:underline">
                    Back to History
                </button>
            </div>
        );
    }

    const simConfig = features[session.simulator];

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to History
                        </button>
                    </div>

                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{simConfig.icon}</div>
                                <div>
                                    <h1 className="text-2xl font-semibold text-white mb-2">{session.track}</h1>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span>{session.car}</span>
                                        <span>•</span>
                                        <span>{simConfig.name}</span>
                                        <span>•</span>
                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{session.duration}</span>
                                    </div>
                                </div>
                            </div>
                            <span
                                className={`
                  px-3 py-1 rounded text-sm font-medium
                  ${session.sessionType === "Race"
                                        ? "bg-red-500/20 text-red-300"
                                        : session.sessionType === "Qualifying"
                                            ? "bg-yellow-500/20 text-yellow-300"
                                            : "bg-blue-500/20 text-blue-300"
                                    }
                `}
                            >
                                {session.sessionType}
                            </span>
                        </div>

                        {/* Key Performance Indicators */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-accent">{session.bestLap}</div>
                                <div className="text-xs text-gray-400">Best Lap</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-blue-400">{optimalLapTime}</div>
                                <div className="text-xs text-gray-400">Optimal</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-white">{session.averageLap}</div>
                                <div className="text-xs text-gray-400">Average</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-white">{session.totalLaps}</div>
                                <div className="text-xs text-gray-400">Total Laps</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-green-400">{session.validLaps}</div>
                                <div className="text-xs text-gray-400">Valid Laps</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-mono font-bold text-white">
                                    {session.distance.toFixed(1)} km
                                </div>
                                <div className="text-xs text-gray-400">Distance</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="mb-6">
                    <div className="flex gap-1 bg-surface border border-gray-800 rounded-lg p-1">
                        {[
                            { id: "overview", label: "Overview", icon: "📊" },
                            { id: "timing", label: "Timing & Scoring", icon: "⏱️" },
                            { id: "telemetry", label: "Telemetry", icon: "📈" },
                            { id: "analysis", label: "Performance Analysis", icon: "🔍" },
                            { id: "comparison", label: "Comparison", icon: "⚖️" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                  flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2
                  ${activeTab === tab.id ? "bg-accent text-white" : "text-gray-400 hover:text-white hover:bg-black/50"}
                `}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Session Statistics */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Session Statistics</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Consistency:</span>
                                        <span className="text-green-400">92.3%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Improvement Potential:</span>
                                        <span className="text-accent">-2.778s</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Fuel Efficiency:</span>
                                        <span className="text-white">3.77 L/lap</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Average Speed:</span>
                                        <span className="text-white">218.4 km/h</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Top Speed:</span>
                                        <span className="text-white">278 km/h</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lap Time Distribution */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Lap Time Distribution</h3>
                                <div className="h-32 bg-black rounded border border-gray-800 flex items-center justify-center mb-4">
                                    <p className="text-gray-400 text-sm">Lap time histogram would go here</p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Fastest 25%:</span>
                                        <span className="text-green-400">3:28.456 - 3:30.123</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Median:</span>
                                        <span className="text-white">3:31.234</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Slowest 25%:</span>
                                        <span className="text-red-400">3:33.567 - 3:45.123</span>
                                    </div>
                                </div>
                            </div>

                            {/* Weather & Conditions */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Conditions</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Weather:</span>
                                        <span className="text-white">{session.weather}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Track Temperature:</span>
                                        <span className="text-white">{session.trackTemp}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Air Temperature:</span>
                                        <span className="text-white">{session.airTemp}°C</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Grip Level:</span>
                                        <span className="text-green-400">Optimal</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Trends */}
                        <div className="bg-surface border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
                            <div className="h-64 bg-black rounded border border-gray-800 flex items-center justify-center">
                                <p className="text-gray-400">Lap time progression chart would go here</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "timing" && (
                    <div className="space-y-6">
                        {/* Enhanced Lap Times Table */}
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
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Delta</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S1</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S2</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">S3</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Top Speed</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Fuel</th>
                                            <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Valid</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
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
                                                    <td
                                                        className={`p-3 font-mono text-sm ${lap.delta === 0 ? "text-accent" : lap.delta > 0 ? "text-red-400" : "text-green-400"}`}
                                                    >
                                                        {formatDelta(lap.delta)}
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
                                                    <td className="p-3 font-mono text-gray-300">{lap.speed.topSpeed} km/h</td>
                                                    <td className="p-3 font-mono text-gray-300">{lap.fuelUsed}L</td>
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
                        </div>
                    </div>
                )}

                {activeTab === "telemetry" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Speed Analysis */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Speed Analysis</h3>
                                <div className="h-48 bg-black rounded border border-gray-800 flex items-center justify-center mb-4">
                                    <p className="text-gray-400">Speed trace chart would go here</p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">278</div>
                                        <div className="text-xs text-gray-400">Top Speed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">218</div>
                                        <div className="text-xs text-gray-400">Avg Speed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-mono font-bold text-white">89</div>
                                        <div className="text-xs text-gray-400">Min Speed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tyre Temperature */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Tyre Analysis</h3>
                                <div className="h-48 bg-black rounded border border-gray-800 flex items-center justify-center mb-4">
                                    <p className="text-gray-400">Tyre temperature chart would go here</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Average Pressures</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="text-center">
                                                <div className="text-white font-mono">27.4</div>
                                                <div className="text-xs text-gray-400">FL</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-mono">27.3</div>
                                                <div className="text-xs text-gray-400">FR</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-mono">27.0</div>
                                                <div className="text-xs text-gray-400">RL</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-white font-mono">27.1</div>
                                                <div className="text-xs text-gray-400">RR</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-2">Tyre Wear</div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Front:</span>
                                                <span className="text-green-400">12%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Rear:</span>
                                                <span className="text-green-400">8%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fuel Usage */}
                        <div className="bg-surface border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Fuel Usage Analysis</h3>
                            <div className="h-48 bg-black rounded border border-gray-800 flex items-center justify-center">
                                <p className="text-gray-400">Fuel usage progression chart would go here</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "analysis" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Performance Insights */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">🎯 Performance Insights</h3>
                                <div className="space-y-4">
                                    <div className="bg-accent/10 border border-accent/20 rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-accent">🚀</span>
                                            <span className="text-white font-medium">Strongest Sector</span>
                                        </div>
                                        <p className="text-sm text-gray-400">Sector 1 - Consistently fast through the technical section</p>
                                    </div>

                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-yellow-400">⚠️</span>
                                            <span className="text-white font-medium">Improvement Area</span>
                                        </div>
                                        <p className="text-sm text-gray-400">Sector 3 - Losing 1.2s on average, focus on exit speed</p>
                                    </div>

                                    <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-green-400">✅</span>
                                            <span className="text-white font-medium">Consistency</span>
                                        </div>
                                        <p className="text-sm text-gray-400">92% of laps within 3 seconds of best time</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sector Analysis */}
                            <div className="bg-surface border border-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">📊 Sector Breakdown</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400">Sector 1</span>
                                            <span className="text-accent font-mono">{bestSectors.s1?.sector1 || '--:--.---'}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-accent h-2 rounded-full" style={{ width: "85%" }} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">85% optimal</div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400">Sector 2</span>
                                            <span className="text-accent font-mono">{bestSectors.s2?.sector2 || '--:--.---'}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-accent h-2 rounded-full" style={{ width: "78%" }} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">78% optimal</div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-400">Sector 3</span>
                                            <span className="text-accent font-mono">{bestSectors.s3?.sector3 || '--:--.---'}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "65%" }} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">65% optimal - needs work</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Analytics */}
                        <div className="bg-surface border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">🔬 Advanced Analytics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-white font-medium mb-3">Lap Time Progression</h4>
                                    <div className="h-32 bg-black rounded border border-gray-800 flex items-center justify-center">
                                        <p className="text-gray-400 text-sm">Progression chart</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-3">Consistency Analysis</h4>
                                    <div className="h-32 bg-black rounded border border-gray-800 flex items-center justify-center">
                                        <p className="text-gray-400 text-sm">Consistency chart</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium mb-3">Performance Radar</h4>
                                    <div className="h-32 bg-black rounded border border-gray-800 flex items-center justify-center">
                                        <p className="text-gray-400 text-sm">Radar chart</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "comparison" && (
                    <div className="space-y-6">
                        <div className="bg-surface border border-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">⚖️ Session Comparison</h3>
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h4 className="text-white font-medium mb-2">Compare with Other Sessions</h4>
                                <p className="text-gray-400 mb-4">Select another session to compare performance metrics</p>
                                <button className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-md transition-colors">
                                    Select Session to Compare
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
