"use client"

import { useState } from "react"
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

const mockTracks = [
  {
    id: 1,
    name: "Nürburgring GP",
    country: "Germany",
    length: 5.148,
    sessions: 24,
    cars: [
      {
        name: "911 GT3 RS",
        validLaps: 156,
        invalidLaps: 18,
        bestLap: "1:43.891",
        avgLap: "1:47.234",
        sessions: 18,
        distance: 803.1,
      },
      {
        name: "718 Cayman GT4",
        validLaps: 67,
        invalidLaps: 5,
        bestLap: "1:46.223",
        avgLap: "1:49.567",
        sessions: 6,
        distance: 370.2,
      },
    ],
    totalValidLaps: 223,
    totalInvalidLaps: 23,
    raceSessions: 8,
    practiceSessions: 16,
    wins: 3,
    podiums: 6,
    avgLapTime: "1:47.234",
    bestLapTime: "1:43.891",
    optimalTime: "1:43.102",
    worldRecord: "1:41.770",
    totalDistance: 1173.3,
    recentSessions: [
      { date: "2024-01-15", type: "Race", laps: 28, bestLap: "1:43.891", car: "911 GT3 RS" },
      { date: "2024-01-12", type: "Practice", laps: 15, bestLap: "1:44.567", car: "911 GT3 RS" },
      { date: "2024-01-08", type: "Qualifying", laps: 8, bestLap: "1:44.123", car: "911 GT3 RS" },
    ],
    lapTimeProgression: [
      { session: 1, bestLap: 108.5, avgLap: 112.3 },
      { session: 5, bestLap: 106.2, avgLap: 109.8 },
      { session: 10, bestLap: 104.8, avgLap: 108.1 },
      { session: 15, bestLap: 103.9, avgLap: 107.2 },
      { session: 20, bestLap: 103.891, avgLap: 107.234 },
    ],
  },
  {
    id: 2,
    name: "Silverstone Circuit",
    country: "United Kingdom",
    length: 5.891,
    sessions: 18,
    cars: [
      {
        name: "911 GT3 RS",
        validLaps: 98,
        invalidLaps: 12,
        bestLap: "1:49.223",
        avgLap: "1:52.445",
        sessions: 18,
        distance: 577.3,
      },
    ],
    totalValidLaps: 98,
    totalInvalidLaps: 12,
    raceSessions: 6,
    practiceSessions: 12,
    wins: 2,
    podiums: 4,
    avgLapTime: "1:52.445",
    bestLapTime: "1:49.223",
    optimalTime: "1:48.567",
    worldRecord: "1:46.286",
    totalDistance: 577.3,
    recentSessions: [
      { date: "2024-01-10", type: "Race", laps: 22, bestLap: "1:49.223", car: "911 GT3 RS" },
      { date: "2024-01-07", type: "Practice", laps: 18, bestLap: "1:50.445", car: "911 GT3 RS" },
    ],
    lapTimeProgression: [
      { session: 1, bestLap: 115.2, avgLap: 118.9 },
      { session: 5, bestLap: 112.8, avgLap: 116.2 },
      { session: 10, bestLap: 110.5, avgLap: 114.1 },
      { session: 15, bestLap: 109.223, avgLap: 112.445 },
    ],
  },
  {
    id: 3,
    name: "Spa-Francorchamps",
    country: "Belgium",
    length: 7.004,
    sessions: 12,
    cars: [
      {
        name: "911 GT3 RS",
        validLaps: 84,
        invalidLaps: 8,
        bestLap: "2:18.445",
        avgLap: "2:21.789",
        sessions: 12,
        distance: 588.3,
      },
    ],
    totalValidLaps: 84,
    totalInvalidLaps: 8,
    raceSessions: 4,
    practiceSessions: 8,
    wins: 1,
    podiums: 2,
    avgLapTime: "2:21.789",
    bestLapTime: "2:18.445",
    optimalTime: "2:17.892",
    worldRecord: "2:15.333",
    totalDistance: 588.3,
    recentSessions: [{ date: "2024-01-05", type: "Race", laps: 18, bestLap: "2:18.445", car: "911 GT3 RS" }],
    lapTimeProgression: [
      { session: 1, bestLap: 145.2, avgLap: 148.9 },
      { session: 5, bestLap: 142.1, avgLap: 145.3 },
      { session: 10, bestLap: 138.445, avgLap: 141.789 },
    ],
  },
]

