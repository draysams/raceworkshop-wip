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
import { LapData, SessionDetail } from "../../shared/types"

interface ISessionDetailProps {
    sessionId: number
    onBack: () => void
    onViewTelemetry: (lapId: number, sessionData: SessionDetail) => void
}

export function SessionDetailView({ sessionId, onBack, onViewTelemetry }: ISessionDetailProps) {
  const [selectedLap, setSelectedLap] = useState<number | null>(null)
  const [expandedStints, setExpandedStints] = useState<number[]>([1])

  const toggleStint = (stintId: number) => {
    setExpandedStints((prev) => (prev.includes(stintId) ? prev.filter((id) => id !== stintId) : [...prev, stintId]))
  }

  const [sessionData, setSessionData] = useState<SessionDetail | null>(null);
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

  // Helper function to format date and time from ISO string
  const formatSessionDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Helper function to calculate invalid laps
  const getInvalidLaps = (totalLaps: number, validLaps: number) => {
    return Math.max(0, totalLaps - validLaps);
  };

  if (isLoading) return (
    <FeatureLayout header={<FeatureNavigation />}>
      <div className="p-6 text-center text-gray-400">Loading session details...</div>
    </FeatureLayout>
  );

  if (error || !sessionData) return (
    <FeatureLayout header={<FeatureNavigation />}>
      <div className="p-6 text-center">
        <p className="text-red-400">{error || "Session not found."}</p>
        <button onClick={onBack} className="mt-4 text-sm text-accent hover:underline">Back to History</button>
      </div>
    </FeatureLayout>
  );

  const session = sessionData;
  const laps = sessionData.laps;
  const { date, time } = formatSessionDateTime(session.date);
  const invalidLaps = getInvalidLaps(session.totalLaps, session.validLaps);

  // Use the stints from the DTO instead of creating them from laps
  const stints = session.stints || [];

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
                      {session.track?.displayName || "---"} - {session.sessionType || "---"}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {date} at {time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        <span>{session.car?.displayName || "---"}</span>
                      </div>
                      <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                        {session.car?.class || "---"}
                      </Badge>
                      <Badge variant="secondary">{session.simulator || "---"}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild variant="outline" className="border-zinc-600 bg-transparent">
                      <a onClick={() => onViewTelemetry(3, sessionData)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Race Engineer
                      </a>
                    </Button>
                    <Button asChild className="bg-red-600 hover:bg-red-700">
                      <a onClick={() => onViewTelemetry(3, sessionData)}>
                        <Activity className="w-4 h-4 mr-2" />
                        Analyze Best Lap
                      </a>
                    </Button>
                  </div>

                  {/* Weather & Conditions moved here */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-orange-500" />
                      <span className="text-zinc-300">{session.airTemp ? `${session.airTemp}°C` : "---"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-red-500" />
                      <span className="text-zinc-300">{session.trackTemp ? `${session.trackTemp}°C` : "---"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="text-zinc-300">{session.weather || "---"}</span>
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
                    <div className="text-white font-mono text-base">{session.bestLap || "---"}</div>
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
                    <div className="text-white font-mono text-base">{session.analytics?.optimalLap || "---"}</div>
                    <div className="text-zinc-400 text-xs">Optimal Lap</div>
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
                    <div className="text-white text-base font-semibold">{session.duration || "---"}</div>
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
                    <div className="text-white text-base font-semibold">{session.validLaps || "---"}</div>
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
                    <div className="text-white text-base font-semibold">{invalidLaps || "---"}</div>
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
                    <div className="text-white text-base font-semibold">{session.analytics?.fuelUsed?.toFixed(1) || "---"}</div>
                    <div className="text-zinc-400 text-xs">Total Fuel (L)</div>
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
                    <div className="text-white text-base font-semibold">{session.stints?.length || "---"}</div>
                    <div className="text-zinc-400 text-xs">Stints</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {session.analytics?.distanceCovered && (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-600/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-white text-base font-semibold">{session.analytics.distanceCovered.toFixed(1)}</div>
                      <div className="text-zinc-400 text-xs">Distance (km)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stint Analysis - Scrollable */}
          <Card className="bg-zinc-900/50 border-zinc-800 flex-1 min-h-0">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-white text-xl">Stint Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-3 pr-2">
                {stints.length === 0 ? (
                  <div className="text-center py-8 text-zinc-400">
                    <p>No laps found for this session</p>
                    <p className="text-sm">Start driving to see lap data here</p>
                  </div>
                ) : (
                  stints.map((stint) => (
                    <Collapsible
                      key={stint.id}
                      open={expandedStints.includes(stint.id)}
                      onOpenChange={() => toggleStint(stint.id)}
                    >
                      <Card className="border border-zinc-700 overflow-hidden hover:shadow-md bg-zinc-900/50 border-zinc-800 hover:border-red-800/50">
                        {/* Stint Header - Reduced Height */}
                        <CollapsibleTrigger asChild>
                          <div className="px-4 py-2 cursor-pointer transition-colors hover:hover:shadow-md bg-zinc-900/50 border-zinc-800 hover:border-red-800/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {expandedStints.includes(stint.id) ? (
                                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                                )}
                                <div>
                                  <h3 className="text-white font-semibold text-base">Stint {stint.stintNumber}</h3>
                                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <span>
                                      Laps {stint.startedOnLap}-{stint.endedOnLap || "---"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Droplets className="w-3 h-3 text-blue-500" />
                                      <span>{session.weather || "---"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Stint Summary Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-white font-semibold">{stint.endedOnLap ? stint.endedOnLap - stint.startedOnLap : "---"}</div>
                                  <div className="text-zinc-500 text-xs">Total Laps</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-purple-400 font-mono font-semibold flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    {stint.bestLap || "---"}
                                  </div>
                                  <div className="text-zinc-500 text-xs">Best Lap</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-400 font-mono">{stint.averageLap || "---"}</div>
                                  <div className="text-zinc-500 text-xs">Avg Lap</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-400 font-mono">{stint.optimalLap || "---"}</div>
                                  <div className="text-zinc-500 text-xs">Optimal</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-orange-400">{stint.fuelUsed?.toFixed(1) || "---"}</div>
                                  <div className="text-zinc-500 text-xs">Fuel Used (L)</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-green-400">{stint.consistency || "---"}</div>
                                  <div className="text-zinc-500 text-xs">Consistency</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        {/* Expanded Stint Details */}
                        <CollapsibleContent>
                          <div className="border-t border-zinc-700">
                            {/* Stint Details Header */}
                            <div className="p-4 hover:shadow-md bg-zinc-900/50 border-zinc-800 hover:border-red-800/50">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                <div>
                                  <div className="text-zinc-400 mb-1">Timing</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Best Lap:</span>
                                      <span className="text-purple-400 font-mono">{stint.bestLap || "---"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Avg Lap:</span>
                                      <span className="text-blue-400 font-mono">{stint.averageLap || "---"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Optimal:</span>
                                      <span className="text-green-400 font-mono">{stint.optimalLap || "---"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-zinc-400 mb-1">Fuel & Consistency</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Fuel Used:</span>
                                      <span className="text-orange-400">{stint.fuelUsed?.toFixed(1) || "---"} L</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Consistency:</span>
                                      <span className="text-green-400">{stint.consistency || "---"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-zinc-400 mb-1">Session Info</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Start Time:</span>
                                      <span className="text-zinc-400">{stint.startTime ? new Date(stint.startTime).toLocaleTimeString() : "---"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">End Time:</span>
                                      <span className="text-zinc-400">{stint.endTime ? new Date(stint.endTime).toLocaleTimeString() : "---"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div className="text-zinc-400 mb-1">Lap Range</div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Started:</span>
                                      <span className="text-green-400">Lap {stint.startedOnLap}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-zinc-300">Ended:</span>
                                      <span className="text-red-400">Lap {stint.endedOnLap || "---"}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Lap List */}
                            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                              <div className="text-sm font-medium text-zinc-300 mb-3">Lap Details</div>
                              {laps
                                .filter(lap => lap.stintId === stint.id)
                                .map((lap) => (
                                <div
                                  key={lap.id}
                                  className={`p-3 rounded-lg border transition-all duration-200 ${
                                    lap.lapTime === stint.bestLap
                                      ? "bg-purple-600/10 border-purple-600/30"
                                      : "hover:shadow-md bg-zinc-900/90 border-zinc-800 hover:border-red-800/50 border-zinc-700 hover:border-zinc-600"
                                  }`}
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="text-zinc-400">L{lap.lapNumber}</span>
                                      {lap.lapTime === stint.bestLap && (
                                        <Badge variant="default" className="bg-purple-600 text-xs px-1 py-0">
                                          BEST
                                        </Badge>
                                      )}
                                    </div>

                                    <div>
                                      <div
                                        className={`font-mono ${lap.lapTime === stint.bestLap ? "text-purple-400 font-bold" : "text-white"}`}
                                      >
                                        {lap.lapTime}
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

                                    <div className="flex items-center justify-between">
                                      {/* Valid/Invalid Dot */}
                                      <div
                                        className={`w-2 h-2 rounded-full ${lap.isValid ? "bg-green-500" : "bg-red-500"}`}
                                        title={lap.isValid ? "Valid lap" : "Invalid lap"}
                                      />

                                      {/* Analyze Button */}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-zinc-600 text-zinc-300 hover:text-white bg-transparent text-xs px-2 py-1 h-6 ml-auto"
                                        asChild
                                      >
                                        <a onClick={() => onViewTelemetry(lap.id, sessionData)}>
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureLayout>
  )
}
