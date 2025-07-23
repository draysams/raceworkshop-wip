"use client"
import { features } from "../../../features.config"
import { RecentSessionsWidget } from "./widgets/RecentSessionWidget"

interface ModuleDashboardProps {
    moduleId: string
    onNavigate: (submoduleId: string) => void
}

// Mock data specific to each simulator
const getSimulatorData = (moduleId: string) => {
    const baseData = {
        lmu: {
            totalSessions: 47,
            totalLaps: 892,
            totalDistance: 12847.3,
            totalTime: "156h 23m",
            bestOverallLap: "3:26.123",
            bestOverallTrack: "Circuit de la Sarthe",
            averageConsistency: 94.2,
            favoriteTrack: "Circuit de la Sarthe",
            favoriteCar: "Porsche 963",
            recentTrend: "improving",
            trackRecords: [
                { track: "Circuit de la Sarthe", time: "3:26.123", car: "Porsche 963", date: "2024-01-11" },
                { track: "Spa-Francorchamps", time: "2:03.789", car: "Ferrari 499P", date: "2024-01-13" },
                { track: "Silverstone GP", time: "1:58.234", car: "BMW M4 GT3", date: "2024-01-14" },
                { track: "Nürburgring GP", time: "1:56.234", car: "Ferrari 499P", date: "2024-01-09" },
            ],
            carStats: [
                { car: "Porsche 963", sessions: 18, bestLap: "3:26.123", avgLap: "3:29.456", totalDistance: 4892.1 },
                { car: "Ferrari 499P", sessions: 15, bestLap: "2:03.789", avgLap: "2:05.234", totalDistance: 3654.8 },
                { car: "BMW M4 GT3", sessions: 14, bestLap: "1:58.234", avgLap: "2:01.567", totalDistance: 4300.4 },
            ],
            trackStats: [
                {
                    track: "Circuit de la Sarthe",
                    sessions: 12,
                    bestLap: "3:26.123",
                    totalDistance: 3847.2,
                    avgSessionLength: "45m",
                },
                {
                    track: "Spa-Francorchamps",
                    sessions: 8,
                    bestLap: "2:03.789",
                    totalDistance: 2156.7,
                    avgSessionLength: "38m",
                },
                { track: "Silverstone GP", sessions: 11, bestLap: "1:58.234", totalDistance: 2943.1, avgSessionLength: "42m" },
                { track: "Nürburgring GP", sessions: 9, bestLap: "1:56.234", totalDistance: 2234.5, avgSessionLength: "35m" },
                { track: "Monza", sessions: 7, bestLap: "1:47.892", totalDistance: 1665.8, avgSessionLength: "32m" },
            ],
            performanceMetrics: {
                improvementRate: "+2.3s/week",
                consistencyTrend: "+1.2%",
                sessionCompletionRate: 96.8,
                validLapPercentage: 94.1,
            },
            weatherStats: {
                clearWeather: 78,
                overcast: 15,
                lightRain: 7,
            },
        },
        acc: {
            totalSessions: 63,
            totalLaps: 1247,
            totalDistance: 8934.7,
            totalTime: "198h 45m",
            bestOverallLap: "1:47.892",
            bestOverallTrack: "Monza",
            averageConsistency: 91.8,
            favoriteTrack: "Spa-Francorchamps",
            favoriteCar: "BMW M4 GT3",
            recentTrend: "stable",
            trackRecords: [
                { track: "Monza", time: "1:47.892", car: "McLaren 720S GT3", date: "2024-01-12" },
                { track: "Silverstone GP", time: "1:58.234", car: "BMW M4 GT3", date: "2024-01-14" },
                { track: "Spa-Francorchamps", time: "2:16.891", car: "BMW M4 GT3", date: "2024-01-10" },
                { track: "Brands Hatch", time: "1:25.673", car: "Audi R8 LMS GT3", date: "2024-01-08" },
                { track: "Nürburgring GP", time: "1:56.234", car: "Ferrari 488 GT3", date: "2024-01-07" },
            ],
            carStats: [
                { car: "BMW M4 GT3", sessions: 22, bestLap: "1:58.234", avgLap: "2:01.456", totalDistance: 3247.8 },
                { car: "McLaren 720S GT3", sessions: 18, bestLap: "1:47.892", avgLap: "1:49.234", totalDistance: 2891.3 },
                { car: "Audi R8 LMS GT3", sessions: 12, bestLap: "1:25.673", avgLap: "1:27.234", totalDistance: 1456.2 },
                { car: "Ferrari 488 GT3", sessions: 11, bestLap: "1:56.234", avgLap: "1:58.567", totalDistance: 1339.4 },
            ],
            trackStats: [
                {
                    track: "Spa-Francorchamps",
                    sessions: 16,
                    bestLap: "2:16.891",
                    totalDistance: 2847.3,
                    avgSessionLength: "41m",
                },
                { track: "Silverstone GP", sessions: 14, bestLap: "1:58.234", totalDistance: 2456.1, avgSessionLength: "38m" },
                { track: "Monza", sessions: 12, bestLap: "1:47.892", totalDistance: 1834.7, avgSessionLength: "35m" },
                { track: "Brands Hatch", sessions: 10, bestLap: "1:25.673", totalDistance: 987.4, avgSessionLength: "28m" },
                { track: "Nürburgring GP", sessions: 11, bestLap: "1:56.234", totalDistance: 809.2, avgSessionLength: "33m" },
            ],
            performanceMetrics: {
                improvementRate: "+1.8s/week",
                consistencyTrend: "+0.8%",
                sessionCompletionRate: 94.3,
                validLapPercentage: 91.7,
            },
            weatherStats: {
                clearWeather: 82,
                overcast: 12,
                lightRain: 6,
            },
        },
    }

    return baseData[moduleId as keyof typeof baseData] || baseData.lmu
}

