"use client"

import { useState, useEffect } from "react"
import { TrendingUp, MapPin, Car, Settings, Clock, Target } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import {
  ExpandableCard,
  FilterControls,
  PerformanceMetrics,
  ExpandableTabs,
  DataList,
  EmptyState,
} from "./components"
import { api } from "../../services/api"
import { useViewManager } from "../../hooks/useViewManager"
import type { TrackViewStats, CarViewStats, SetupViewStats } from "../../shared/types"

export default function RaceEngineer() {
  const [activeTab, setActiveTab] = useState("tracks")
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeCardTab, setActiveCardTab] = useState<string>("performance")
  const [trackSearch, setTrackSearch] = useState("")
  const [trackCountryFilter, setTrackCountryFilter] = useState("all")
  const [trackCarFilter, setTrackCarFilter] = useState("all")
  const [trackSortBy, setTrackSortBy] = useState("bestLap")
  const [carSortBy, setCarSortBy] = useState("distance")
  const [setupCarFilter, setSetupCarFilter] = useState("all")
  const [setupTrackFilter, setSetupTrackFilter] = useState("all")
  const [setupCategoryFilter, setSetupCategoryFilter] = useState("all")
  const [setupSortBy, setSetupSortBy] = useState("bestLap")
  
  // Real data state
  const [trackStats, setTrackStats] = useState<TrackViewStats[]>([])
  const [carStats, setCarStats] = useState<CarViewStats[]>([])
  const [setupStats, setSetupStats] = useState<SetupViewStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const viewManager = useViewManager()

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch track stats
        const trackData = await api.raceEngineer.getTrackViewStats()
        setTrackStats(trackData)
        
        // Fetch car stats
        const carData = await api.raceEngineer.getCarViewStats()
        setCarStats(carData)
        
        // Fetch setup stats
        const setupData = await api.raceEngineer.getSetupViewStats()
        setSetupStats(setupData)
        
      } catch (error) {
        console.error("Error fetching race engineer data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId)
  }

  const handleCardClick = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null)
    } else {
      setExpandedCard(cardId)
      setActiveCardTab("performance")
    }
  }

  const filteredTracks = trackStats.filter((track) => {
    const matchesSearch =
      track.name.toLowerCase().includes(trackSearch.toLowerCase()) ||
      track.country.toLowerCase().includes(trackSearch.toLowerCase())
    const matchesCountry = trackCountryFilter === "all" || track.country === trackCountryFilter
    const matchesCar = trackCarFilter === "all" || track.cars.some((car) => car.name === trackCarFilter)
    return matchesSearch && matchesCountry && matchesCar
  })

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    switch (trackSortBy) {
      case "bestLapTime":
        if (!a.bestLapTime && !b.bestLapTime) return 0
        if (!a.bestLapTime) return 1
        if (!b.bestLapTime) return -1
        return Number.parseFloat(a.bestLapTime.replace(":", "")) - Number.parseFloat(b.bestLapTime.replace(":", ""))
      case "avgLapTime":
        if (!a.avgLapTime && !b.avgLapTime) return 0
        if (!a.avgLapTime) return 1
        if (!b.avgLapTime) return -1
        return Number.parseFloat(a.avgLapTime.replace(":", "")) - Number.parseFloat(b.avgLapTime.replace(":", ""))
      case "validLaps":
        return b.totalValidLaps - a.totalValidLaps
      case "wins":
        return b.wins - a.wins
      case "sessions":
        return b.sessions - a.sessions
      case "distance":
        return b.totalDistance - a.totalDistance
      default:
        return 0
    }
  })

  const sortedCars = [...carStats].sort((a, b) => {
    switch (carSortBy) {
      case "totalDistance":
        return b.totalDistance - a.totalDistance
      case "validLaps":
        return b.validLaps - a.validLaps
      case "reliability":
        return b.reliability - a.reliability
      case "winRate":
        return b.winRate - a.winRate
      case "podiumRate":
        return b.podiumRate - a.podiumRate
      case "bestLap":
        if (!a.bestOverallLap && !b.bestOverallLap) return 0
        if (!a.bestOverallLap) return 1
        if (!b.bestOverallLap) return -1
        return (
          Number.parseFloat(a.bestOverallLap.replace(":", "")) - Number.parseFloat(b.bestOverallLap.replace(":", ""))
        )
      case "avgLap":
        if (!a.avgLapTime && !b.avgLapTime) return 0
        if (!a.avgLapTime) return 1
        if (!b.avgLapTime) return -1
        return Number.parseFloat(a.avgLapTime.replace(":", "")) - Number.parseFloat(b.avgLapTime.replace(":", ""))
      default:
        return 0
    }
  })

  const filteredSetups = setupStats.filter((setup) => {
    const matchesCar =
      setupCarFilter === "all" ||
      (setupCarFilter === "911-gt3-rs" && setup.car === "911 GT3 RS") ||
      (setupCarFilter === "718-cayman-gt4" && setup.car === "718 Cayman GT4")

    const matchesTrack =
      setupTrackFilter === "all" ||
      (setupTrackFilter === "nurburgring" && setup.track === "Nürburgring GP") ||
      (setupTrackFilter === "silverstone" && setup.track === "Silverstone Circuit")

    // Note: Backend doesn't provide category info yet, so we'll skip category filtering for now
    const matchesCategory = setupCategoryFilter === "all"

    return matchesCar && matchesTrack && matchesCategory
  })

  const sortedSetups = [...filteredSetups].sort((a, b) => {
    switch (setupSortBy) {
      case "bestLapTime":
        if (!a.bestLapTime && !b.bestLapTime) return 0
        if (!a.bestLapTime) return 1
        if (!b.bestLapTime) return -1
        return Number.parseFloat(a.bestLapTime.replace(":", "")) - Number.parseFloat(b.bestLapTime.replace(":", ""))
      case "consistency":
        return b.consistency - a.consistency
      case "reliability":
        return b.reliability - a.reliability
      case "fuelEfficiency":
        return a.fuelEfficiency - b.fuelEfficiency
      case "totalDistance":
        return b.totalDistance - a.totalDistance
      case "lastUsed":
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
      default:
        return 0
    }
  })

  const getPerformanceGap = (lapTime: string, worldRecord: string) => {
    const lap = Number.parseFloat(lapTime.replace(":", ""))
    const record = Number.parseFloat(worldRecord.replace(":", ""))
    return (((lap - record) / record) * 100).toFixed(2)
  }

  const getTireWearColor = (wear: string) => {
    switch (wear) {
      case "Very Low":
        return "text-green-600"
      case "Low":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "High":
        return "text-orange-500"
      case "Very High":
        return "text-red-500"
      default:
        return "text-zinc-400"
    }
  }

  return (
    <FeatureLayout header={<FeatureNavigation />}>
    <div className="min-h-screen">
      <div className="sticky top-0 z-50  border-b">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">Race Engineer</h1>
               <p className="text-zinc-400">Telemetry Analytics & Performance Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Live Session
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[120px] z-40  border-b">
        <div className="mx-auto px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tracks" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="cars" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Cars
              </TabsTrigger>
              <TabsTrigger value="setup" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Setup
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="mx-auto px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="tracks" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                 <h2 className="text-2xl font-semibold text-white">Track Performance Analysis</h2>

                <FilterControls
                  searchPlaceholder="Search tracks..."
                  searchValue={trackSearch}
                  onSearchChange={setTrackSearch}
                  onViewStatsTable={() => viewManager.setActiveSubmodule("track-car-stats")}
                  filters={[
                    {
                      key: "country",
                      label: "Country",
                      value: trackCountryFilter,
                      options: [
                        { value: "all", label: "All Countries" },
                        ...Array.from(new Set(trackStats.map(t => t.country).filter(c => c !== "N/A"))).map(country => ({
                          value: country,
                          label: country
                        }))
                      ],
                      onValueChange: setTrackCountryFilter,
                    },
                    {
                      key: "car",
                      label: "Car",
                      value: trackCarFilter,
                      options: [
                        { value: "all", label: "All Cars" },
                        { value: "911 GT3 RS", label: "911 GT3 RS" },
                        { value: "718 Cayman GT4", label: "718 Cayman GT4" },
                      ],
                      onValueChange: setTrackCarFilter,
                    },
                    {
                      key: "sort",
                      label: "Sort By",
                      value: trackSortBy,
                      options: [
                        { value: "bestLapTime", label: "Best Lap Time" },
                        { value: "avgLapTime", label: "Average Lap Time" },
                        { value: "validLaps", label: "Total Laps" },
                        { value: "distance", label: "Total Distance" },
                        { value: "wins", label: "Wins" },
                        { value: "sessions", label: "Sessions" },
                      ],
                      onValueChange: setTrackSortBy,
                      width: "w-[160px]",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 space-y-6">
              {isLoading ? (
                <div className="text-center p-8 text-zinc-400">
                  <p>Loading race engineer data...</p>
                </div>
              ) : (
                sortedTracks.map((track) => (
                <ExpandableCard
                  key={track.id}
                  id={`track-${track.id}`}
                  title={track.name}
                  subtitle={`${track.country} • ${track.length.toFixed(1)}km`}
                  badges={[
                    { text: `${track.totalDistance.toFixed(1)}km total` },
                    { text: `${track.sessions} Sessions`, variant: "secondary" },
                  ]}
                  metrics={[
                    { value: track.bestLapTime || "N/A", label: "Best Lap", color: "font-mono" },
                    { value: track.totalValidLaps, label: "Valid Laps", color: "text-green-600" },
                    { value: track.wins, label: "Wins", color: "text-blue-600" },
                    { value: track.podiums, label: "Podiums", color: "text-purple-600" },
                  ]}
                  isExpanded={expandedCard === `track-${track.id}`}
                  onToggle={() => handleCardClick(`track-${track.id}`)}
                  showTrophy={true}
                  trophyCount={track.wins}
                >
                  <ExpandableTabs
                    value={activeCardTab}
                    onValueChange={setActiveCardTab}
                    tabs={[
                      {
                        value: "performance",
                        label: "Performance",
                        content: (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold text-red-600">{track.totalInvalidLaps}</div>
                                <div className="text-xs text-zinc-500">Invalid Laps</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{track.avgLapTime}</div>
                                <div className="text-xs text-zinc-500">Avg Lap</div>
                              </div>
                            </div>

                            <PerformanceMetrics
                              metrics={[
                                {
                                  label: "Performance vs World Record",
                                  value: track.bestLapTime && track.worldRecord ? 
                                    (1 - (parseFloat(track.bestLapTime.replace(":", "")) - parseFloat(track.worldRecord.replace(":", ""))) / parseFloat(track.worldRecord.replace(":", ""))) * 100 : 0,
                                  description: `World Record: ${track.worldRecord || "N/A"} • Your Best: ${track.bestLapTime || "N/A"}`,
                                },
                              ]}
                              columns={1}
                            />
                          </>
                        ),
                      },
                      {
                        value: "cars",
                        label: "Cars",
                        content: (
                          <DataList
                            items={track.cars.map((car, idx) => ({
                              id: idx,
                              title: car.name,
                              badges: [{ text: car.name, variant: "outline" }],
                              metrics: [
                                { label: "Best Lap", value: car.bestLap || "N/A", color: "font-mono" },
                              ],
                              actions: [
                                {
                                  label: "View Lap",
                                  onClick: () => {
                                    // Navigate to telemetry page
                                  },
                                  icon: <Target className="w-4 h-4 mr-2" />,
                                },
                              ],
                            }))}
                            emptyMessage="No cars available"
                          />
                        ),
                      },
                      {
                        value: "sessions",
                        label: "Sessions",
                        content: (
                          <DataList
                            items={track.recentSessions?.map((session, idx) => ({
                              id: idx,
                              title: session.date,
                              subtitle: session.car,
                              badges: [
                                { text: session.type, variant: session.type === "Race" ? "default" : "secondary" },
                              ],
                              metrics: [
                                { label: "laps", value: session.laps },
                                { label: "Best Lap", value: session.bestLap || "N/A", color: "font-mono" },
                              ],
                            })) || []}
                            emptyMessage="No recent sessions available"
                          />
                        ),
                      },
                    ]}
                  />
                </ExpandableCard>
              ))
              )}

              {!isLoading && sortedTracks.length === 0 && (
                <EmptyState icon={MapPin} message="No tracks found matching your filters." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cars" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                 <h2 className="text-2xl font-semibold text-white">Car Performance Analysis</h2>

                <FilterControls
                  onViewStatsTable={() => viewManager.setActiveSubmodule("track-car-stats")}
                  filters={[
                    {
                      key: "sort",
                      label: "Sort By",
                      value: carSortBy,
                      options: [
                        { value: "totalDistance", label: "Total Distance" },
                        { value: "validLaps", label: "Valid Laps" },
                        { value: "reliability", label: "Reliability" },
                        { value: "winRate", label: "Win Rate" },
                        { value: "podiumRate", label: "Podium Rate" },
                        { value: "bestLap", label: "Best Lap Time" },
                        { value: "avgLap", label: "Average Lap Time" },
                      ],
                      onValueChange: setCarSortBy,
                      width: "w-[160px]",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 space-y-6">
              {isLoading ? (
                <div className="text-center p-8 text-zinc-400">
                  <p>Loading car data...</p>
                </div>
              ) : (
                sortedCars.map((car) => (
                <ExpandableCard
                  key={car.id}
                  id={`car-${car.id}`}
                  title={car.name}
                  subtitle={car.manufacturer}
                  badges={[
                    { text: `${car.totalDistance.toFixed(1)}km total` },
                    { text: `${car.reliability.toFixed(1)}% reliability` },
                    { text: `${car.sessions} Sessions`, variant: "secondary" },
                  ]}
                  metrics={[
                    { value: car.bestOverallLap || "N/A", label: "Best Lap", color: "font-mono" },
                    { value: `${car.totalDistance.toFixed(0)}km`, label: "Total Distance" },
                    { value: car.validLaps, label: "Valid Laps", color: "text-green-600" },
                    { value: car.wins, label: "Wins", color: "text-blue-600" },
                  ]}
                  isExpanded={expandedCard === `car-${car.id}`}
                  onToggle={() => handleCardClick(`car-${car.id}`)}
                  showTrophy={true}
                  trophyCount={car.wins}
                >
                  <ExpandableTabs
                    value={activeCardTab}
                    onValueChange={setActiveCardTab}
                    tabs={[
                      {
                        value: "performance",
                        label: "Performance",
                        content: (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">{car.podiums}</div>
                                <div className="text-xs text-zinc-500">Podiums</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{car.avgLapTime || "N/A"}</div>
                                <div className="text-xs text-zinc-500">Avg Lap</div>
                              </div>
                            </div>

                            <PerformanceMetrics
                              metrics={[
                                {
                                  label: "Win Rate",
                                  value: car.winRate,
                                  description: "Percentage of sessions won",
                                },
                                {
                                  label: "Podium Rate",
                                  value: car.podiumRate,
                                  description: "Percentage of sessions on podium",
                                },
                                {
                                  label: "Reliability",
                                  value: car.reliability,
                                  description: "Valid lap completion rate",
                                },
                              ]}
                              columns={3}
                            />

                            <div className="bg-muted/30 p-4 rounded-lg">
                              <h4 className="font-medium text-sm mb-3">Top Track Performance</h4>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">{car.topTrack}</Badge>
                                                                  <span className="text-sm text-zinc-400">
                                  {car.topTrackLaps} laps • {car.topTrackDistance.toFixed(1)}km
                                </span>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Navigate to telemetry page
                                  }}
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  View Best Lap
                                </Button>
                              </div>
                            </div>
                          </>
                        ),
                      },
                      {
                        value: "tracks",
                        label: "Tracks",
                        content: (
                          <div className="space-y-4">
                            <h4 className="font-medium">Track Performance Breakdown</h4>
                            <div className="grid gap-4">
                              {car.trackPerformance.map((track, idx) => (
                                <div key={idx} className="p-4 bg-muted/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h5 className="font-medium">{track.track}</h5>
                                      <p className="text-sm text-zinc-400">{track.country}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {track.wins > 0 && (
                                        <Badge variant="default" className="text-xs">
                                          {track.wins}W
                                        </Badge>
                                      )}
                                      {track.podiums > 0 && (
                                        <Badge variant="secondary" className="text-xs">
                                          {track.podiums}P
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="font-mono text-sm">{track.bestLap || "N/A"}</div>
                                      <div className="text-xs text-zinc-500">Best Lap</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.validLaps}</div>
                                      <div className="text-xs text-zinc-500">Valid Laps</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.distance.toFixed(1)}km</div>
                                      <div className="text-xs text-zinc-500">Distance</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.improvement}</div>
                                      <div className="text-xs text-zinc-500">Improvement</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      },
                      {
                        value: "sessions",
                        label: "Sessions",
                        content: (
                          <DataList
                            items={car.recentSessions?.map((session, idx) => ({
                              id: idx,
                              title: session.track,
                              subtitle: session.date,
                              badges: [
                                { text: session.type, variant: session.type === "Race" ? "default" : "secondary" },
                              ],
                              metrics: [
                                { label: "Best Lap", value: session.bestLap || "N/A", color: "font-mono" },
                                { label: "Result", value: session.result && session.result !== "-" ? session.result : "Practice" },
                              ],
                            })) || []}
                            emptyMessage="No recent sessions available"
                          />
                        ),
                      },
                    ]}
                  />
                </ExpandableCard>
              ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                                 <h2 className="text-2xl font-semibold text-white">Setup Performance Analysis</h2>

                <FilterControls
                  onViewStatsTable={() => viewManager.setActiveSubmodule("track-car-stats")}
                  filters={[
                    {
                      key: "car",
                      label: "Car",
                      value: setupCarFilter,
                      options: [
                        { value: "all", label: "All Cars" },
                        { value: "911-gt3-rs", label: "911 GT3 RS" },
                        { value: "718-cayman-gt4", label: "718 Cayman GT4" },
                      ],
                      onValueChange: setSetupCarFilter,
                    },
                    {
                      key: "track",
                      label: "Track",
                      value: setupTrackFilter,
                      options: [
                        { value: "all", label: "All Tracks" },
                        { value: "nurburgring", label: "Nürburgring GP" },
                        { value: "silverstone", label: "Silverstone Circuit" },
                      ],
                      onValueChange: setSetupTrackFilter,
                    },
                    {
                      key: "category",
                      label: "Category",
                      value: setupCategoryFilter,
                      options: [
                        { value: "all", label: "All Categories" },
                      ],
                      onValueChange: setSetupCategoryFilter,
                    },
                    {
                      key: "sort",
                      label: "Sort By",
                      value: setupSortBy,
                      options: [
                        { value: "bestLapTime", label: "Best Lap Time" },
                        { value: "consistency", label: "Consistency" },
                        { value: "reliability", label: "Reliability" },
                        { value: "fuelEfficiency", label: "Fuel Efficiency" },
                        { value: "totalDistance", label: "Total Distance" },
                        { value: "lastUsed", label: "Last Used" },
                      ],
                      onValueChange: setSetupSortBy,
                      width: "w-[160px]",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 space-y-6">
              {isLoading ? (
                <div className="text-center p-8 text-zinc-400">
                  <p>Loading setup data...</p>
                </div>
              ) : (
                sortedSetups.map((setup) => (
                <ExpandableCard
                  key={setup.id}
                  id={`setup-${setup.id}`}
                  title={setup.name}
                  subtitle={setup.car}
                  badges={[
                    { text: setup.track },
                    { text: `${setup.sessions} Sessions`, variant: "secondary" },
                  ]}
                  metrics={[
                    { value: setup.bestLapTime || "N/A", label: "Best Lap", color: "font-mono" },
                    { value: setup.validLaps, label: "Valid Laps", color: "text-green-600" },
                    { value: `${setup.consistency.toFixed(1)}%`, label: "Consistency" },
                    { value: `${setup.totalDistance.toFixed(0)}km`, label: "Distance" },
                  ]}
                  isExpanded={expandedCard === `setup-${setup.id}`}
                  onToggle={() => handleCardClick(`setup-${setup.id}`)}
                >
                  <ExpandableTabs
                    value={activeCardTab}
                    onValueChange={setActiveCardTab}
                    tabs={[
                      {
                        value: "performance",
                        label: "Performance",
                        content: (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold font-mono">{setup.optimalTime || "N/A"}</div>
                                <div className="text-xs text-zinc-500">Optimal Time</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{setup.fuelEfficiency.toFixed(1)}L</div>
                                <div className="text-xs text-zinc-500">Fuel/100km</div>
                              </div>
                            </div>

                            <PerformanceMetrics
                              metrics={[
                                {
                                  label: "Consistency",
                                  value: setup.consistency,
                                  description: "Laps within 1% of best time",
                                },
                                {
                                  label: "Reliability",
                                  value: setup.reliability,
                                  description: "Valid lap completion rate",
                                },
                                {
                                  label: "Fuel Efficiency",
                                  value: setup.fuelEfficiency,
                                  description: "Fuel consumption per 100km",
                                },
                              ]}
                              columns={3}
                            />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span>Last used: {setup.lastUsed}</span>
                                <span>•</span>
                                <span>Created: {setup.dateCreated}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Navigate to telemetry page
                                  }}
                                >
                                  <Target className="w-4 h-4 mr-2" />
                                  View Best Lap
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Navigate to telemetry page
                                  }}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  View Telemetry
                                </Button>
                              </div>
                            </div>
                          </>
                        ),
                      },
                      {
                        value: "configuration",
                        label: "Configuration",
                        content: (
                          <div className="space-y-4">
                            <h4 className="font-medium">Setup Configuration</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {setup.setupDetails && Object.entries(setup.setupDetails).map(([key, value]) => (
                                <div key={key} className="p-3 bg-muted/20 rounded-lg">
                                  <div className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                  <div className="text-xs text-zinc-400 mt-1">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </div>
                                </div>
                              ))}
                              {(!setup.setupDetails || Object.keys(setup.setupDetails).length === 0) && (
                                <div className="col-span-full text-center p-8 text-zinc-400">
                                  <p>No setup configuration details available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      },
                      {
                        value: "conditions",
                        label: "Conditions",
                        content: (
                          <div className="space-y-4">
                            <h4 className="font-medium">Track Conditions</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {setup.conditions && Object.entries(setup.conditions).map(([key, value]) => (
                                <div key={key} className="p-3 bg-muted/20 rounded-lg">
                                  <div className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                  <div className="text-xs text-zinc-400 mt-1">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </div>
                                </div>
                              ))}
                              {(!setup.conditions || Object.keys(setup.conditions).length === 0) && (
                                <div className="col-span-full text-center p-8 text-zinc-400">
                                  <p>No track conditions data available</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      },
                    ]}
                  />
                </ExpandableCard>
              ))
              )}

              {!isLoading && sortedSetups.length === 0 && (
                <EmptyState icon={Settings} message="No setups found matching your filters." />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </FeatureLayout>
  )
}
