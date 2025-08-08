import { BarChart3, MapPin, Car, Settings, Search, ArrowUpDown, Link, Target } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"

// Mock data interfaces
interface SetupData {
  id: string
  name: string
  frontWing: number
  rearWing: number
  suspension: {
    frontHeight: number
    rearHeight: number
    frontStiffness: number
    rearStiffness: number
  }
  aerodynamics: {
    frontDownforce: number
    rearDownforce: number
    dragReduction: number
  }
  tires: {
    frontPressure: number
    rearPressure: number
    compound: string
  }
  gearing: {
    finalDrive: number
    gear1: number
    gear2: number
    gear3: number
    gear4: number
    gear5: number
    gear6: number
  }
  brakes: {
    balance: number
    pressure: number
  }
  differential: {
    preload: number
    acceleration: number
    deceleration: number
  }
}

interface SessionData {
  id: string
  date: string
  track: string
  car: string
  sessionType: "Race" | "Qualifying" | "Practice"
  position: number
  bestLap: string
  optimalLap: string
  totalLaps: number
  validLaps: number
  invalidLaps: number
  setup: SetupData
  distance: number
}

interface TrackRecord {
  track: string
  car: string
  time: string
  driver: string
  year: number
}

// Comprehensive mock data
const mockSetups: SetupData[] = [
  {
    id: "setup-1",
    name: "Silverstone Balanced",
    frontWing: 8,
    rearWing: 12,
    suspension: { frontHeight: 65, rearHeight: 70, frontStiffness: 85, rearStiffness: 90 },
    aerodynamics: { frontDownforce: 75, rearDownforce: 85, dragReduction: 15 },
    tires: { frontPressure: 23.5, rearPressure: 24.0, compound: "Medium" },
    gearing: { finalDrive: 3.2, gear1: 2.8, gear2: 2.1, gear3: 1.6, gear4: 1.3, gear5: 1.0, gear6: 0.8 },
    brakes: { balance: 58, pressure: 85 },
    differential: { preload: 15, acceleration: 25, deceleration: 35 },
  },
  {
    id: "setup-2",
    name: "Spa High Speed",
    frontWing: 6,
    rearWing: 8,
    suspension: { frontHeight: 60, rearHeight: 65, frontStiffness: 75, rearStiffness: 80 },
    aerodynamics: { frontDownforce: 65, rearDownforce: 70, dragReduction: 25 },
    tires: { frontPressure: 23.0, rearPressure: 23.5, compound: "Soft" },
    gearing: { finalDrive: 2.9, gear1: 2.6, gear2: 1.9, gear3: 1.4, gear4: 1.1, gear5: 0.9, gear6: 0.7 },
    brakes: { balance: 60, pressure: 90 },
    differential: { preload: 12, acceleration: 20, deceleration: 30 },
  },
  {
    id: "setup-3",
    name: "Monaco Tight",
    frontWing: 12,
    rearWing: 15,
    suspension: { frontHeight: 70, rearHeight: 75, frontStiffness: 95, rearStiffness: 100 },
    aerodynamics: { frontDownforce: 90, rearDownforce: 95, dragReduction: 5 },
    tires: { frontPressure: 24.0, rearPressure: 24.5, compound: "Hard" },
    gearing: { finalDrive: 3.8, gear1: 3.2, gear2: 2.5, gear3: 1.9, gear4: 1.5, gear5: 1.2, gear6: 1.0 },
    brakes: { balance: 55, pressure: 95 },
    differential: { preload: 20, acceleration: 35, deceleration: 45 },
  },
]

