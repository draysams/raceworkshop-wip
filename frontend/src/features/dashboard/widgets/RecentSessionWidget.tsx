"use client"

export interface SessionSummary {
    id: number
    track: string
    car: string
    bestLap: string | null
    laps: number
    date: string
    sessionType: string
}

interface RecentSessionsWidgetProps {
    moduleId: string
    onAnalyse: (sessionId: number) => void
    onViewAll?: () => void
}

// Mock data - in real app this would come from IPC
const mockSessions: SessionSummary[] = [
    {
        id: 1,
        track: "Circuit de la Sarthe",
        car: "Porsche 963",
        bestLap: "3:28.456",
        laps: 12,
        date: "2024-01-15",
        sessionType: "Practice",
    },
    {
        id: 2,
        track: "Silverstone GP",
        car: "BMW M4 GT3",
        bestLap: "1:58.234",
        laps: 24,
        date: "2024-01-14",
        sessionType: "Race",
    },
    {
        id: 3,
        track: "Spa-Francorchamps",
        car: "Ferrari 499P",
        bestLap: "2:03.789",
        laps: 18,
        date: "2024-01-13",
        sessionType: "Qualifying",
    },
]

export function RecentSessionsWidget({ moduleId, onAnalyse, onViewAll }: RecentSessionsWidgetProps) {
    return (
        <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
                    <button onClick={onViewAll} className="text-sm text-accent hover:text-accent-hover transition-colors">
                        View All
                    </button>
                </div>
            </div>

            <div className="divide-y divide-gray-800">
                {mockSessions.map((session) => (
                    <div key={session.id} className="p-6 group hover:bg-secondary/50 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center justify-between">
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

                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                    <span>{session.car}</span>
                                    <span className="font-mono">{session.laps} laps</span>
                                    <span>{new Date(session.date).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 ml-4">
                                {session.bestLap && (
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Best Lap</div>
                                        <div className="font-mono text-green-400 font-medium">{session.bestLap}</div>
                                    </div>
                                )}

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAnalyse(session.id)
                                    }}
                                    className="
                    px-4 py-2 bg-accent/10 hover:bg-accent text-accent hover:text-white 
                    border border-accent/30 hover:border-accent rounded-md text-sm font-medium
                    transition-all duration-200 opacity-0 group-hover:opacity-100
                    transform translate-x-2 group-hover:translate-x-0
                  "
                                >
                                    Analyse
                                </button>
                            </div>
                        </div>

                        {/* Subtle gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    </div>
                ))}
            </div>

            {mockSessions.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h4 className="text-white font-medium mb-2">No sessions yet</h4>
                    <p className="text-gray-400 text-sm">Start a session in your simulator to see data here</p>
                </div>
            )}
        </div>
    )
}
