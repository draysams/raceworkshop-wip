import { ChevronRight, Car, Calendar } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card"

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
    // Mock recent sessions data
    const recentSessions = [
        {
            id: 1,
            date: "2024-01-15",
            time: "14:30",
            track: "Silverstone GP",
            car: "Porsche 911 GT3 R",
            simulator: "iRacing",
            bestLap: "1:58.342",
            totalLaps: 45,
            duration: "1h 23m",
            status: "completed",
        },
        {
            id: 2,
            date: "2024-01-14",
            time: "19:45",
            track: "Spa-Francorchamps",
            car: "Porsche 911 RSR",
            simulator: "ACC",
            bestLap: "2:17.891",
            totalLaps: 32,
            duration: "1h 15m",
            status: "completed",
        },
        {
            id: 3,
            date: "2024-01-13",
            time: "16:20",
            track: "Nürburgring GP",
            car: "Porsche 911 GT3 Cup",
            simulator: "iRacing",
            bestLap: "1:47.234",
            totalLaps: 38,
            duration: "1h 08m",
            status: "completed",
        },
        {
            id: 4,
            date: "2024-01-12",
            time: "15:15",
            track: "Monza",
            car: "Porsche 911 GT3 R",
            simulator: "ACC",
            bestLap: "1:46.789",
            totalLaps: 28,
            duration: "52m",
            status: "completed",
        },
        {
            id: 5,
            date: "2024-01-11",
            time: "18:30",
            track: "Brands Hatch",
            car: "Porsche 911 RSR",
            simulator: "iRacing",
            bestLap: "1:23.456",
            totalLaps: 41,
            duration: "1h 12m",
            status: "completed",
        },
    ]
export function RecentSessionsWidget({ onAnalyse, onViewAll }: RecentSessionsWidgetProps) {
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
                        {recentSessions.map((session) => (
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
                                                <div className="text-white font-semibold">{session.track}</div>
                                                <div className="text-zinc-400 text-sm flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    {session.date} at {session.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-red-400 font-mono font-bold">{session.bestLap}</div>
                                            <div className="text-zinc-400 text-sm">
                                                {session.totalLaps} laps • {session.duration}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
