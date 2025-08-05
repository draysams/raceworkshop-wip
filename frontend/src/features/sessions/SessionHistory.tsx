"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { features } from "../../../features.config"
import { DateRangePicker } from "../../components/ui/DateRangePicker"
import { api } from "../../services/api";
import type { SessionFilters } from "../../shared/types";
import type { SessionSummary } from "../../shared/types";
import { formatDurationFromMs, formatTimeFromMs } from "../../shared/utils/formatters";


interface SessionHistoryProps {
    onViewSession: (sessionId: number) => void
}

export function SessionHistory({ onViewSession }: SessionHistoryProps) {
    const [sessions, setSessions] = useState<SessionSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Keep this single state object for all filters
    const [filters, setFilters] = useState<SessionFilters>({
        simulator: "all",
        sessionType: "all",
        track: "all",
        car: "all",
        dateFrom: "",
        dateTo: "",
        sortBy: "date",
        sortOrder: "desc",
    });

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            //TODO add filters to the API call when implemented
            // const fetchedSessions = await api.db.getSessionHistory(filters);
            // setSessions(fetchedSessions);

             const fetchedSessions = await api.sessions.getSessionHistory(filters);
            setSessions(fetchedSessions);
        } catch (error) {
            console.error("Failed to fetch session history:", error);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);




    // Unique values for dropdowns are derived from the fetched data.
    const { uniqueTracks, uniqueCars } = useMemo(() => {
        const allTracks = [...new Set(sessions.map((s) => s.track))].sort();
        const allCars = [...new Set(sessions.map((s) => s.car))].sort();
        return { uniqueTracks: allTracks, uniqueCars: allCars };
    }, [sessions]);

    const summaryStats = useMemo(() => {
        if (sessions.length === 0) {
            return {
                totalSessions: 0, totalDistance: 0, totalLaps: 0, totalValidLaps: 0,
                totalDuration: 0, totalFuelUsed: 0, averageLapTime: 0, bestLapTime: 0,
                sessionTypeBreakdown: {}, simulatorBreakdown: {},
            }
        }

        const totalDistance = sessions.reduce((sum, s) => sum + s.distance, 0);
        const totalLaps = sessions.reduce((sum, s) => sum + s.totalLaps, 0);
        const totalValidLaps = sessions.reduce((sum, s) => sum + s.validLaps, 0);
        const totalDuration = sessions.reduce((sum, s) => sum + s.durationMs, 0);
        const totalFuelUsed = sessions.reduce((sum, s) => sum + s.fuelUsed, 0);

        const validLapSessions = sessions.filter(s => s.averageLapMs && s.validLaps > 0);
        const totalWeightedMs = validLapSessions.reduce((sum, s) => sum + (s.averageLapMs || 0) * s.validLaps, 0);
        const totalValidLapsForAvg = validLapSessions.reduce((sum, s) => sum + s.validLaps, 0);
        const averageLapTime = totalValidLapsForAvg > 0 ? totalWeightedMs / totalValidLapsForAvg : 0;

        const bestLapTime = Math.min(...sessions.map(s => s.bestLapMs || Infinity).filter(t => t > 0));

        const sessionTypeBreakdown = sessions.reduce((acc, s) => {
            acc[s.sessionType] = (acc[s.sessionType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const simulatorBreakdown = sessions.reduce((acc, s) => {
            acc[s.simulator] = (acc[s.simulator] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalSessions: sessions.length, totalDistance, totalLaps, totalValidLaps,
            totalDuration, totalFuelUsed, averageLapTime, bestLapTime,
            sessionTypeBreakdown, simulatorBreakdown,
        };
    }, [sessions]);

    // Generic handler to update a filter property
    const handleFilterChange = (filterName: keyof SessionFilters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };


    const handleSort = (newSortBy: string) => {
        handleFilterChange('sortBy', newSortBy);
        if (filters.sortBy === newSortBy) {
            handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            handleFilterChange('sortOrder', 'desc');
        }
    };

    const getSortIcon = (column: string) => {
        if (filters.sortBy !== column) {
            return <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
        }
        return filters.sortOrder === 'asc' ? <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> : <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" /></svg>;
    };

    const clearAllFilters = () => {
        setFilters({
            simulator: "all", sessionType: "all", track: "all", car: "all",
            dateFrom: "", dateTo: "", sortBy: "date", sortOrder: "desc",
        });
    };

    const hasActiveFilters = filters.simulator !== "all" || filters.sessionType !== "all" || filters.track !== "all" || filters.car !== "all" || filters.dateFrom !== "" || filters.dateTo !== "";
    const enabledSimulators = Object.entries(features).filter(([, config]) => config.enabled);

    if (isLoading) {
        return <div className="p-6 text-center text-gray-400">Loading session history...</div>;
    }

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-white mb-2">Session History</h1>
                    <p className="text-gray-400">Comprehensive view and analysis of all your racing sessions</p>
                </div>

                {/* Advanced Filters and Controls */}
                <div className="bg-surface border border-gray-800 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Simulator</label>
                            <select
                                value={filters.simulator}
                                onChange={(e) => handleFilterChange('simulator', e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="all">All Simulators</option>
                                {enabledSimulators.map(([moduleId, config]) => (
                                    <option key={moduleId} value={moduleId}>
                                        {config.icon} {config.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Track</label>
                            <select
                                value={filters.track}
                                onChange={(e) => handleFilterChange('track', e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="all">All Tracks</option>
                                {uniqueTracks.map((track: string) => (
                                    <option key={track} value={track}>
                                        {track}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Car</label>
                            <select
                                value={filters.car}
                                onChange={(e) => handleFilterChange('car', e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="all">All Cars</option>
                                {uniqueCars.map((car: string) => (
                                    <option key={car} value={car}>
                                        {car}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Session Type</label>
                            <select
                                value={filters.sessionType}
                                onChange={(e) => handleFilterChange('sessionType', e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="all">All Types</option>
                                <option value="race">Race</option>
                                <option value="practice">Practice</option>
                                <option value="qualifying">Qualifying</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <DateRangePicker
                                fromDate={filters.dateFrom || ''}
                                toDate={filters.dateTo || ''}
                                onFromDateChange={(date) => handleFilterChange('dateFrom', date)}
                                onToDateChange={(date) => handleFilterChange('dateTo', date)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                                <option value="date">Date</option>
                                <option value="track">Track</option>
                                <option value="car">Car</option>
                                <option value="bestLap">Best Lap Time</option>
                                <option value="averageLap">Average Lap Time</option>
                                <option value="laps">Lap Count</option>
                                <option value="distance">Session Distance</option>
                                <option value="duration">Session Duration</option>
                                <option value="trackDistance">Total Track Distance</option>
                                <option value="carDistance">Total Car Distance</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Order</label>
                            <button
                                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
                                {getSortIcon(filters.sortBy || 'date')}
                            </button>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div className="mb-4">
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* Summary Statistics Bar */}
                    <div className="border-t border-gray-800 pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-white">{summaryStats.totalSessions}</div>
                                <div className="text-xs text-gray-400">Sessions</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-accent">
                                    {summaryStats.totalDistance.toFixed(1)} km
                                </div>
                                <div className="text-xs text-gray-400">Total Distance</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-white">{summaryStats.totalLaps.toLocaleString()}</div>
                                <div className="text-xs text-gray-400">Total Laps</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-green-400">
                                    {summaryStats.totalValidLaps.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-400">Valid Laps</div>
                            </div>

                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-blue-400">
                                    {formatDurationFromMs(summaryStats.totalDuration)}
                                </div>
                                <div className="text-xs text-gray-400">Total Time</div>
                            </div>

                            {summaryStats.averageLapTime > 0 && (
                                <div className="text-center">
                                    <div className="text-lg font-mono font-bold text-yellow-400">
                                        {formatTimeFromMs(summaryStats.averageLapTime)}
                                    </div>
                                    <div className="text-xs text-gray-400">Avg Lap Time</div>
                                </div>
                            )}

                            {summaryStats.bestLapTime > 0 && summaryStats.bestLapTime < Number.POSITIVE_INFINITY && (
                                <div className="text-center">
                                    <div className="text-lg font-mono font-bold text-accent">
                                        {formatTimeFromMs(summaryStats.bestLapTime)}
                                    </div>
                                    <div className="text-xs text-gray-400">Best Lap</div>
                                </div>
                            )}

                            <div className="text-center">
                                <div className="text-lg font-mono font-bold text-orange-400">
                                    {summaryStats.totalFuelUsed.toFixed(1)}L
                                </div>
                                <div className="text-xs text-gray-400">Total Fuel</div>
                            </div>
                        </div>

                        {/* Session Type and Simulator Breakdown */}
                        {(Object.keys(summaryStats.sessionTypeBreakdown).length > 1 ||
                            Object.keys(summaryStats.simulatorBreakdown).length > 1) && (
                                <div className="mt-4 pt-4 border-t border-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.keys(summaryStats.sessionTypeBreakdown).length > 1 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Session Types</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(summaryStats.sessionTypeBreakdown).map(([type, count]) => (
                                                        <span
                                                            key={type}
                                                            className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${type === "Race"
                                                                    ? "bg-red-500/20 text-red-300"
                                                                    : type === "Qualifying"
                                                                        ? "bg-yellow-500/20 text-yellow-300"
                                                                        : "bg-blue-500/20 text-blue-300"
                                                                }
                            `}
                                                        >
                                                            {type}: {count}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {Object.keys(summaryStats.simulatorBreakdown).length > 1 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Simulators</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(summaryStats.simulatorBreakdown).map(([sim, count]) => {
                                                        const simConfig = features[sim]
                                                        return (
                                                            <span
                                                                key={sim}
                                                                className="px-2 py-1 rounded text-xs font-medium bg-surface border border-gray-800 text-white"
                                                            >
                                                                {simConfig?.icon} {simConfig?.name}: {count}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {/* Sessions List */}
                <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-800">
                        {sessions.map((session) => {
                            const simConfig = features[session.simulator]
                            return (
                                <div
                                    key={session.id}
                                    className="p-6 hover:bg-black/50 transition-all duration-200 cursor-pointer group"
                                    onClick={() => onViewSession(session.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="text-2xl">{simConfig?.icon}</div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-medium text-white truncate">{session.track}</h4>
                                                    <span
                                                        className={`
                              px-2 py-0.5 rounded text-xs font-medium
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

                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm text-gray-400">
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Car</span>
                                                        <span className="text-white">{session.car}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Laps</span>
                                                        <span className="text-white font-mono">{session.totalLaps}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Distance</span>
                                                        <span className="text-white font-mono">{session.distance?.toFixed(1)} km</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Duration</span>
                                                        <span className="text-white font-mono">{session.duration}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Valid Laps</span>
                                                        <span className="text-white font-mono">
                                                            {session.validLaps}/{session.totalLaps}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs text-gray-500">Date</span>
                                                        <span className="text-white">{new Date(session.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 ml-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Best Lap</div>
                                                <div className="font-mono text-green-400 font-medium">{session.bestLap || "--:--.---"}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Average</div>
                                                <div className="font-mono text-blue-400 font-medium">{session.averageLap || "--:--.---"}</div>
                                            </div>

                                            <button
                                                className="
                        px-4 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white 
                        border border-accent/30 hover:border-accent rounded-md text-sm font-medium
                        transition-all duration-200 opacity-0 group-hover:opacity-100
                        transform translate-x-2 group-hover:translate-x-0
                      "
                                            >
                                                Analyze
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {sessions.length === 0 && (
                    <div className="bg-surface border border-gray-800 rounded-lg p-12 text-center">
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
                        <h3 className="text-lg font-semibold text-white mb-2">No sessions found</h3>
                        <p className="text-gray-400">No sessions match your current filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    )
}