const mockSessions: SessionData[] = [
  // Silverstone sessions
  {
    id: "session-1",
    date: "2024-01-15",
    track: "Silverstone GP",
    car: "Porsche 911 GT3 R",
    sessionType: "Race",
    position: 1,
    bestLap: "1:58.342",
    optimalLap: "1:57.891",
    totalLaps: 45,
    validLaps: 42,
    invalidLaps: 3,
    setup: mockSetups[0],
    distance: 247.5,
  },
  {
    id: "session-2",
    date: "2024-01-14",
    track: "Silverstone GP",
    car: "Porsche 911 GT3 R",
    sessionType: "Qualifying",
    position: 3,
    bestLap: "1:57.234",
    optimalLap: "1:56.891",
    totalLaps: 12,
    validLaps: 11,
    invalidLaps: 1,
    setup: mockSetups[0],
    distance: 66.0,
  },
  {
    id: "session-3",
    date: "2024-01-13",
    track: "Silverstone GP",
    car: "Porsche 911 RSR",
    sessionType: "Practice",
    position: 5,
    bestLap: "1:59.567",
    optimalLap: "1:58.234",
    totalLaps: 28,
    validLaps: 26,
    invalidLaps: 2,
    setup: mockSetups[1],
    distance: 154.0,
  },
  // Spa sessions
  {
    id: "session-4",
    date: "2024-01-10",
    track: "Spa-Francorchamps",
    car: "Porsche 911 GT3 R",
    sessionType: "Race",
    position: 2,
    bestLap: "2:17.891",
    optimalLap: "2:16.234",
    totalLaps: 32,
    validLaps: 30,
    invalidLaps: 2,
    setup: mockSetups[1],
    distance: 224.0,
  },
  {
    id: "session-5",
    date: "2024-01-09",
    track: "Spa-Francorchamps",
    car: "Porsche 911 RSR",
    sessionType: "Qualifying",
    position: 1,
    bestLap: "2:16.123",
    optimalLap: "2:15.567",
    totalLaps: 15,
    validLaps: 14,
    invalidLaps: 1,
    setup: mockSetups[1],
    distance: 105.0,
  },
  // Monaco sessions
  {
    id: "session-6",
    date: "2024-01-05",
    track: "Monaco",
    car: "Porsche 911 GT3 Cup",
    sessionType: "Race",
    position: 3,
    bestLap: "1:14.567",
    optimalLap: "1:13.891",
    totalLaps: 78,
    validLaps: 75,
    invalidLaps: 3,
    setup: mockSetups[2],
    distance: 252.6,
  },
  // Additional sessions for more data
  {
    id: "session-7",
    date: "2024-01-20",
    track: "Nürburgring GP",
    car: "Porsche 911 GT3 R",
    sessionType: "Race",
    position: 1,
    bestLap: "1:47.234",
    optimalLap: "1:46.567",
    totalLaps: 38,
    validLaps: 36,
    invalidLaps: 2,
    setup: mockSetups[0],
    distance: 195.8,
  },
  {
    id: "session-8",
    date: "2024-01-18",
    track: "Monza",
    car: "Porsche 911 RSR",
    sessionType: "Qualifying",
    position: 2,
    bestLap: "1:46.789",
    optimalLap: "1:46.123",
    totalLaps: 18,
    validLaps: 17,
    invalidLaps: 1,
    setup: mockSetups[1],
    distance: 104.4,
  },
]

const trackRecords: TrackRecord[] = [
  { track: "Silverstone GP", car: "Porsche 911 GT3 R", time: "1:56.892", driver: "Nick Tandy", year: 2023 },
  { track: "Spa-Francorchamps", car: "Porsche 911 GT3 R", time: "2:14.567", driver: "Kévin Estre", year: 2023 },
  { track: "Monaco", car: "Porsche 911 GT3 Cup", time: "1:12.345", driver: "Jaxon Evans", year: 2023 },
  { track: "Nürburgring GP", car: "Porsche 911 GT3 R", time: "1:45.123", driver: "Matt Campbell", year: 2023 },
  { track: "Monza", car: "Porsche 911 RSR", time: "1:45.234", driver: "Gianmaria Bruni", year: 2023 },
]

