"use client"

import { useEffect, useState } from "react"
import { features } from "../../../features.config"
import { api } from "../../services/api"
import type { GlobalDashboardStats, SessionSummary } from "../../shared/types"

interface GlobalDashboardProps {
    onModuleSelect: (moduleId: string) => void
    onNavigateToSessions: (moduleId: string) => void // This seems to be unused, but keeping prop signature
}

export function GlobalDashboard({ onModuleSelect }: GlobalDashboardProps) {
    // --- CHANGE START ---
    // 1. Use state to hold the fetched data, initializing to null for a loading state.
    const [stats, setStats] = useState<GlobalDashboardStats | null>(null)
    const enabledSimulators = Object.entries(features).filter(([, config]) => config.enabled)

    // 2. Use useEffect to fetch data from the backend when the component mounts.
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Call the new, correct API endpoint
                const fetchedStats = await api.dashboard.getGlobalDashboardStats()
                setStats(fetchedStats)
            } catch (error) {
                console.error("Failed to fetch global dashboard stats:", error)
            }
        }
        fetchStats()
    }, []) // Empty dependency array means this runs only once.
    // --- CHANGE END ---

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back to RaceWorkshop</h1>
                    <p className="text-gray-400">Here's your racing activity across all simulators</p>
                </div>

                {/* Quick Stats - Now powered by live data */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Total Sessions</h3>
                        </div>
                        {/* Use state data, with a "..." fallback for the initial loading state */}
                        <div className="text-3xl font-bold text-white mb-1">{stats?.analytics?.total_sessions ?? "..."}</div>
                        <p className="text-gray-400 text-sm">Across all simulators</p>
                    </div>

                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                            <h3 className="text-lg font-semibold text-white">Drive Time</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats?.analytics?.track_time ?? "..."}</div>
                        <p className="text-gray-400 text-sm">Time behind the wheel</p>
                    </div>

                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center"><svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                            <h3 className="text-lg font-semibold text-white">Total Laps</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats?.analytics?.total_laps?.toLocaleString() ?? "..."}</div>
                        <p className="text-gray-400 text-sm">Laps completed</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Recent Activity - Now powered by live data */}
                    <div className="xl:col-span-2 bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {/* Map over the recentSessions array from our state */}
                            {stats?.recentSessions.map((session: SessionSummary) => {
                                const simConfig = features[session.simulator];
                                return (
                                    <div key={session.id} className="p-6 hover:bg-black/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{simConfig?.icon ?? "🏎️"}</div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-medium text-white">{session.track.displayName}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300`}>
                                                            {session.sessionType}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>{session.car.displayName}</span>
                                                        <span>{simConfig?.name ?? session.simulator}</span>
                                                        <span>{new Date(session.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-green-400 font-medium">{session.bestLap}</div>
                                                <div className="text-xs text-gray-400">Best Lap</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-gray-800">
                            <button className="w-full text-accent hover:text-accent-hover text-sm font-medium transition-colors">
                                View All Sessions
                            </button>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
                        <div className="space-y-3">
                            {enabledSimulators.map(([moduleId, config]) => (
                                <button
                                    key={moduleId}
                                    onClick={() => onModuleSelect(moduleId)}
                                    className="w-full flex items-center gap-3 p-3 bg-black hover:bg-gray-800 border border-gray-800 rounded-lg transition-colors group"
                                >
                                    <span className="text-xl">{config.icon}</span>
                                    <div className="flex-1 text-left">
                                        <div className="text-white font-medium group-hover:text-accent transition-colors">{config.name}</div>
                                        {/* Removed mock session count */}
                                        <div className="text-gray-400 text-xs">View Dashboard</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* --- CHANGE: Removed sections that relied on mock data not yet available from the backend --- */}
            </div>
        </div>
    );
}