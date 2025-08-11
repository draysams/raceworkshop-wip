import { Search, Filter, ArrowDown, ArrowUp, X, Link, Calendar, Clock, MapPin, Car, Thermometer, Trophy } from "lucide-react"
import  { useCallback, useEffect, useState } from "react"
import  { Label } from "recharts"
import  { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"

import { Input } from "../../components/ui/input"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Badge } from "../../components/ui/badge"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { api } from "../../services/api"
import { SessionFilters, SessionSummary } from "../../shared/types"

interface ISessionHistoryProps {
    onViewSession: (sessionId: number) => void
}

export function SessionHistory({ onViewSession }: ISessionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  const [apiSessions, setApiSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep this single state object for all filters
  const [apiFilters, setApiFilters] = useState<SessionFilters>({
      simulator: "all",
      sessionType: "all",
      track: "all",
      car: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "date",
      sortOrder: "desc",
  });

  const addFilter = (filterType: string, value: string) => {
    const filterString = `${filterType}: ${value}`
    if (!filters.includes(filterString)) {
      setFilters([...filters, filterString])
    }
  }

  const removeFilter = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter))
  }

  const clearAllFilters = () => {
    setFilters([])
    setSortBy("")
    setSortOrder("desc")
  }

  const applySort = (field: string, order: "asc" | "desc") => {
    setSortBy(field)
    setSortOrder(order)
    // Add sort indicator to filters for display
    const sortString = `Sort: ${field} (${order === "asc" ? "↑" : "↓"})`
    const newFilters = filters.filter((f) => !f.startsWith("Sort:"))
    setFilters([...newFilters, sortString])
  }

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case "Race":
        return "bg-red-600/20 text-red-300 border-red-600/30"
      case "Practice":
        return "bg-blue-600/20 text-blue-300 border-blue-600/30"
      case "Qualifying":
        return "bg-yellow-600/20 text-yellow-300 border-yellow-600/30"
      default:
        return "bg-zinc-600/20 text-zinc-300 border-zinc-600/30"
    }
  }

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
        const fetchedSessions = await api.sessions.getSessionHistory(apiFilters);
        console.log(fetchedSessions);
        setApiSessions(fetchedSessions);
    } catch (error) {
        console.error("Failed to fetch session history:", error);
        setApiSessions([]);
    } finally {
        setIsLoading(false);
    }
}, [apiFilters]);

