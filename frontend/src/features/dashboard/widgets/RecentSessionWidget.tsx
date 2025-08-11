import { ChevronRight, Car, Calendar } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card"
import type { SessionSummary } from "../../../shared/types"

interface RecentSessionsWidgetProps {
    moduleId: string
    sessions: SessionSummary[]
    onAnalyse: (sessionId: number) => void
    onViewAll?: () => void
}

export function RecentSessionsWidget({ sessions, onAnalyse, onViewAll }: RecentSessionsWidgetProps) {
    return (
        <div className="lg:col-span-2 min-h-0">
            <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col">
                <CardHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-xl">Recent Sessions</CardTitle>
                    <Button variant="outline" onClick={onViewAll} asChild className="border-zinc-600 bg-transparent">
                        <a>
                            View All Sessions
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </a>
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <div className="space-y-3 pr-2">
                        {sessions.length === 0 ? (
                            <div className="text-center py-8 text-zinc-400">
                                <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No sessions found</p>
                                <p className="text-sm">Start a session to see your data here</p>
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-red-800/50 transition-all duration-300 cursor-pointer group"
                                >
                                    <a onClick={(e) => {
                                            e.stopPropagation()
                                            onAnalyse(session.id)
                                        }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                                                    <Car className="w-5 h-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold">{session.track.displayName}</div>
                                                    <div className="text-zinc-400 text-sm flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString()}
                                                    </div>
                                                    {session.car && (
                                                        <div className="text-zinc-500 text-xs mt-1">
                                                            {session.car.displayName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-red-400 font-mono font-bold">{session.bestLap || '--:--.---'}</div>
                                                <div className="text-zinc-400 text-sm">
                                                    {session.totalLaps} laps • {session.duration}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