export function ModuleDashboard({ moduleId, onNavigate }: ModuleDashboardProps) {
    const moduleConfig = features[moduleId]
    const simData = getSimulatorData(moduleId)

    if (!moduleConfig) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-400">Module not found</p>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">{moduleConfig.name} Dashboard</h1>
                    <p className="text-gray-400">
                        Comprehensive overview of your {moduleConfig.name} racing data and performance
                    </p>
                </div>

                {/* Key Performance Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-white">{simData.totalSessions}</div>
                        <div className="text-xs text-gray-400">Total Sessions</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-accent">{simData.totalLaps.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Total Laps</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-blue-400">
                            {simData.totalDistance.toLocaleString()} km
                        </div>
                        <div className="text-xs text-gray-400">Distance Driven</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-green-400">{simData.totalTime}</div>
                        <div className="text-xs text-gray-400">Time Driven</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-accent">{simData.bestOverallLap}</div>
                        <div className="text-xs text-gray-400">Best Overall Lap</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-yellow-400">{simData.averageConsistency}%</div>
                        <div className="text-xs text-gray-400">Consistency</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Recent Sessions Widget */}
                    <div className="xl:col-span-2">
                        <RecentSessionsWidget
                            moduleId={moduleId}
                            onAnalyse={(sessionId) => onNavigate("transponder")}
                            onViewAll={() => onNavigate("sessions")}
                        />
                    </div>

                    {/* Performance Summary */}
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Favorite Track</span>
                                    <span className="text-white font-medium">{simData.favoriteTrack}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Favorite Car</span>
                                    <span className="text-white font-medium">{simData.favoriteCar}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Best Track</span>
                                    <span className="text-white font-medium">{simData.bestOverallTrack}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-800 pt-4">
                                <h4 className="text-white font-medium mb-3">Recent Trends</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Improvement Rate:</span>
                                        <span
                                            className={`font-mono ${simData.performanceMetrics.improvementRate.startsWith("+") ? "text-red-400" : "text-green-400"}`}
                                        >
                                            {simData.performanceMetrics.improvementRate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Consistency Trend:</span>
                                        <span className="text-green-400 font-mono">{simData.performanceMetrics.consistencyTrend}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Session Completion:</span>
                                        <span className="text-white font-mono">{simData.performanceMetrics.sessionCompletionRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Valid Lap Rate:</span>
                                        <span className="text-white font-mono">{simData.performanceMetrics.validLapPercentage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Track Records */}
                    <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Personal Best Times</h3>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {simData.trackRecords.map((record, index) => (
                                <div key={index} className="p-4 hover:bg-black/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white truncate">{record.track}</h4>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                                <span>{record.car}</span>
                                                <span>{new Date(record.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="font-mono text-accent font-bold">{record.time}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-800">
                            <button
                                onClick={() => onNavigate("sessions")}
                                className="w-full text-accent hover:text-accent-hover text-sm font-medium transition-colors"
                            >
                                View All Records
                            </button>
                        </div>
                    </div>

                    {/* Car Performance Breakdown */}
                    <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Car Performance</h3>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {simData.carStats.map((car, index) => (
                                <div key={index} className="p-4 hover:bg-black/50 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-white">{car.car}</h4>
                                        <span className="text-sm text-gray-400">{car.sessions} sessions</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <div className="text-xs text-gray-500">Best Lap</div>
                                            <div className="font-mono text-accent">{car.bestLap}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Average</div>
                                            <div className="font-mono text-white">{car.avgLap}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Distance</div>
                                            <div className="font-mono text-blue-400">{car.totalDistance.toFixed(1)} km</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Track Statistics */}
                    <div className="lg:col-span-2 bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Track Statistics</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black">
                                    <tr>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Track</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Sessions</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Best Lap</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Distance</th>
                                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Avg Session</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {simData.trackStats.map((track, index) => (
                                        <tr key={index} className="hover:bg-black/50">
                                            <td className="p-3 font-medium text-white">{track.track}</td>
                                            <td className="p-3 font-mono text-gray-300">{track.sessions}</td>
                                            <td className="p-3 font-mono text-accent">{track.bestLap}</td>
                                            <td className="p-3 font-mono text-blue-400">{track.totalDistance.toFixed(1)} km</td>
                                            <td className="p-3 font-mono text-gray-300">{track.avgSessionLength}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Weather & Conditions */}
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Session Conditions</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Clear Weather</span>
                                    <span className="text-white font-mono">{simData.weatherStats.clearWeather}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-400 h-2 rounded-full"
                                        style={{ width: `${simData.weatherStats.clearWeather}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Overcast</span>
                                    <span className="text-white font-mono">{simData.weatherStats.overcast}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${simData.weatherStats.overcast}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Light Rain</span>
                                    <span className="text-white font-mono">{simData.weatherStats.lightRain}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-400 h-2 rounded-full"
                                        style={{ width: `${simData.weatherStats.lightRain}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-800">
                            <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                            <div className="space-y-2">
                                <button
                                    onClick={() => onNavigate("transponder")}
                                    className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-md py-2 px-3 text-sm font-medium transition-colors"
                                >
                                    Start Live Session
                                </button>
                                <button
                                    onClick={() => onNavigate("sessions")}
                                    className="w-full bg-surface hover:bg-gray-800 text-white border border-gray-800 rounded-md py-2 px-3 text-sm font-medium transition-colors"
                                >
                                    Analyze Sessions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