useEffect(() => {
    fetchSessions();
}, [fetchSessions]);

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

  return (
    <FeatureLayout header={<FeatureNavigation />}>
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-6 flex flex-col">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-3xl font-bold text-white mb-2">Racing Sessions</h1>
            <p className="text-zinc-400">
              Analyze your racing history with advanced filtering and detailed session data
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-6 flex-shrink-0">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="flex gap-2">
                  <Select onValueChange={(value) => addFilter("Track", value)}>
                    <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Silverstone GP">Silverstone GP</SelectItem>
                      <SelectItem value="Spa-Francorchamps">Spa-Francorchamps</SelectItem>
                      <SelectItem value="Nürburgring GP">Nürburgring GP</SelectItem>
                      <SelectItem value="Monza">Monza</SelectItem>
                      <SelectItem value="Algarve International Circuit-748557515">
                        Algarve International Circuit
                      </SelectItem>
                      <SelectItem value="Autódromo José Carlos Pace 1.19.2">Autódromo José Carlos Pace</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(value) => addFilter("Car", value)}>
                    <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Car" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Porsche 911 GT3 R">911 GT3 R</SelectItem>
                      <SelectItem value="Porsche 911 RSR">911 RSR</SelectItem>
                      <SelectItem value="Porsche 911 GT3 Cup">911 GT3 Cup</SelectItem>
                      <SelectItem value="WEC 2023, GTE, Ferrari 488 GTE EVO">Ferrari 488 GTE EVO</SelectItem>
                      <SelectItem value="Porsche 911 GT3 R (2019) - Championship Edition">
                        911 GT3 R (2019) Championship
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(value) => addFilter("Car Class", value)}>
                    <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Car Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GT3">GT3</SelectItem>
                      <SelectItem value="GTE">GTE</SelectItem>
                      <SelectItem value="Cup">Cup</SelectItem>
                      <SelectItem value="LMP1">LMP1</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={(value) => addFilter("Session Type", value)}>
                    <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Session Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Race">Race</SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                      <SelectItem value="Qualifying">Qualifying</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-zinc-700 text-zinc-300 hover:text-white bg-transparent"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        More Filters
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white w-[50vw] min-w-[800px] max-w-none">
                      <DialogHeader>
                        <DialogTitle>Advanced Filters & Sorting</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Filters Column */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Filters</h3>

                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm text-zinc-300">Track</Label>
                              <Select onValueChange={(value) => addFilter("Track", value)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                  <SelectValue placeholder="Select track" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Silverstone GP">Silverstone GP</SelectItem>
                                  <SelectItem value="Spa-Francorchamps">Spa-Francorchamps</SelectItem>
                                  <SelectItem value="Nürburgring GP">Nürburgring GP</SelectItem>
                                  <SelectItem value="Monza">Monza</SelectItem>
                                  <SelectItem value="Algarve International Circuit-748557515">
                                    Algarve International Circuit-748557515
                                  </SelectItem>
                                  <SelectItem value="Autódromo José Carlos Pace 1.19.2">
                                    Autódromo José Carlos Pace 1.19.2
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm text-zinc-300">Car</Label>
                              <Select onValueChange={(value) => addFilter("Car", value)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                  <SelectValue placeholder="Select car" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Porsche 911 GT3 R">911 GT3 R</SelectItem>
                                  <SelectItem value="Porsche 911 RSR">911 RSR</SelectItem>
                                  <SelectItem value="Porsche 911 GT3 Cup">911 GT3 Cup</SelectItem>
                                  <SelectItem value="WEC 2023, GTE, Ferrari 488 GTE EVO">
                                    WEC 2023, GTE, Ferrari 488 GTE EVO
                                  </SelectItem>
                                  <SelectItem value="Porsche 911 GT3 R (2019) - Championship Edition">
                                    911 GT3 R (2019) - Championship Edition
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm text-zinc-300">Simulator</Label>
                              <Select onValueChange={(value) => addFilter("Simulator", value)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                  <SelectValue placeholder="Select simulator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="iRacing">iRacing</SelectItem>
                                  <SelectItem value="ACC">ACC</SelectItem>
                                  <SelectItem value="rFactor 2">rFactor 2</SelectItem>
                                  <SelectItem value="F1 23">F1 23</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm text-zinc-300">Temperature Range</Label>
                              <Select onValueChange={(value) => addFilter("Temperature", value)}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                  <SelectValue placeholder="Select range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cold (< 15°C)">Cold (&lt; 15°C)</SelectItem>
                                  <SelectItem value="Moderate (15-25°C)">Moderate (15-25°C)</SelectItem>
                                  <SelectItem value="Hot (> 25°C)">Hot (&gt; 25°C)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Sorting Column */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Sort By</h3>

                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("date", "desc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowDown className="w-3 h-3 mr-2" />
                                Date (Newest)
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("date", "asc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowUp className="w-3 h-3 mr-2" />
                                Date (Oldest)
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("bestLap", "asc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowUp className="w-3 h-3 mr-2" />
                                Best Lap (Fastest)
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("bestLap", "desc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowDown className="w-3 h-3 mr-2" />
                                Best Lap (Slowest)
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("totalLaps", "desc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowDown className="w-3 h-3 mr-2" />
                                Most Laps
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("totalLaps", "asc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowUp className="w-3 h-3 mr-2" />
                                Least Laps
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("trackTemp", "desc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowDown className="w-3 h-3 mr-2" />
                                Hottest Track
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => applySort("trackTemp", "asc")}
                                className="justify-start border-zinc-700 bg-transparent px-3 py-1"
                              >
                                <ArrowUp className="w-3 h-3 mr-2" />
                                Coolest Track
                              </Button>
                            </div>
                          </div>

                          <Separator className="bg-zinc-700" />

                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="w-full border-zinc-700 bg-transparent text-zinc-300 hover:text-white"
                          >
                            Clear All Filters
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Active Filters */}
              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.map((filter, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-600/20 text-red-300 border-red-600/30">
                      {filter}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-red-300 hover:text-red-200"
                        onClick={() => removeFilter(filter)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sessions List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 pr-2">
              {isLoading ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>Loading sessions...</p>
                </div>
              ) : apiSessions.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <p>No sessions found</p>
                  <p className="text-sm">Start a session to see your data here</p>
                </div>
              ) : (
                apiSessions.map((session) => {
                  const { date, time } = formatSessionDateTime(session.date);
                  const invalidLaps = getInvalidLaps(session.totalLaps, session.validLaps);
                  
                  return (
                    <Card
                      key={session.id}
                      className="bg-zinc-900/50 border-zinc-800 hover:border-red-800/50 transition-all duration-300 group cursor-pointer"
                    >
                      <a onClick={() => onViewSession(session.id)}>
                        <CardContent className="p-4">
                          <div className="grid lg:grid-cols-12 gap-3 items-center">
                            {/* Date & Time */}
                            <div className="lg:col-span-1">
                              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                <Calendar className="w-3 h-3" />
                                <span className="text-sm">{date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-300">
                                <Clock className="w-3 h-3" />
                                <span className="text-sm font-medium">{time}</span>
                              </div>
                            </div>

                            {/* Track */}
                            <div className="lg:col-span-3">
                              <div className="flex items-center gap-2 text-white">
                                <MapPin className="w-3 h-3 text-red-500" />
                                <span className="font-semibold text-base">{session.track?.displayName || "---"}</span>
                              </div>
                            </div>

                            {/* Car & Badges */}
                            <div className="lg:col-span-3">
                              <div className="flex items-center gap-2 text-zinc-300 mb-2">
                                <Car className="w-3 h-3" />
                                <span className="text-sm">{session.car?.displayName || "---"}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-sm border-zinc-600 text-zinc-400 px-1 py-0">
                                  ---
                                </Badge>
                                <Badge className={`text-sm px-1 py-0 ${getSessionTypeColor(session.sessionType)}`}>
                                  {session.sessionType === "Practice"
                                    ? "Prac"
                                    : session.sessionType === "Qualifying"
                                      ? "Qual"
                                      : session.sessionType || "---"}
                                </Badge>
                                <Badge variant="secondary" className="text-sm px-1 py-0">
                                  {session.simulator || "---"}
                                </Badge>
                              </div>
                            </div>

                            {/* Temperature */}
                            <div className="lg:col-span-1">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <Thermometer className="w-3 h-3" />
                                <div className="text-sm">
                                  <div>{session.airTemp ? `${session.airTemp}°C` : "---"}</div>
                                  <div className="text-xs text-zinc-500">T: {session.trackTemp ? `${session.trackTemp}°C` : "---"}</div>
                                </div>
                              </div>
                            </div>

                            {/* Performance */}
                            <div className="lg:col-span-2">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <div className="flex items-center gap-1 text-red-400">
                                    <Trophy className="w-3 h-3" />
                                    <span className="text-sm font-mono">{session.bestLap || "---"}</span>
                                  </div>
                                  <div className="text-xs text-zinc-500">Best Lap</div>
                                </div>
                                <div>
                                  <div className="text-zinc-300 text-sm font-mono">{session.averageLap || "---"}</div>
                                  <div className="text-xs text-zinc-500">Avg Lap</div>
                                </div>
                              </div>
                            </div>

                            {/* Lap Stats */}
                            <div className="lg:col-span-1">
                              <div className="flex items-center gap-1 text-sm">
                                <div className="text-center">
                                  <div className="text-green-400 font-semibold">{session.validLaps || "---"}</div>
                                  <div className="text-xs text-zinc-500">Valid</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-red-400 font-semibold">{invalidLaps || "---"}</div>
                                  <div className="text-xs text-zinc-500">Invalid</div>
                                </div>
                              </div>
                            </div>

                            {/* Session Stats */}
                            <div className="lg:col-span-1">
                              <div className="text-right">
                                <div className="text-white font-semibold text-base">{session.totalLaps || "---"}</div>
                                <div className="text-zinc-400 text-sm">laps</div>
                                <div className="text-zinc-400 text-sm">{session.duration || "---"}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </a>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureLayout>
  )
}
