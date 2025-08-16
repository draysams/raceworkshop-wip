"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "../../components/ui/button"
import { useViewManager } from "../../hooks/useViewManager"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"
import { api } from "../../services/api"
import type { TrackStats, CarStatsForTrack } from "../../shared/types"



export default function TrackCarStats() {
  const [selectedTrack, setSelectedTrack] = useState<number | null>(null)
  const viewManager = useViewManager()

  // Real data state
  const [trackStats, setTrackStats] = useState<TrackStats[]>([])
  const [carStatsByTrack, setCarStatsByTrack] = useState<Record<number, CarStatsForTrack[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data fetching logic
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch track stats
        const tracks = await api.trackCarStats.getTrackStats()
        setTrackStats(tracks)
        
      } catch (err) {
        console.error("Error fetching track stats:", err)
        setError("Failed to load track statistics")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Fetch car stats when a track is selected
  useEffect(() => {
    if (!selectedTrack) return
    
    const fetchCarStats = async () => {
      try {
        const cars = await api.trackCarStats.getCarStatsForTrack(selectedTrack)
        setCarStatsByTrack(prev => ({
          ...prev,
          [selectedTrack]: cars
        }))
      } catch (err) {
        console.error("Error fetching car stats for track:", err)
        setError("Failed to load car statistics")
      }
    }
    
    fetchCarStats()
  }, [selectedTrack])

  const selectedTrackData = selectedTrack ? trackStats.find((t) => t.id === selectedTrack) : null
  const carsForTrack = selectedTrack ? carStatsByTrack[selectedTrack] || [] : []

  // Group cars by class
  const carsByClass = carsForTrack.reduce(
    (acc, car) => {
      if (!acc[car.class]) {
        acc[car.class] = []
      }
      acc[car.class].push(car)
      return acc
    },
    {} as Record<string, CarStatsForTrack[]>,
  )

  const getStatColor = (value: number, type: "good" | "bad" | "neutral") => {
    if (value === 0) return "text-zinc-300"
    if (type === "good" && value > 0) return "text-green-400"
    if (type === "bad" && value > 0) return "text-red-400"
    return "text-white"
  }

  const getStatBg = (value: number, type: "good" | "bad" | "neutral") => {
    if (value === 0) return "bg-muted/20"
    if (type === "good" && value > 0) return "bg-green-500/20"
    if (type === "bad" && value > 0) return "bg-red-500/20"
    return "bg-muted/10"
  }

  return (
    <FeatureLayout header={<FeatureNavigation />}>
    <div className="min-h-screen">

             {error && (
         <div className="p-6 text-center text-red-500">
           <p>{error}</p>
         </div>
       )}

       {isLoading ? (
         <div className="p-6 text-center text-zinc-300">
           <p>Loading track statistics...</p>
         </div>
       ) : (
         <div className={`flex ${selectedTrack ? "h-[calc(100vh-80px)]" : ""}`}>
           {/* Tracks Table */}
           <div className={`${selectedTrack ? "w-1/4 border-r" : "w-full"} overflow-hidden`}>
             <div className="p-6">
               <h2 className="text-xl font-semibold mb-4">TRACKS</h2>

            {!selectedTrack ? (
              // Full tracks table
              <div className="overflow-x-auto">
                <div className="min-w-[1200px]">
                                     {/* Table Header */}
                   <div className="grid grid-cols-[80px_300px_80px_80px_80px_80px_80px_100px] gap-2 mb-2 text-xs font-medium text-zinc-300 uppercase tracking-wider">
                     <div></div>
                     <div>Track</div>
                     <div className="text-center">Valid Laps</div>
                     <div className="text-center">Invalid</div>
                     <div className="text-center">Races</div>
                     <div className="text-center">Finished</div>
                     <div className="text-center">Wins</div>
                     <div className="text-center">Podiums</div>
                     <div className="text-center">Best Lap</div>
                   </div>

                  {/* Table Rows */}
                  <div className="space-y-1">
                    {trackStats.map((track) => (
                                             <div
                         key={track.id}
                         onClick={() => setSelectedTrack(track.id)}
                         className="grid grid-cols-[80px_300px_80px_80px_80px_80px_80px_80px_100px] gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                       >
                        {/* Track Icon */}
                        <div className="flex items-center justify-center">
                          <img
                            src={track.trackIcon || "/placeholder.svg"}
                            alt={`${track.name} outline`}
                            className="w-12 h-6 object-contain invert"
                          />
                        </div>

                        {/* Track Info */}
                        <div className="flex flex-col justify-center">
                          <div className="font-semibold text-zinc-100 text-sm">{track.name}</div>
                          <div className="text-xs text-zinc-300">
                            {track.distance} {track.timeSpent}
                          </div>
                        </div>

                        {/* Stats */}
                        <div
                          className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.validLaps, "good")} ${getStatColor(track.validLaps, "good")}`}
                        >
                          {track.validLaps}
                        </div>
                        <div
                          className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.invalidLaps, "bad")} ${getStatColor(track.invalidLaps, "bad")}`}
                        >
                          {track.invalidLaps}
                        </div>
                        <div
                          className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.races, "neutral")} ${getStatColor(track.races, "neutral")}`}
                        >
                          {track.races}
                        </div>
                        <div
                          className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.finished, "good")} ${getStatColor(track.finished, "good")}`}
                        >
                          {track.finished}
                        </div>
                        <div
                          className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.wins, "good")} ${getStatColor(track.wins, "good")}`}
                        >
                          {track.wins}
                        </div>
                                                 <div
                           className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(track.podiums, "good")} ${getStatColor(track.podiums, "good")}`}
                         >
                           {track.podiums}
                         </div>
                         <div className="flex flex-col items-center justify-center text-sm">
                           <div className="text-zinc-300 font-bold">{track.bestLap}</div>
                           <div className="text-xs text-zinc-300">{track.avgLap}</div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Condensed tracks list showing track icon, name, distance, and time
                             <div className="space-y-2">
                 {trackStats.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrack(track.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTrack === track.id ? "bg-red-500/20 border border-red-500/30" : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Track Icon */}
                    <div className="flex-shrink-0">
                      <img
                        src={track.trackIcon || "/placeholder.svg"}
                        alt={`${track.name} outline`}
                        className="w-10 h-5 object-contain invert"
                      />
                    </div>

                    {/* Track Info with name, distance, and time */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold  text-zinc-100 text-sm truncate">{track.name}</div>
                      <div className="text-xs text-zinc-300">{track.distance}</div>
                      <div className="text-xs text-zinc-300">{track.timeSpent}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cars Table (Split Screen) */}
        {selectedTrack && selectedTrackData && (
          <div className="w-3/4 overflow-hidden">
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl  text-zinc-100 font-semibold">{selectedTrackData.name.toUpperCase()}</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTrack(null)} className="ml-auto">
                  ✕
                </Button>
              </div>

              {Object.entries(carsByClass).map(([className, cars]) => (
                <div key={className} className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">{className} Class</h3>

                  <div className="overflow-x-auto">
                    <div className="min-w-[1000px]">
                                             {/* Cars Table Header */}
                       <div className="grid grid-cols-[60px_300px_80px_80px_80px_80px_80px_100px] gap-2 mb-2 text-xs font-medium text-zinc-300 uppercase tracking-wider">
                         <div></div>
                         <div>Car</div>
                         <div className="text-center">Valid Laps</div>
                         <div className="text-center">Invalid</div>
                         <div className="text-center">Races</div>
                         <div className="text-center">Finished</div>
                         <div className="text-center">Wins</div>
                         <div className="text-center">Podiums</div>
                         <div className="text-center">Best Lap</div>
                       </div>

                      {/* Cars Table Rows */}
                      <div className="space-y-1">
                        {cars.map((car) => (
                        <div
                             key={car.id}
                             className="grid grid-cols-[60px_300px_80px_80px_80px_80px_80px_80px_100px] gap-2 p-2 rounded-lg hover:bg-muted/50"
                           >
                            {/* Car Logo */}
                            <div className="flex items-center justify-center">
                              <img
                                src={car.logo || "/placeholder.svg"}
                                alt={`${car.manufacturer} logo`}
                                className="w-8 h-8 object-contain"
                              />
                            </div>

                            {/* Car Info */}
                            <div className="flex flex-col justify-center">
                              <div className="font-semibold  text-zinc-100 text-sm">{car.name}</div>
                              <div className="text-xs text-zinc-300">
                                {car.distance} {car.timeSpent}
                              </div>
                            </div>

                            {/* Stats */}
                            <div
                              className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.validLaps, "good")} ${getStatColor(car.validLaps, "good")}`}
                            >
                              {car.validLaps}
                            </div>
                            <div
                              className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.invalidLaps, "bad")} ${getStatColor(car.invalidLaps, "bad")}`}
                            >
                              {car.invalidLaps}
                            </div>
                            <div
                              className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.races, "neutral")} ${getStatColor(car.races, "neutral")}`}
                            >
                              {car.races}
                            </div>
                            <div
                              className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.finished, "good")} ${getStatColor(car.finished, "good")}`}
                            >
                              {car.finished}
                            </div>
                            <div
                              className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.wins, "good")} ${getStatColor(car.wins, "good")}`}
                            >
                              {car.wins}
                            </div>
                                                         <div
                               className={`flex items-center justify-center text-sm font-medium px-2 py-1 rounded ${getStatBg(car.podiums, "good")} ${getStatColor(car.podiums, "good")}`}
                             >
                               {car.podiums}
                             </div>
                             <div className="flex flex-col items-center justify-center text-sm">
                               <div className="text-zinc-300 font-bold">{car.bestLap}</div>
                               <div className="text-xs text-zinc-300">{car.avgLap}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
        )}
      </div>
    </FeatureLayout>
  )
}