const mockCars = [
  {
    id: 1,
    name: "911 GT3 RS",
    manufacturer: "Porsche",
    totalDistance: 2847.6,
    validLaps: 338,
    invalidLaps: 38,
    sessions: 42,
    wins: 6,
    podiums: 12,
    topTrack: "Nürburgring GP",
    topTrackLaps: 156,
    topTrackDistance: 803.1,
    avgLapTime: "1:51.234",
    bestOverallLap: "1:43.891",
    reliability: 89.9, // valid laps percentage
    winRate: 14.3, // wins/sessions percentage
    podiumRate: 28.6, // podiums/sessions percentage
    trackPerformance: [
      {
        track: "Nürburgring GP",
        country: "Germany",
        sessions: 18,
        validLaps: 156,
        invalidLaps: 18,
        distance: 803.1,
        bestLap: "1:43.891",
        avgLap: "1:47.234",
        wins: 3,
        podiums: 6,
        worldRecord: "1:41.770",
        improvement: -3.2, // seconds improved over time
      },
      {
        track: "Silverstone Circuit",
        country: "United Kingdom",
        sessions: 18,
        validLaps: 98,
        invalidLaps: 12,
        distance: 577.3,
        bestLap: "1:49.223",
        avgLap: "1:52.445",
        wins: 2,
        podiums: 4,
        worldRecord: "1:46.286",
        improvement: -2.8,
      },
      {
        track: "Spa-Francorchamps",
        country: "Belgium",
        sessions: 12,
        validLaps: 84,
        invalidLaps: 8,
        distance: 588.3,
        bestLap: "2:18.445",
        avgLap: "2:21.789",
        wins: 1,
        podiums: 2,
        worldRecord: "2:15.333",
        improvement: -4.1,
      },
    ],
    recentSessions: [
      { date: "2024-01-15", track: "Nürburgring GP", type: "Race", result: "P1", bestLap: "1:43.891" },
      { date: "2024-01-12", track: "Nürburgring GP", type: "Practice", result: "-", bestLap: "1:44.567" },
      { date: "2024-01-10", track: "Silverstone Circuit", type: "Race", result: "P2", bestLap: "1:49.223" },
    ],
  },
  {
    id: 2,
    name: "718 Cayman GT4",
    manufacturer: "Porsche",
    totalDistance: 1234.8,
    validLaps: 89,
    invalidLaps: 12,
    sessions: 18,
    wins: 1,
    podiums: 3,
    topTrack: "Nürburgring GP",
    topTrackLaps: 67,
    topTrackDistance: 370.2,
    avgLapTime: "1:49.567",
    bestOverallLap: "1:46.223",
    reliability: 88.1,
    winRate: 5.6,
    podiumRate: 16.7,
    trackPerformance: [
      {
        track: "Nürburgring GP",
        country: "Germany",
        sessions: 6,
        validLaps: 67,
        invalidLaps: 5,
        distance: 370.2,
        bestLap: "1:46.223",
        avgLap: "1:49.567",
        wins: 1,
        podiums: 2,
        worldRecord: "1:41.770",
        improvement: -1.8,
      },
      {
        track: "Brands Hatch",
        country: "United Kingdom",
        sessions: 12,
        validLaps: 22,
        invalidLaps: 7,
        distance: 864.6,
        bestLap: "1:24.567",
        avgLap: "1:26.789",
        wins: 0,
        podiums: 1,
        worldRecord: "1:22.015",
        improvement: -1.2,
      },
    ],
    recentSessions: [
      { date: "2024-01-08", track: "Nürburgring GP", type: "Race", result: "P1", bestLap: "1:46.223" },
      { date: "2024-01-05", track: "Brands Hatch", type: "Practice", result: "-", bestLap: "1:25.445" },
    ],
  },
]