export default function RaceEngineer() {
  const [activeTab, setActiveTab] = useState("tracks")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("bestLap")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedCar, setSelectedCar] = useState<string>("all")
  const [selectedTrack, setSelectedTrack] = useState<string>("all")

  // Helper function to calculate average lap time
  function calculateAverageLapTime(sessions: SessionData[]): string {
    if (!sessions || sessions.length === 0) return "N/A"

    const validSessions = sessions.filter((s) => s.bestLap && s.bestLap !== "N/A")
    if (validSessions.length === 0) return "N/A"

    const totalSeconds = validSessions.reduce((sum, session) => {
      const [minutes, seconds] = session.bestLap.split(":").map(Number)
      return sum + minutes * 60 + seconds
    }, 0)

    const avgSeconds = totalSeconds / validSessions.length
    const minutes = Math.floor(avgSeconds / 60)
    const seconds = (avgSeconds % 60).toFixed(3)
    return `${minutes}:${seconds.padStart(6, "0")}`
  }

  // Calculate track statistics
  const trackStats = useMemo(() => {
    if (!mockSessions || mockSessions.length === 0) return []

    const tracks = new Map()

    mockSessions.forEach((session) => {
      if (!tracks.has(session.track)) {
        tracks.set(session.track, {
          track: session.track,
          sessions: [],
          cars: new Set(),
          totalLaps: 0,
          validLaps: 0,
          invalidLaps: 0,
          raceSessions: 0,
          qualifyingSessions: 0,
          practiceSessions: 0,
          wins: 0,
          podiums: 0,
          bestLap: null,
          optimalLap: null,
          totalDistance: 0,
        })
      }

      const track = tracks.get(session.track)
      track.sessions.push(session)
      track.cars.add(session.car)
      track.totalLaps += session.totalLaps
      track.validLaps += session.validLaps
      track.invalidLaps += session.invalidLaps
      track.totalDistance += session.distance

      if (session.sessionType === "Race") track.raceSessions++
      else if (session.sessionType === "Qualifying") track.qualifyingSessions++
      else track.practiceSessions++

      if (session.position === 1) track.wins++
      if (session.position <= 3) track.podiums++

      // Update best and optimal lap times
      if (!track.bestLap || session.bestLap < track.bestLap) {
        track.bestLap = session.bestLap
        track.bestSession = session.id
      }
      if (!track.optimalLap || session.optimalLap < track.optimalLap) {
        track.optimalLap = session.optimalLap
      }
    })

    return Array.from(tracks.values()).map((track) => ({
      ...track,
      cars: Array.from(track.cars),
      avgLapTime: calculateAverageLapTime(track.sessions),
      worldRecord: trackRecords.find((r) => r.track === track.track)?.time || "N/A",
    }))
  }, [])

  // Calculate car statistics
  const carStats = useMemo(() => {
    if (!mockSessions || mockSessions.length === 0) return []

    const cars = new Map()

    mockSessions.forEach((session) => {
      if (!cars.has(session.car)) {
        cars.set(session.car, {
          car: session.car,
          sessions: [],
          tracks: new Set(),
          totalLaps: 0,
          validLaps: 0,
          totalDistance: 0,
          wins: 0,
          podiums: 0,
          bestLap: null,
          bestTrack: null,
          mostLapsTrack: null,
          mostDistanceTrack: null,
        })
      }

      const car = cars.get(session.car)
      car.sessions.push(session)
      car.tracks.add(session.track)
      car.totalLaps += session.totalLaps
      car.validLaps += session.validLaps
      car.totalDistance += session.distance

      if (session.position === 1) car.wins++
      if (session.position <= 3) car.podiums++

      if (!car.bestLap || session.bestLap < car.bestLap) {
        car.bestLap = session.bestLap
        car.bestTrack = session.track
        car.bestSession = session.id
      }
    })

    return Array.from(cars.values()).map((car) => {
      // Find track with most laps and most distance
      const trackLaps = new Map()
      const trackDistance = new Map()

      car.sessions.forEach((session: SessionData) => {
        trackLaps.set(session.track, (trackLaps.get(session.track) || 0) + session.totalLaps)
        trackDistance.set(session.track, (trackDistance.get(session.track) || 0) + session.distance)
      })

      const mostLapsTrack =
        trackLaps.size > 0 ? Array.from(trackLaps.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : "N/A"
      const mostDistanceTrack =
        trackDistance.size > 0 ? Array.from(trackDistance.entries()).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : "N/A"

      return {
        ...car,
        tracks: Array.from(car.tracks),
        mostLapsTrack,
        mostDistanceTrack,
      }
    })
  }, [])

  // Get unique cars and tracks with safety checks
  const uniqueCars = useMemo(() => {
    if (!mockSessions || mockSessions.length === 0) return []
    return Array.from(new Set(mockSessions.map((s) => s.car)))
  }, [])

  const uniqueTracks = useMemo(() => {
    if (!mockSessions || mockSessions.length === 0) return []
    return Array.from(new Set(mockSessions.map((s) => s.track)))
  }, [])

  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let data: any[] = []

    if (activeTab === "tracks") {
      data = trackStats.filter(
        (track) =>
          track.track.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedCar === "all" || track.cars.includes(selectedCar)),
      )
    } else if (activeTab === "cars") {
      data = carStats.filter(
        (car) =>
          car.car.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (selectedTrack === "all" || car.tracks.includes(selectedTrack)),
      )
    }

    // Sort data with safety checks
    if (data.length > 0) {
      data.sort((a, b) => {
        let aVal = a[sortBy]
        let bVal = b[sortBy]

        // Handle undefined values
        if (aVal === undefined || aVal === null) aVal = sortOrder === "asc" ? Number.MAX_VALUE : Number.MIN_VALUE
        if (bVal === undefined || bVal === null) bVal = sortOrder === "asc" ? Number.MAX_VALUE : Number.MIN_VALUE

        // Handle time strings
        if (typeof aVal === "string" && aVal.includes(":")) {
          const [aMin, aSec] = aVal.split(":").map(Number)
          const [bMin, bSec] = bVal.split(":").map(Number)
          aVal = aMin * 60 + aSec
          bVal = bMin * 60 + bSec
        }

        if (sortOrder === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      })
    }

    return data
  }, [activeTab, trackStats, carStats, searchTerm, selectedCar, selectedTrack, sortBy, sortOrder])

  return (
    <FeatureLayout header={<FeatureNavigation />}>
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-6 flex flex-col">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-red-500" />
              Race Engineer
            </h1>
            <p className="text-zinc-400">Comprehensive racing analytics and performance insights</p>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900/50 border border-zinc-800">
                <TabsTrigger value="tracks" className="data-[state=active]:bg-red-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  Tracks
                </TabsTrigger>
                <TabsTrigger value="cars" className="data-[state=active]:bg-red-600">
                  <Car className="w-4 h-4 mr-2" />
                  Cars
                </TabsTrigger>
                <TabsTrigger value="setup" className="data-[state=active]:bg-red-600">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup
                </TabsTrigger>
              </TabsList>

              {/* Tracks Tab */}
              <TabsContent value="tracks" className="flex-1 min-h-0 mt-6">
                <div className="h-full flex flex-col">
                  {/* Filters */}
                  <Card className="bg-zinc-900/50 border-zinc-800 mb-6 flex-shrink-0">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <Input
                            placeholder="Search tracks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <Select value={selectedCar} onValueChange={setSelectedCar}>
                          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Filter by car" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cars</SelectItem>
                            {uniqueCars.map((car) => (
                              <SelectItem key={car} value={car}>
                                {car}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bestLap">Best Lap</SelectItem>
                            <SelectItem value="totalLaps">Total Laps</SelectItem>
                            <SelectItem value="totalDistance">Distance</SelectItem>
                            <SelectItem value="wins">Wins</SelectItem>
                            <SelectItem value="podiums">Podiums</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                        >
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          {sortOrder === "asc" ? "Ascending" : "Descending"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tracks List - Condensed */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2 pr-2">
                      {filteredAndSortedData.length === 0 ? (
                        <div className="text-center py-12">
                          <MapPin className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-400">No tracks found matching your criteria</p>
                        </div>
                      ) : (
                        filteredAndSortedData.map((track) => (
                          <Card
                            key={track.track}
                            className="bg-zinc-900/50 border-zinc-800 hover:border-red-800/50 transition-all duration-300"
                          >
                            <CardContent className="p-3">
                              {/* Header Row - Compact */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  <h3 className="text-lg font-bold text-white">{track.track}</h3>
                                  <div className="flex gap-1">
                                    <Badge
                                      variant="outline"
                                      className="border-zinc-600 text-zinc-400 text-xs px-1 py-0"
                                    >
                                      {track.cars?.length || 0}C
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="border-zinc-600 text-zinc-400 text-xs px-1 py-0"
                                    >
                                      {track.sessions?.length || 0}S
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-mono text-red-400">{track.bestLap || "N/A"}</div>
                                  <div className="text-xs text-zinc-400">Personal Best</div>
                                </div>
                              </div>

                              {/* Statistics Row - Compact Grid */}
                              <div className="grid grid-cols-6 gap-2 mb-2 text-center">
                                <div>
                                  <div className="text-white font-semibold text-sm">{track.totalLaps || 0}</div>
                                  <div className="text-zinc-400 text-xs">Laps</div>
                                </div>
                                <div>
                                  <div className="text-green-400 font-semibold text-sm">{track.validLaps || 0}</div>
                                  <div className="text-zinc-400 text-xs">Valid</div>
                                </div>
                                <div>
                                  <div className="text-yellow-400 font-semibold text-sm">{track.wins || 0}</div>
                                  <div className="text-zinc-400 text-xs">Wins</div>
                                </div>
                                <div>
                                  <div className="text-purple-400 font-semibold text-sm">{track.podiums || 0}</div>
                                  <div className="text-zinc-400 text-xs">Podiums</div>
                                </div>
                                <div>
                                  <div className="text-blue-400 font-semibold text-sm">
                                    {(track.totalDistance || 0).toFixed(0)}km
                                  </div>
                                  <div className="text-zinc-400 text-xs">Distance</div>
                                </div>
                                <div>
                                  <div className="text-cyan-400 font-semibold text-sm">
                                    {(((track.validLaps || 0) / Math.max(track.totalLaps || 1, 1)) * 100).toFixed(0)}%
                                  </div>
                                  <div className="text-zinc-400 text-xs">Success</div>
                                </div>
                              </div>

                              {/* Session Types & Times Row */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 text-xs">
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-red-600 rounded"></div>
                                    <span className="text-zinc-300">{track.raceSessions || 0}R</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-yellow-600 rounded"></div>
                                    <span className="text-zinc-300">{track.qualifyingSessions || 0}Q</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-600 rounded"></div>
                                    <span className="text-zinc-300">{track.practiceSessions || 0}P</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <div className="text-center">
                                    <div className="text-green-400 font-mono">{track.optimalLap || "N/A"}</div>
                                    <div className="text-zinc-500">Optimal</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-yellow-400 font-mono">{track.worldRecord || "N/A"}</div>
                                    <div className="text-zinc-500">WR</div>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Row - Cars & Action */}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {(track.cars || []).slice(0, 3).map((car: string) => (
                                    <Badge key={car} variant="secondary" className="text-xs px-1 py-0">
                                      {car
                                        .replace("Porsche ", "")
                                        .replace(" GT3 R", "")
                                        .replace(" RSR", "")
                                        .replace(" GT3 Cup", "")}
                                    </Badge>
                                  ))}
                                  {(track.cars || []).length > 3 && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                      +{(track.cars || []).length - 3}
                                    </Badge>
                                  )}
                                </div>
                                {track.bestSession && (
                                  <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 h-7 px-2 text-xs">
                                    <Link href={`/porsche/telemetry?session=${track.bestSession}&lap=3`}>
                                      <Target className="w-3 h-3 mr-1" />
                                      Analyze
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Cars Tab - Condensed */}
              <TabsContent value="cars" className="flex-1 min-h-0 mt-6">
                <div className="h-full flex flex-col">
                  {/* Filters */}
                  <Card className="bg-zinc-900/50 border-zinc-800 mb-6 flex-shrink-0">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                          <Input
                            placeholder="Search cars..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                          />
                        </div>
                        <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Filter by track" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tracks</SelectItem>
                            {uniqueTracks.map((track) => (
                              <SelectItem key={track} value={track}>
                                {track}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bestLap">Best Lap</SelectItem>
                            <SelectItem value="totalLaps">Total Laps</SelectItem>
                            <SelectItem value="totalDistance">Distance</SelectItem>
                            <SelectItem value="wins">Wins</SelectItem>
                            <SelectItem value="podiums">Podiums</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                        >
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          {sortOrder === "asc" ? "Ascending" : "Descending"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cars List - Condensed */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2 pr-2">
                      {filteredAndSortedData.length === 0 ? (
                        <div className="text-center py-12">
                          <Car className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-400">No cars found matching your criteria</p>
                        </div>
                      ) : (
                        filteredAndSortedData.map((car) => (
                          <Card
                            key={car.car}
                            className="bg-zinc-900/50 border-zinc-800 hover:border-red-800/50 transition-all duration-300"
                          >
                            <CardContent className="p-3">
                              {/* Header Row - Compact */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  <h3 className="text-lg font-bold text-white">{car.car}</h3>
                                  <div className="flex gap-1">
                                    <Badge
                                      variant="outline"
                                      className="border-zinc-600 text-zinc-400 text-xs px-1 py-0"
                                    >
                                      {car.tracks?.length || 0}T
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="border-zinc-600 text-zinc-400 text-xs px-1 py-0"
                                    >
                                      {car.sessions?.length || 0}S
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-mono text-red-400">{car.bestLap || "N/A"}</div>
                                  <div className="text-xs text-zinc-400">at {car.bestTrack || "N/A"}</div>
                                </div>
                              </div>

                              {/* Statistics Row - Compact Grid */}
                              <div className="grid grid-cols-6 gap-2 mb-2 text-center">
                                <div>
                                  <div className="text-white font-semibold text-sm">{car.totalLaps || 0}</div>
                                  <div className="text-zinc-400 text-xs">Laps</div>
                                </div>
                                <div>
                                  <div className="text-green-400 font-semibold text-sm">{car.validLaps || 0}</div>
                                  <div className="text-zinc-400 text-xs">Valid</div>
                                </div>
                                <div>
                                  <div className="text-blue-400 font-semibold text-sm">
                                    {(car.totalDistance || 0).toFixed(0)}km
                                  </div>
                                  <div className="text-zinc-400 text-xs">Distance</div>
                                </div>
                                <div>
                                  <div className="text-yellow-400 font-semibold text-sm">{car.wins || 0}</div>
                                  <div className="text-zinc-400 text-xs">Wins</div>
                                </div>
                                <div>
                                  <div className="text-purple-400 font-semibold text-sm">{car.podiums || 0}</div>
                                  <div className="text-zinc-400 text-xs">Podiums</div>
                                </div>
                                <div>
                                  <div className="text-cyan-400 font-semibold text-sm">{car.sessions?.length || 0}</div>
                                  <div className="text-zinc-400 text-xs">Sessions</div>
                                </div>
                              </div>

                              {/* Track Performance Row */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-zinc-800/50 rounded px-2 py-1">
                                    <div className="text-zinc-400">Most Laps</div>
                                    <div className="text-white font-semibold truncate">
                                      {car.mostLapsTrack || "N/A"}
                                    </div>
                                  </div>
                                  <div className="bg-zinc-800/50 rounded px-2 py-1">
                                    <div className="text-zinc-400">Most Distance</div>
                                    <div className="text-white font-semibold truncate">
                                      {car.mostDistanceTrack || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Row - Tracks & Action */}
                              <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-1">
                                  {(car.tracks || []).slice(0, 2).map((track: string) => (
                                    <Badge key={track} variant="secondary" className="text-xs px-1 py-0">
                                      {track.replace(" GP", "").replace("International Circuit", "IC")}
                                    </Badge>
                                  ))}
                                  {(car.tracks || []).length > 2 && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                      +{(car.tracks || []).length - 2}
                                    </Badge>
                                  )}
                                </div>
                                {car.bestSession && (
                                  <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 h-7 px-2 text-xs">
                                    <Link href={`/porsche/telemetry?session=${car.bestSession}&lap=3`}>
                                      <Target className="w-3 h-3 mr-1" />
                                      Analyze
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Setup Tab */}
              <TabsContent value="setup" className="flex-1 min-h-0 mt-6">
                <div className="h-full flex flex-col">
                  <Card className="bg-zinc-900/50 border-zinc-800 mb-6 flex-shrink-0">
                    <CardHeader>
                      <CardTitle className="text-white">Setup Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Select value={selectedCar} onValueChange={setSelectedCar}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Select car" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cars</SelectItem>
                            {uniqueCars.map((car) => (
                              <SelectItem key={car} value={car}>
                                {car}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectValue placeholder="Select track" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tracks</SelectItem>
                            {uniqueTracks.map((track) => (
                              <SelectItem key={track} value={track}>
                                {track}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedCar !== "all" && selectedTrack !== "all" && (
                        <div className="space-y-3">
                          {mockSetups.map((setup) => {
                            const relevantSessions = mockSessions.filter(
                              (s) => s.car === selectedCar && s.track === selectedTrack && s.setup.id === setup.id,
                            )

                            if (relevantSessions.length === 0) return null

                            const bestSession = relevantSessions.reduce((best, current) =>
                              current.bestLap < best.bestLap ? current : best,
                            )

                            const totalDistance = relevantSessions.reduce((sum, s) => sum + s.distance, 0)
                            const totalLaps = relevantSessions.reduce((sum, s) => sum + s.totalLaps, 0)

                            return (
                              <Card key={setup.id} className="bg-zinc-800/50 border-zinc-700">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <h4 className="text-lg font-semibold text-white">{setup.name}</h4>
                                      <div className="flex gap-3 text-xs text-zinc-400">
                                        <span>{relevantSessions.length} sessions</span>
                                        <span>{totalLaps} laps</span>
                                        <span>{totalDistance.toFixed(1)}km</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-mono text-red-400">{bestSession.bestLap}</div>
                                      <div className="text-xs text-zinc-400">Best Lap</div>
                                    </div>
                                  </div>

                                  {/* Setup Parameters - Compact */}
                                  <div className="grid grid-cols-4 gap-2 mb-2">
                                    <div className="bg-zinc-900/50 rounded p-1">
                                      <div className="text-xs text-zinc-400">Aero</div>
                                      <div className="text-xs text-white">
                                        F:{setup.frontWing} R:{setup.rearWing}
                                      </div>
                                    </div>
                                    <div className="bg-zinc-900/50 rounded p-1">
                                      <div className="text-xs text-zinc-400">Susp</div>
                                      <div className="text-xs text-white">
                                        H:{setup.suspension.frontHeight}/{setup.suspension.rearHeight}
                                      </div>
                                    </div>
                                    <div className="bg-zinc-900/50 rounded p-1">
                                      <div className="text-xs text-zinc-400">Tires</div>
                                      <div className="text-xs text-white">
                                        {setup.tires.compound} {setup.tires.frontPressure}/{setup.tires.rearPressure}
                                      </div>
                                    </div>
                                    <div className="bg-zinc-900/50 rounded p-1">
                                      <div className="text-xs text-zinc-400">Brake</div>
                                      <div className="text-xs text-white">{setup.brakes.balance}%</div>
                                    </div>
                                  </div>

                                  <div className="flex justify-end">
                                    <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 h-7 px-2 text-xs">
                                      <Link href={`/porsche/telemetry?session=${bestSession.id}&lap=3`}>
                                        <Target className="w-3 h-3 mr-1" />
                                        Analyze
                                      </Link>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}

                      {(selectedCar === "all" || selectedTrack === "all") && (
                        <div className="text-center py-12">
                          <Settings className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                          <p className="text-zinc-400">Select both a car and track to view setup analysis</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </FeatureLayout>
  )
}
