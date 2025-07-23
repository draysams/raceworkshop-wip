"use client"

import { features } from "../../../features.config"

interface GlobalDashboardProps {
    onModuleSelect: (moduleId: string) => void
    onNavigateToSessions: (moduleId: string) => void
}

// Mock global data - in real app this would come from aggregated database queries
const mockGlobalData = {
    totalSessions: 127,
    totalLaps: 3842,
    totalDriveTime: "156h 23m",
    recentSessions: [
        {
            id: 1,
            simulator: "lmu",
            track: "Circuit de la Sarthe",
            car: "Porsche 963",
            bestLap: "3:28.456",
            date: "2024-01-15",
            sessionType: "Practice",
        },
        {
            id: 2,
            simulator: "acc",
            track: "Silverstone GP",
            car: "BMW M4 GT3",
            bestLap: "1:58.234",
            date: "2024-01-14",
            sessionType: "Race",
        },
        {
            id: 3,
            simulator: "lmu",
            track: "Spa-Francorchamps",
            car: "Ferrari 499P",
            bestLap: "2:03.789",
            date: "2024-01-13",
            sessionType: "Qualifying",
        },
    ],
    favoritesBySimulator: {
        lmu: {
            track: "Circuit de la Sarthe",
            car: "Porsche 963",
            sessions: 45,
            bestLap: "3:26.123",
        },
        acc: {
            track: "Spa-Francorchamps",
            car: "BMW M4 GT3",
            sessions: 38,
            bestLap: "2:16.891",
        },
    },
    bestTimes: [
        {
            simulator: "acc",
            track: "Silverstone GP",
            car: "McLaren 720S GT3",
            time: "1:57.234",
            date: "2024-01-10",
        },
        {
            simulator: "lmu",
            track: "Circuit de la Sarthe",
            car: "Porsche 963",
            time: "3:26.123",
            date: "2024-01-08",
        },
        {
            simulator: "acc",
            track: "Spa-Francorchamps",
            car: "BMW M4 GT3",
            time: "2:16.891",
            date: "2024-01-05",
        },
    ],
    achievements: [
        { title: "Century Club", description: "Complete 100 sessions", progress: 100, unlocked: true },
        { title: "Speed Demon", description: "Achieve sub-2:00 lap at Silverstone", progress: 100, unlocked: true },
        { title: "Endurance Master", description: "Complete 50 laps in a single session", progress: 85, unlocked: false },
        { title: "Multi-Class Hero", description: "Drive 10 different car classes", progress: 60, unlocked: false },
    ],
}

export function GlobalDashboard({ onModuleSelect, onNavigateToSessions }: GlobalDashboardProps) {
    const enabledSimulators = Object.entries(features).filter(([, config]) => config.enabled)

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back to RaceWorkshop</h1>
                    <p className="text-gray-400">Here's your racing activity across all simulators</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Total Sessions</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{mockGlobalData.totalSessions}</div>
                        <p className="text-gray-400 text-sm">Across all simulators</p>
                    </div>

                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Drive Time</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{mockGlobalData.totalDriveTime}</div>
                        <p className="text-gray-400 text-sm">Time behind the wheel</p>
                    </div>

                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Total Laps</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{mockGlobalData.totalLaps.toLocaleString()}</div>
                        <p className="text-gray-400 text-sm">Laps completed</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Recent Activity */}
                    <div className="xl:col-span-2 bg-surface border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-800">
                            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-gray-800">
                            {mockGlobalData.recentSessions.map((session) => {
                                const simConfig = features[session.simulator]
                                return (
                                    <div key={session.id} className="p-6 hover:bg-black/50 transition-colors cursor-pointer group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl">{simConfig.icon}</div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="font-medium text-white">{session.track}</h4>
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
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span>{session.car}</span>
                                                        <span>{simConfig.name}</span>
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
                                )
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
                                        <div className="text-white font-medium group-hover:text-accent transition-colors">
                                            {config.name}
                                        </div>
                                        <div className="text-gray-400 text-xs">
                                            {mockGlobalData.favoritesBySimulator[moduleId as keyof typeof mockGlobalData.favoritesBySimulator]
                                                ?.sessions || 0}{" "}
                                            sessions
                                        </div>
                                    </div>
                                    <svg
                                        className="w-4 h-4 text-gray-400 group-hover:text-accent transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Favorites by Simulator */}
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Favorite Combos</h3>
                        <div className="space-y-4">
                            {Object.entries(mockGlobalData.favoritesBySimulator).map(([simId, data]) => {
                                const simConfig = features[simId]
                                return (
                                    <div key={simId} className="bg-black border border-gray-800 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-lg">{simConfig.icon}</span>
                                            <span className="text-white font-medium">{simConfig.name}</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Favorite Track:</span>
                                                <span className="text-white">{data.track}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Favorite Car:</span>
                                                <span className="text-white">{data.car}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Best Time:</span>
                                                <span className="text-green-400 font-mono">{data.bestLap}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Sessions:</span>
                                                <span className="text-white">{data.sessions}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Personal Best Times */}
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Personal Best Times</h3>
                        <div className="space-y-3">
                            {mockGlobalData.bestTimes.map((record, index) => {
                                const simConfig = features[record.simulator]
                                return (
                                    <div key={index} className="bg-black border border-gray-800 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{simConfig.icon}</span>
                                                <span className="text-white font-medium">{record.track}</span>
                                            </div>
                                            <span className="text-green-400 font-mono font-bold">{record.time}</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-400">
                                            <span>{record.car}</span>
                                            <span>{new Date(record.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-surface border border-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mockGlobalData.achievements.map((achievement, index) => (
                            <div
                                key={index}
                                className={`bg-black border rounded-lg p-4 ${achievement.unlocked ? "border-accent" : "border-gray-800"}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.unlocked ? "bg-accent text-white" : "bg-gray-700 text-gray-400"}`}
                                    >
                                        {achievement.unlocked ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium truncate ${achievement.unlocked ? "text-white" : "text-gray-400"}`}>
                                            {achievement.title}
                                        </h4>
                                    </div>
                                </div>
                                <p className="text-gray-400 text-xs mb-3">{achievement.description}</p>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${achievement.unlocked ? "bg-accent" : "bg-gray-600"}`}
                                        style={{ width: `${achievement.progress}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{achievement.progress}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
