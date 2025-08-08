import {
  Car,
  Thermometer,
  Clock,
  Trophy,
  Fuel,
  Activity,
  ChevronDown,
  ChevronRight,
  Calendar,
  Droplets,
  Flag,
  Target,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import { api } from "../../services/api"
import { LapData, SessionSummary } from "../../shared/types"

interface ISessionDetailProps {
    sessionId: number
    onBack: () => void
    onViewTelemetry: (lapNumber: number) => void
}
export function SessionDetail({ sessionId, onBack, onViewTelemetry }: ISessionDetailProps) {
  const [selectedLap, setSelectedLap] = useState<number | null>(null)
  const [expandedStints, setExpandedStints] = useState<number[]>([1])

  const toggleStint = (stintId: number) => {
    setExpandedStints((prev) => (prev.includes(stintId) ? prev.filter((id) => id !== stintId) : [...prev, stintId]))
  }

  // Enhanced session data
  const session = {
    id: sessionId,
    date: "2024-01-15",
    time: "14:30",
    track: "Silverstone GP",
    car: "Porsche 911 GT3 R",
    carClass: "GT3",
    simulator: "iRacing",
    sessionType: "Race",
    ambientTemp: "22°C",
    trackTemp: "28°C",
    rainPercentage: 15,
    bestLap: "1:58.342",
    optimalLap: "1:57.891",
    totalLaps: 67,
    validLaps: 62,
    invalidLaps: 5,
    trackTime: "2h 14m 32s",
    totalFuel: "127.8L",
    avgFuelPerLap: "1.91L",
    numberOfStints: 3,
  }

  // Enhanced stint data with more realistic racing scenarios
  const stints = [
    {
      id: 1,
      name: "Stint 1 - Opening",
      startLap: 1,
      endLap: 23,
      totalLaps: 23,
      validLaps: 22,
      invalidLaps: 1,
      bestLap: "1:58.342",
      avgLap: "2:01.456",
      optimalLap: "1:57.891",
      totalFuel: 45.2,
      avgFuelPerLap: 1.96,
      startFuel: 100,
      endFuel: 54.8,
      tyreDegradation: "Medium",
      trackEvolution: "+2.3s",
      weather: "Dry",
      incidents: 1,
      laps: [
        {
          lap: 1,
          time: "2:15.234",
          sector1: "0:32.123",
          sector2: "0:51.234",
          sector3: "0:51.877",
          fuel: 2.1,
          tireTemp: 95,
          valid: true,
          position: 12,
        },
        {
          lap: 2,
          time: "2:02.156",
          sector1: "0:30.456",
          sector2: "0:49.123",
          sector3: "0:42.577",
          fuel: 1.9,
          tireTemp: 98,
          valid: true,
          position: 11,
        },
        {
          lap: 3,
          time: "1:58.342",
          sector1: "0:29.234",
          sector2: "0:47.891",
          sector3: "0:41.217",
          fuel: 1.8,
          tireTemp: 102,
          valid: true,
          position: 9,
        },
        {
          lap: 4,
          time: "2:01.789",
          sector1: "0:30.123",
          sector2: "0:48.456",
          sector3: "0:43.210",
          fuel: 1.9,
          tireTemp: 105,
          valid: true,
          position: 9,
        },
        {
          lap: 5,
          time: "2:05.432",
          sector1: "0:31.567",
          sector2: "0:50.234",
          sector3: "0:43.631",
          fuel: 2.0,
          tireTemp: 108,
          valid: false,
          position: 10,
        },
        // Add more laps for demonstration
        ...Array.from({ length: 18 }, (_, i) => ({
          lap: i + 6,
          time: `2:0${Math.floor(Math.random() * 6) + 1}.${Math.floor(Math.random() * 900) + 100}`,
          sector1: `0:${Math.floor(Math.random() * 5) + 29}.${Math.floor(Math.random() * 900) + 100}`,
          sector2: `0:${Math.floor(Math.random() * 5) + 47}.${Math.floor(Math.random() * 900) + 100}`,
          sector3: `0:${Math.floor(Math.random() * 5) + 41}.${Math.floor(Math.random() * 900) + 100}`,
          fuel: Math.round((1.8 + Math.random() * 0.4) * 10) / 10,
          tireTemp: Math.floor(Math.random() * 20) + 95,
          valid: Math.random() > 0.1,
          position: Math.floor(Math.random() * 3) + 8,
        })),
      ],
    },
    {
      id: 2,
      name: "Stint 2 - Mid Race",
      startLap: 24,
      endLap: 45,
      totalLaps: 22,
      validLaps: 21,
      invalidLaps: 1,
      bestLap: "1:59.123",
      avgLap: "2:00.234",
      optimalLap: "1:58.456",
      totalFuel: 42.8,
      avgFuelPerLap: 1.95,
      startFuel: 100,
      endFuel: 57.2,
      tyreDegradation: "High",
      trackEvolution: "+1.1s",
      weather: "Light Rain",
      incidents: 0,
      laps: [
        {
          lap: 24,
          time: "1:59.123",
          sector1: "0:29.456",
          sector2: "0:48.234",
          sector3: "0:41.433",
          fuel: 1.9,
          tireTemp: 89,
          valid: true,
          position: 6,
        },
        ...Array.from({ length: 21 }, (_, i) => ({
          lap: i + 25,
          time: `2:0${Math.floor(Math.random() * 3) + 0}.${Math.floor(Math.random() * 900) + 200}`,
          sector1: `0:${Math.floor(Math.random() * 3) + 29}.${Math.floor(Math.random() * 900) + 100}`,
          sector2: `0:${Math.floor(Math.random() * 3) + 48}.${Math.floor(Math.random() * 900) + 100}`,
          sector3: `0:${Math.floor(Math.random() * 3) + 42}.${Math.floor(Math.random() * 900) + 100}`,
          fuel: Math.round((1.8 + Math.random() * 0.3) * 10) / 10,
          tireTemp: Math.floor(Math.random() * 15) + 100,
          valid: Math.random() > 0.05,
          position: Math.floor(Math.random() * 2) + 6,
        })),
      ],
    },
    {
      id: 3,
      name: "Stint 3 - Final Push",
      startLap: 46,
      endLap: 67,
      totalLaps: 22,
      validLaps: 19,
      invalidLaps: 3,
      bestLap: "2:00.891",
      avgLap: "2:02.567",
      optimalLap: "1:59.234",
      totalFuel: 39.8,
      avgFuelPerLap: 1.81,
      startFuel: 100,
      endFuel: 60.2,
      tyreDegradation: "Very High",
      trackEvolution: "-0.8s",
      weather: "Drying",
      incidents: 2,
      laps: [
        {
          lap: 46,
          time: "2:00.891",
          sector1: "0:30.234",
          sector2: "0:49.123",
          sector3: "0:41.534",
          fuel: 1.7,
          tireTemp: 95,
          valid: true,
          position: 5,
        },
        ...Array.from({ length: 21 }, (_, i) => ({
          lap: i + 47,
          time: `2:0${Math.floor(Math.random() * 4) + 1}.${Math.floor(Math.random() * 900) + 100}`,
          sector1: `0:${Math.floor(Math.random() * 4) + 30}.${Math.floor(Math.random() * 900) + 100}`,
          sector2: `0:${Math.floor(Math.random() * 4) + 49}.${Math.floor(Math.random() * 900) + 100}`,
          sector3: `0:${Math.floor(Math.random() * 4) + 42}.${Math.floor(Math.random() * 900) + 100}`,
          fuel: Math.round((1.7 + Math.random() * 0.3) * 10) / 10,
          tireTemp: Math.floor(Math.random() * 25) + 95,
          valid: Math.random() > 0.15,
          position: Math.floor(Math.random() * 3) + 5,
        })),
      ],
    },
  ]

  const getTrendIcon = (current: string, previous: string) => {
    const currentTime = Number.parseFloat(current.replace(/[^\d.]/g, ""))
    const previousTime = Number.parseFloat(previous.replace(/[^\d.]/g, ""))

    if (currentTime < previousTime) return <TrendingUp className="w-3 h-3 text-green-500" />
    if (currentTime > previousTime) return <TrendingDown className="w-3 h-3 text-red-500" />
    return <Minus className="w-3 h-3 text-zinc-500" />
  }

  const getWeatherIcon = (weather: string) => {
    if (weather.includes("Rain")) return <Droplets className="w-3 h-3 text-blue-400" />
    return <div className="w-3 h-3 rounded-full bg-yellow-400" />
  }

  interface SessionDetailProps {
    sessionId: number
    onBack: () => void
}



  const [sessionData, setSessionData] = useState<{ session: SessionSummary; laps: LapData[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSelectedLap, setApiSelectedLap] = useState<LapData | null>(null);

  const [activeTab, setActiveTab] = useState<"timing" | "telemetry">("timing");
  
  useEffect(() => {
    if (!sessionId) return;
    setIsLoading(true);
    setError(null);

  api.sessions.getSessionDetail(sessionId)
  .then(data => {
      if (data) {
          setSessionData(data);
          console.log(data);
          const bestValidLap = data.laps.filter(l => l.isValid && l.lapTimeMs > 0).sort((a, b) => a.lapTimeMs - b.lapTimeMs)[0];
          setApiSelectedLap(bestValidLap || data.laps[0] || null);
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



//   if (isLoading) return <div className="p-6 text-center text-gray-400">Loading session details...</div>;
  if (!session) return <div className="p-6 text-center"><p className="text-red-400">{"Session not found."}</p><button onClick={onBack} className="mt-4 text-sm text-accent hover:underline">Back to History</button></div>;

  return (
    <FeatureLayout header={<FeatureNavigation />}>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-6 flex flex-col">
          {/* Enhanced Session Header */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-6 flex-shrink-0">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <CardTitle className="text-3xl text-white mb-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-red-500" />
                      </div>
                      {session.track} - {session.sessionType}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {session.date} at {session.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>{session.car}</span>
                      </div>
                      <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                        {session.carClass}
                      </Badge>
                      <Badge variant="secondary">{session.simulator}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="border-zinc-600 bg-transparent">
                      <a onClick={() => onViewTelemetry(3)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Race Engineer
                      </a>
                    </Button>
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <a onClick={() => onViewTelemetry(3)}>
                        <Activity className="w-4 h-4 mr-2" />
                        Analyze Best Lap
                      </a>
                    </Button>
                  </div>

                  {/* Weather & Conditions moved here */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-orange-500" />
                      <span className="text-zinc-300">{session.ambientTemp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-red-500" />
                      <span className="text-zinc-300">{session.trackTemp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="text-zinc-300">{session.rainPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Enhanced Analytics Grid - Reduced Height */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-4 flex-shrink-0">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-600/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-white font-mono text-base">{session.bestLap}</div>
                    <div className="text-zinc-400 text-xs">Best Lap</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600/10 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-white font-mono text-base">{session.optimalLap}</div>
                    <div className="text-zinc-400 text-xs">Optimal Lap</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
                    <Flag className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.totalLaps}</div>
                    <div className="text-zinc-400 text-xs">Total Laps</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.trackTime}</div>
                    <div className="text-zinc-400 text-xs">Track Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.validLaps}</div>
                    <div className="text-zinc-400 text-xs">Valid Laps</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600/10 rounded-lg flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.invalidLaps}</div>
                    <div className="text-zinc-400 text-xs">Invalid Laps</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-600/10 rounded-lg flex items-center justify-center">
                    <Fuel className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.totalFuel}L</div>
                    <div className="text-zinc-400 text-xs">Total Fuel</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-cyan-600/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div>
                    <div className="text-white text-base font-semibold">{session.numberOfStints}</div>
                    <div className="text-zinc-400 text-xs">Stints</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stint Analysis - Scrollable */}
          <Card className="bg-zinc-900/50 border-zinc-800 flex-1 min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-white text-xl">Stint Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-2">
                {stints.map((stint) => (
                  <Collapsible
                    key={stint.id}
                    open={expandedStints.includes(stint.id)}
                    onOpenChange={() => toggleStint(stint.id)}
                  >
                    <Card className="border border-zinc-700 overflow-hidden">
                      {/* Stint Header - Reduced Height */}
                      <CollapsibleTrigger asChild>
                        <div className="px-4 py-2 cursor-pointer transition-colors hover:bg-zinc-800/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedStints.includes(stint.id) ? (
                                <ChevronDown className="w-4 h-4 text-zinc-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                              )}
                              <div>
                                <h3 className="text-white font-semibold text-base">{stint.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                  <span>
                                    Laps {stint.startLap}-{stint.endLap}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {getWeatherIcon(stint.weather)}
                                    <span>{stint.weather}</span>
                                  </div>
                                  {stint.incidents > 0 && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                      {stint.incidents} incident{stint.incidents > 1 ? "s" : ""}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Stint Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                              <div className="text-center">
                                <div className="text-white font-semibold">{stint.totalLaps}</div>
                                <div className="text-zinc-500 text-xs">Total Laps</div>
                              </div>
                              <div className="text-center">
                                <div className="text-purple-400 font-mono font-semibold flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  {stint.bestLap}
                                </div>
                                <div className="text-zinc-500 text-xs">Best Lap</div>
                              </div>
                              <div className="text-center">
                                <div className="text-blue-400 font-mono">{stint.avgLap}</div>
                                <div className="text-zinc-500 text-xs">Avg Lap</div>
                              </div>
                              <div className="text-center">
                                <div className="text-green-400 font-mono">{stint.optimalLap}</div>
                                <div className="text-zinc-500 text-xs">Optimal</div>
                              </div>
                              <div className="text-center">
                                <div className="text-orange-400">{stint.totalFuel}L</div>
                                <div className="text-zinc-500 text-xs">Fuel Used</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="text-green-400">{stint.validLaps}</span>
                                  <span className="text-zinc-500">/</span>
                                  <span className="text-red-400">{stint.invalidLaps}</span>
                                </div>
                                <div className="text-zinc-500 text-xs">Valid/Invalid</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Expanded Stint Details */}
                      <CollapsibleContent>
                        <div className="border-t border-zinc-700">
                          {/* Stint Details Header */}
                          <div className="p-4 bg-zinc-800/30">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                              <div>
                                <div className="text-zinc-400 mb-1">Fuel Management</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Per Lap:</span>
                                    <span className="text-orange-400 font-mono">{stint.avgFuelPerLap}L</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Start:</span>
                                    <span className="text-green-400">{stint.startFuel}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">End:</span>
                                    <span className="text-yellow-400">{stint.endFuel}%</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-zinc-400 mb-1">Performance</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Tyre Deg:</span>
                                    <span
                                      className={`${
                                        stint.tyreDegradation === "Low"
                                          ? "text-green-400"
                                          : stint.tyreDegradation === "Medium"
                                            ? "text-yellow-400"
                                            : stint.tyreDegradation === "High"
                                              ? "text-orange-400"
                                              : "text-red-400"
                                      }`}
                                    >
                                      {stint.tyreDegradation}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Track Evo:</span>
                                    <span
                                      className={
                                        stint.trackEvolution.startsWith("+") ? "text-red-400" : "text-green-400"
                                      }
                                    >
                                      {stint.trackEvolution}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-zinc-400 mb-1">Consistency</div>
                                <div className="space-y-1">
                                  <Progress value={(stint.validLaps / stint.totalLaps) * 100} className="h-2" />
                                  <div className="text-xs text-zinc-500">
                                    {Math.round((stint.validLaps / stint.totalLaps) * 100)}% valid laps
                                  </div>
                                </div>
                              </div>

                              <div>
                                <div className="text-zinc-400 mb-1">Gap to Optimal</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Best:</span>
                                    <span className="text-purple-400 font-mono">
                                      +
                                      {(
                                        Number.parseFloat(stint.bestLap.replace(/[^\d.]/g, "")) -
                                        Number.parseFloat(stint.optimalLap.replace(/[^\d.]/g, ""))
                                      ).toFixed(3)}
                                      s
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-300">Avg:</span>
                                    <span className="text-blue-400 font-mono">
                                      +
                                      {(
                                        Number.parseFloat(stint.avgLap.replace(/[^\d.]/g, "")) -
                                        Number.parseFloat(stint.optimalLap.replace(/[^\d.]/g, ""))
                                      ).toFixed(3)}
                                      s
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Lap List */}
                          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                            <div className="text-sm font-medium text-zinc-300 mb-3">Lap Details</div>
                            {stint.laps.map((lap) => (
                              <div
                                key={lap.lap}
                                className={`p-3 rounded-lg border transition-all duration-200 ${
                                  lap.time === stint.bestLap
                                    ? "bg-purple-600/10 border-purple-600/30"
                                    : "bg-zinc-800/30 border-zinc-700 hover:border-zinc-600"
                                }`}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-9 gap-4 items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-zinc-400">L{lap.lap}</span>
                                    {lap.time === stint.bestLap && (
                                      <Badge variant="default" className="bg-purple-600 text-xs px-1 py-0">
                                        BEST
                                      </Badge>
                                    )}
                                  </div>

                                  <div>
                                    <div
                                      className={`font-mono ${lap.time === stint.bestLap ? "text-purple-400 font-bold" : "text-white"}`}
                                    >
                                      {lap.time}
                                    </div>
                                    <div className="text-xs text-zinc-500">Lap Time</div>
                                  </div>

                                  <div>
                                    <div className="text-zinc-300 font-mono text-xs">{lap.sector1}</div>
                                    <div className="text-zinc-500 text-xs">S1</div>
                                  </div>

                                  <div>
                                    <div className="text-zinc-300 font-mono text-xs">{lap.sector2}</div>
                                    <div className="text-zinc-500 text-xs">S2</div>
                                  </div>

                                  <div>
                                    <div className="text-zinc-300 font-mono text-xs">{lap.sector3}</div>
                                    <div className="text-zinc-500 text-xs">S3</div>
                                  </div>

                                  <div>
                                    <div className="text-orange-400 text-xs">{lap.fuel}L</div>
                                    <div className="text-zinc-500 text-xs">Fuel</div>
                                  </div>

                                  <div>
                                    <div className="text-red-400 text-xs">{lap.tireTemp}°C</div>
                                    <div className="text-zinc-500 text-xs">Tyre</div>
                                  </div>

                                  <div className="text-center">
                                    <div className="text-blue-400 text-xs">P{lap.position}</div>
                                    <div className="text-zinc-500 text-xs">Pos</div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    {/* Valid/Invalid Dot */}
                                    <div
                                      className={`w-2 h-2 rounded-full ${lap.valid ? "bg-green-500" : "bg-red-500"}`}
                                      title={lap.valid ? "Valid lap" : "Invalid lap"}
                                    />

                                    {/* Analyze Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-zinc-600 text-zinc-300 hover:text-white bg-transparent text-xs px-2 py-1 h-6 ml-auto"
                                      asChild
                                    >
                                      <a onClick={() => onViewTelemetry(lap.lap)}>
                                        Analyze
                                      </a>
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureLayout>
  )
}