const mockSetups = [
  {
    id: 1,
    name: "Qualifying Setup",
    category: "Qualifying",
    car: "911 GT3 RS",
    track: "Nürburgring GP",
    bestLapTime: "1:43.891",
    avgLapTime: "1:45.234",
    optimalTime: "1:43.102",
    totalDistance: 145.2,
    laps: 28,
    validLaps: 26,
    invalidLaps: 2,
    consistency: 94.2, // percentage of laps within 1% of best
    reliability: 92.9, // valid lap percentage
    fuelEfficiency: 8.2, // L/100km
    tireWear: "Medium",
    sessions: 4,
    dateCreated: "2024-01-10",
    lastUsed: "2024-01-15",
    worldRecord: "1:41.770",
    improvements: [
      { session: 1, bestLap: 105.234, avgLap: 107.891 },
      { session: 2, bestLap: 104.567, avgLap: 106.234 },
      { session: 3, bestLap: 104.123, avgLap: 105.789 },
      { session: 4, bestLap: 103.891, avgLap: 105.234 },
    ],
    setupDetails: {
      frontWing: 8,
      rearWing: 6,
      suspension: "Stiff",
      gearing: "Short",
      brakeBalance: 52,
      differential: "Aggressive",
    },
    conditions: {
      weather: "Dry",
      temperature: 22,
      trackTemp: 35,
      grip: "High",
    },
  },
  {
    id: 2,
    name: "Race Setup",
    category: "Race",
    car: "911 GT3 RS",
    track: "Nürburgring GP",
    bestLapTime: "1:44.567",
    avgLapTime: "1:46.123",
    optimalTime: "1:43.890",
    totalDistance: 289.4,
    laps: 56,
    validLaps: 54,
    invalidLaps: 2,
    consistency: 96.8,
    reliability: 96.4,
    fuelEfficiency: 7.8,
    tireWear: "Low",
    sessions: 8,
    dateCreated: "2024-01-08",
    lastUsed: "2024-01-15",
    worldRecord: "1:41.770",
    improvements: [
      { session: 1, bestLap: 106.789, avgLap: 108.456 },
      { session: 3, bestLap: 105.234, avgLap: 107.123 },
      { session: 5, bestLap: 104.891, avgLap: 106.567 },
      { session: 8, bestLap: 104.567, avgLap: 106.123 },
    ],
    setupDetails: {
      frontWing: 7,
      rearWing: 8,
      suspension: "Balanced",
      gearing: "Long",
      brakeBalance: 54,
      differential: "Conservative",
    },
    conditions: {
      weather: "Dry",
      temperature: 24,
      trackTemp: 38,
      grip: "Medium",
    },
  },
  {
    id: 3,
    name: "Wet Weather Setup",
    category: "Practice",
    car: "911 GT3 RS",
    track: "Silverstone Circuit",
    bestLapTime: "1:52.234",
    avgLapTime: "1:54.567",
    optimalTime: "1:51.789",
    totalDistance: 176.7,
    laps: 30,
    validLaps: 28,
    invalidLaps: 2,
    consistency: 89.3,
    reliability: 93.3,
    fuelEfficiency: 9.1,
    tireWear: "High",
    sessions: 3,
    dateCreated: "2024-01-05",
    lastUsed: "2024-01-07",
    worldRecord: "1:46.286",
    improvements: [
      { session: 1, bestLap: 115.678, avgLap: 118.234 },
      { session: 2, bestLap: 113.456, avgLap: 116.789 },
      { session: 3, bestLap: 112.234, avgLap: 114.567 },
    ],
    setupDetails: {
      frontWing: 10,
      rearWing: 12,
      suspension: "Soft",
      gearing: "Medium",
      brakeBalance: 48,
      differential: "Open",
    },
    conditions: {
      weather: "Wet",
      temperature: 18,
      trackTemp: 22,
      grip: "Low",
    },
  },
  {
    id: 4,
    name: "Endurance Setup",
    category: "Race",
    car: "718 Cayman GT4",
    track: "Nürburgring GP",
    bestLapTime: "1:46.789",
    avgLapTime: "1:48.234",
    optimalTime: "1:46.123",
    totalDistance: 412.3,
    laps: 80,
    validLaps: 78,
    invalidLaps: 2,
    consistency: 97.5,
    reliability: 97.5,
    fuelEfficiency: 6.9,
    tireWear: "Very Low",
    sessions: 6,
    dateCreated: "2024-01-03",
    lastUsed: "2024-01-08",
    worldRecord: "1:41.770",
    improvements: [
      { session: 1, bestLap: 109.234, avgLap: 111.567 },
      { session: 3, bestLap: 108.123, avgLap: 110.234 },
      { session: 6, bestLap: 106.789, avgLap: 108.234 },
    ],
    setupDetails: {
      frontWing: 6,
      rearWing: 9,
      suspension: "Medium",
      gearing: "Long",
      brakeBalance: 55,
      differential: "Balanced",
    },
    conditions: {
      weather: "Dry",
      temperature: 26,
      trackTemp: 42,
      grip: "Medium",
    },
  },
]

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

  const filteredTracks = mockTracks.filter((track) => {
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
        return Number.parseFloat(a.bestLapTime.replace(":", "")) - Number.parseFloat(b.bestLapTime.replace(":", ""))
      case "avgLapTime":
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

  const sortedCars = [...mockCars].sort((a, b) => {
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
        return (
          Number.parseFloat(a.bestOverallLap.replace(":", "")) - Number.parseFloat(b.bestOverallLap.replace(":", ""))
        )
      default:
        return 0
    }
  })

  const filteredSetups = mockSetups.filter((setup) => {
    const matchesCar =
      setupCarFilter === "all" ||
      (setupCarFilter === "911-gt3-rs" && setup.car === "911 GT3 RS") ||
      (setupCarFilter === "718-cayman-gt4" && setup.car === "718 Cayman GT4")

    const matchesTrack =
      setupTrackFilter === "all" ||
      (setupTrackFilter === "nurburgring" && setup.track === "Nürburgring GP") ||
      (setupTrackFilter === "silverstone" && setup.track === "Silverstone Circuit")

    const matchesCategory = setupCategoryFilter === "all" || setup.category === setupCategoryFilter

    return matchesCar && matchesTrack && matchesCategory
  })

  const sortedSetups = [...filteredSetups].sort((a, b) => {
    switch (setupSortBy) {
      case "bestLapTime":
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
        return "text-muted-foreground"
    }
  }

  return (
    <FeatureLayout header={<FeatureNavigation />}>
    <div className="min-h-screen">
      <div className="sticky top-0 z-50  border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Race Engineer</h1>
              <p className="text-muted-foreground text-lg">Telemetry Analytics & Performance Dashboard</p>
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
        <div className="max-w-7xl mx-auto px-6 py-4">
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

      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="tracks" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-2xl font-semibold">Track Performance Analysis</h2>

                <FilterControls
                  searchPlaceholder="Search tracks..."
                  searchValue={trackSearch}
                  onSearchChange={setTrackSearch}
                  filters={[
                    {
                      key: "country",
                      label: "Country",
                      value: trackCountryFilter,
                      options: [
                        { value: "all", label: "All Countries" },
                        { value: "Germany", label: "Germany" },
                        { value: "United Kingdom", label: "United Kingdom" },
                        { value: "Belgium", label: "Belgium" },
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
              {sortedTracks.map((track) => (
                <ExpandableCard
                  key={track.id}
                  id={`track-${track.id}`}
                  title={track.name}
                  subtitle={`${track.country} • ${track.length}km`}
                  badges={[
                    { text: `${track.totalDistance.toFixed(1)}km total` },
                    { text: `${track.sessions} Sessions`, variant: "secondary" },
                  ]}
                  metrics={[
                    { value: track.bestLapTime, label: "Best Lap", color: "font-mono" },
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
                                <div className="text-xs text-muted-foreground">Invalid Laps</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{track.avgLapTime}</div>
                                <div className="text-xs text-muted-foreground">Avg Lap</div>
                              </div>
                            </div>

                            <PerformanceMetrics
                              metrics={[
                                {
                                  label: "Performance vs World Record",
                                  value: 100 - Number.parseFloat(getPerformanceGap(track.bestLapTime, track.worldRecord)),
                                  description: `World Record: ${track.worldRecord} • Your Best: ${track.bestLapTime}`,
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
                                { label: "Best Lap", value: car.bestLap, color: "font-mono" },
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
                                { label: "Best Lap", value: session.bestLap, color: "font-mono" },
                              ],
                            })) || []}
                            emptyMessage="No recent sessions available"
                          />
                        ),
                      },
                    ]}
                  />
                </ExpandableCard>
              ))}

              {sortedTracks.length === 0 && (
                <EmptyState icon={MapPin} message="No tracks found matching your filters." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="cars" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-2xl font-semibold">Car Performance Analysis</h2>

                <FilterControls
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
                      ],
                      onValueChange: setCarSortBy,
                      width: "w-[160px]",
                    },
                  ]}
                />
              </div>
            </div>

            <div className="h-[calc(100vh-280px)] overflow-y-auto py-6 space-y-6">
              {sortedCars.map((car) => (
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
                    { value: car.bestOverallLap, label: "Best Lap", color: "font-mono" },
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
                                <div className="text-xs text-muted-foreground">Podiums</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{car.avgLapTime}</div>
                                <div className="text-xs text-muted-foreground">Avg Lap</div>
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
                                  <span className="text-sm text-muted-foreground">
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
                                      <p className="text-sm text-muted-foreground">{track.country}</p>
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
                                      <div className="font-mono text-sm">{track.bestLap}</div>
                                      <div className="text-xs text-muted-foreground">Best Lap</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.validLaps}</div>
                                      <div className="text-xs text-muted-foreground">Valid Laps</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.distance.toFixed(1)}km</div>
                                      <div className="text-xs text-muted-foreground">Distance</div>
                                    </div>
                                    <div className="text-center p-2 bg-muted/50 rounded">
                                      <div className="text-sm font-medium">{track.improvement}</div>
                                      <div className="text-xs text-muted-foreground">Improvement</div>
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
                                { label: "Best Lap", value: session.bestLap, color: "font-mono" },
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-0">
            <div className="sticky top-[184px] z-30  border-b py-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <h2 className="text-2xl font-semibold">Setup Performance Analysis</h2>

                <FilterControls
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
                        { value: "Qualifying", label: "Qualifying" },
                        { value: "Race", label: "Race" },
                        { value: "Practice", label: "Practice" },
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
              {sortedSetups.map((setup) => (
                <ExpandableCard
                  key={setup.id}
                  id={`setup-${setup.id}`}
                  title={setup.name}
                  subtitle={setup.car}
                  badges={[
                    { text: setup.category },
                    { text: setup.track },
                    { text: `${setup.sessions} Sessions`, variant: "secondary" },
                  ]}
                  metrics={[
                    { value: setup.bestLapTime, label: "Best Lap", color: "font-mono" },
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
                                <div className="text-lg font-bold font-mono">{setup.optimalTime}</div>
                                <div className="text-xs text-muted-foreground">Optimal Time</div>
                              </div>
                              <div className="text-center p-3 bg-muted/50 rounded-lg">
                                <div className="text-lg font-bold">{setup.fuelEfficiency.toFixed(1)}L</div>
                                <div className="text-xs text-muted-foreground">Fuel/100km</div>
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
                                  label: "vs World Record",
                                  value: 100 - Number.parseFloat(getPerformanceGap(setup.bestLapTime, setup.worldRecord)),
                                  description: "Gap to world record",
                                },
                              ]}
                              columns={3}
                            />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Aerodynamics</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Front Wing: {setup.setupDetails.frontWing} • Rear Wing: {setup.setupDetails.rearWing}
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Suspension</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {setup.setupDetails.suspension}
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Gearing</div>
                                <div className="text-xs text-muted-foreground mt-1">{setup.setupDetails.gearing}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Brake Balance</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {setup.setupDetails.brakeBalance}%
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Differential</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {setup.setupDetails.differential}
                                </div>
                              </div>
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
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Weather</div>
                                <div className="text-xs text-muted-foreground mt-1">{setup.conditions.weather}</div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Temperature</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Air: {setup.conditions.temperature}°C
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Track Temp</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {setup.conditions.trackTemp}°C
                                </div>
                              </div>
                              <div className="p-3 bg-muted/20 rounded-lg">
                                <div className="text-sm font-medium">Grip Level</div>
                                <div className="text-xs text-muted-foreground mt-1">{setup.conditions.grip}</div>
                              </div>
                            </div>

                            <h4 className="font-medium">Performance Progression</h4>
                            <DataList
                              items={setup.improvements?.map((session, idx) => ({
                                id: idx,
                                title: `Session ${session.session}`,
                                metrics: [
                                  { label: "Best lap", value: session.bestLap, color: "font-mono" },
                                  { label: "Avg lap", value: session.avgLap, color: "font-mono" },
                                ],
                              })) || []}
                              emptyMessage="No progression data available"
                            />
                          </div>
                        ),
                      },
                    ]}
                  />
                </ExpandableCard>
              ))}

              {sortedSetups.length === 0 && (
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
