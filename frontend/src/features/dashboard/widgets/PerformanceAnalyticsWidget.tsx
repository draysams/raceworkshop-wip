import { Timer, Activity, Palette, Users, Target, BarChart3, ArrowDown, ArrowUp, Calendar, CheckCircle, Clock, Flag, Fuel, Gauge, Minus, Route, Thermometer, Trophy, Zap } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";


export function PerformanceAnalyticsWidget() {

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

    // Comprehensive analytics data
    const analytics = [
        {
            title: "Total Sessions",
            value: "62",
            change: "+12",
            period: "from last month",
            trend: "up",
            icon: Calendar,
            color: "text-blue-400",
            bgColor: "bg-blue-600/10",
        },
        {
            title: "Total Laps",
            value: "1,247",
            change: "+89",
            period: "from last week",
            trend: "up",
            icon: Flag,
            color: "text-green-400",
            bgColor: "bg-green-600/10",
        },
        {
            title: "Track Time",
            value: "47.2h",
            change: "This month",
            period: "",
            trend: "neutral",
            icon: Clock,
            color: "text-purple-400",
            bgColor: "bg-purple-600/10",
        },
        {
            title: "Best Lap Overall",
            value: "1:47.234",
            change: "-0.8s",
            period: "personal best",
            trend: "up",
            icon: Trophy,
            color: "text-yellow-400",
            bgColor: "bg-yellow-600/10",
        },
        {
            title: "Average Lap Time",
            value: "2:03.456",
            change: "-1.2s",
            period: "vs last month",
            trend: "up",
            icon: Timer,
            color: "text-red-400",
            bgColor: "bg-red-600/10",
        },
        {
            title: "Distance Covered",
            value: "8,432 km",
            change: "+1,234 km",
            period: "this month",
            trend: "up",
            icon: Route,
            color: "text-cyan-400",
            bgColor: "bg-cyan-600/10",
        },
        {
            title: "Session Completion",
            value: "94.2%",
            change: "+2.1%",
            period: "completion rate",
            trend: "up",
            icon: CheckCircle,
            color: "text-emerald-400",
            bgColor: "bg-emerald-600/10",
        },
        {
            title: "Fuel Efficiency",
            value: "1.89L",
            change: "-0.12L",
            period: "avg per lap",
            trend: "up",
            icon: Fuel,
            color: "text-orange-400",
            bgColor: "bg-orange-600/10",
        },
        {
            title: "Consistency Rating",
            value: "87.3%",
            change: "+4.2%",
            period: "lap time variance",
            trend: "up",
            icon: Target,
            color: "text-indigo-400",
            bgColor: "bg-indigo-600/10",
        },
        {
            title: "Top Speed",
            value: "312 km/h",
            change: "+8 km/h",
            period: "session record",
            trend: "up",
            icon: Gauge,
            color: "text-pink-400",
            bgColor: "bg-pink-600/10",
        },
        {
            title: "Tire Management",
            value: "92.1°C",
            change: "-3.4°C",
            period: "avg temp",
            trend: "up",
            icon: Thermometer,
            color: "text-amber-400",
            bgColor: "bg-amber-600/10",
        },
        {
            title: "Active Streak",
            value: "12 days",
            change: "Current",
            period: "racing streak",
            trend: "neutral",
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
