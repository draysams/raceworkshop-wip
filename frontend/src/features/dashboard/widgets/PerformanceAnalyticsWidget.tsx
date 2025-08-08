import { Timer, Activity, Palette, Users, Target, BarChart3, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, Flag, Fuel, Gauge, Minus, Route, Thermometer, Trophy, Zap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import type { ModuleDashboardStats } from "../../../shared/types";

interface PerformanceAnalyticsWidgetProps {
    stats: ModuleDashboardStats | null;
}

export function PerformanceAnalyticsWidget({ stats }: PerformanceAnalyticsWidgetProps) {

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up":
                return <ArrowUp className="w-3 h-3 text-green-500" />
            case "down":
                return <ArrowDown className="w-3 h-3 text-red-500" />
            default:
                return <Minus className="w-3 h-3 text-zinc-500" />
        }
    }

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case "up":
                return "text-green-400"
            case "down":
                return "text-red-400"
            default:
                return "text-zinc-400"
        }
    }

    // Analytics data - use real data where available, show "---" for missing data
    const analytics = [
        {
            title: "Total Sessions",
            value: stats?.totalSessions?.toString() || "---",
            change: stats ? "Total" : "---",
            period: stats ? "sessions" : "---",
            trend: "neutral" as const,
            icon: Calendar,
            color: "text-blue-400",
            bgColor: "bg-blue-600/10",
        },
        {
            title: "Total Laps",
            value: stats?.totalLaps?.toString() || "---",
            change: stats ? "Total" : "---",
            period: stats ? "laps" : "---",
            trend: "neutral" as const,
            icon: Flag,
            color: "text-green-400",
            bgColor: "bg-green-600/10",
        },
        {
            title: "Track Time",
            value: stats?.totalDriveTime || "---",
            change: stats ? "Total" : "---",
            period: stats ? "drive time" : "---",
            trend: "neutral" as const,
            icon: Clock,
            color: "text-purple-400",
            bgColor: "bg-purple-600/10",
        },
        {
            title: "Best Lap Overall",
            value: stats?.recentSessions?.[0]?.bestLap || "---",
            change: stats ? "Latest" : "---",
            period: stats ? "session" : "---",
            trend: "neutral" as const,
            icon: Trophy,
            color: "text-yellow-400",
            bgColor: "bg-yellow-600/10",
        },
        {
            title: "Average Lap Time",
            value: stats?.recentSessions?.[0]?.averageLap || "---",
            change: stats ? "Latest" : "---",
            period: stats ? "session" : "---",
            trend: "neutral" as const,
            icon: Timer,
            color: "text-red-400",
            bgColor: "bg-red-600/10",
        },
        {
            title: "Distance Covered",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Route,
            color: "text-cyan-400",
            bgColor: "bg-cyan-600/10",
        },
        {
            title: "Session Completion",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: CheckCircle,
            color: "text-emerald-400",
            bgColor: "bg-emerald-600/10",
        },
        {
            title: "Fuel Efficiency",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Fuel,
            color: "text-orange-400",
            bgColor: "bg-orange-600/10",
        },
        {
            title: "Consistency Rating",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Target,
            color: "text-indigo-400",
            bgColor: "bg-indigo-600/10",
        },
        {
            title: "Top Speed",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Gauge,
            color: "text-pink-400",
            bgColor: "bg-pink-600/10",
        },
        {
            title: "Tire Management",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Thermometer,
            color: "text-amber-400",
            bgColor: "bg-amber-600/10",
        },
        {
            title: "Active Streak",
            value: "---",
            change: "---",
            period: "---",
            trend: "neutral" as const,
            icon: Zap,
            color: "text-violet-400",
            bgColor: "bg-violet-600/10",
        },
    ]

    return (
        <div className="flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                <Button variant="outline" className="border-zinc-600 bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Detailed Report
                </Button>
            </div>

            {/* Analytics Grid - Responsive and fits in viewport */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-3">
                {analytics.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                        <Card
                            key={index}
                            className="bg-zinc-900/50 border-zinc-800 hover:border-red-800/30 transition-all duration-300"
                        >
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 ${metric.bgColor} rounded-md flex items-center justify-center`}>
                                        <Icon className={`w-3 h-3 ${metric.color}`} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-zinc-400 text-xs font-medium leading-tight">{metric.title}</div>
                                    <div className="text-white text-lg font-bold">{metric.value}</div>
                                    <div className="flex items-center gap-1">
                                        {getTrendIcon(metric.trend)}
                                        <span className={`text-xs ${getTrendColor(metric.trend)} leading-tight`}>
                                            {metric.change} {metric.period}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
