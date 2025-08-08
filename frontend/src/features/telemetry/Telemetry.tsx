import { Loader2, AlertCircle, Badge, LayoutGrid, Settings, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { useChartConfig } from "../../hooks/useChartConfig"
import { ConfigModal } from "./ConfigModal"
import { FeatureNavigation } from "../../components/navigation/FeatureNavigation"
import { TelemetryChart } from "./TelemetryChart"
import { TrackMap } from "./TrackMap"
import { FeatureLayout } from "../../components/layout/FeatureLayout"
import { LapData } from "../../shared/types"
import { api } from "../../services/api"


// TypeScript interfaces
interface TelemetryPoint {
  x: number // Distance in meters
  y: number // Value (e.g., speed, RPM)
}

interface TelemetryDataSet {
  label: string
  data: TelemetryPoint[]
  borderColor: string
  interpolate?: boolean
  stepped?: boolean
}

interface TelemetryData {
  speed: TelemetryDataSet
  throttle: TelemetryDataSet
  brake: TelemetryDataSet
  steering: TelemetryDataSet
  gear: TelemetryDataSet
  rpm: TelemetryDataSet
  tc: TelemetryDataSet
  abs: TelemetryDataSet
}

interface TrackPathPoint {
  distance: number
  x: number // SVG coordinate
  y: number // SVG coordinate
}

type TrackPathData = TrackPathPoint[]

interface HoveredData {
  distance: number
  x: number
  y: number
}

interface ZoomRange {
  min: number
  max: number
}

type ChartHeight = "compact" | "comfortable" | "expanded"

interface ITelemetryProps {
    sessionId: number
    lapNumber: number
    onBackToSessionDetail: () => void
}

export default function Telemetry({ sessionId, lapNumber, onBackToSessionDetail }: ITelemetryProps) {


  // State management - Single source of truth for hover distance
  const [telemetryData, setTelemetryData] = useState<TelemetryData | null>(null)
  const [trackPathData, setTrackPathData] = useState<TrackPathData>([])
  const [hoveredDistance, setHoveredDistance] = useState<number | null>(null) // Single source of truth
  const [zoomRange, setZoomRange] = useState<ZoomRange>({ min: 0, max: 3806.8 })
  const [layout, setLayout] = useState<"mapRight" | "mapLeft">("mapRight")
  const [chartHeight, setChartHeight] = useState<ChartHeight>("comfortable")
  const [telemetryError, setTelemetryError] = useState<string | null>(null)
  const [trackPathError, setTrackPathError] = useState<string | null>(null)
  const [trackMapError, setTrackMapError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  // Refs for optimization
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastHoverDistanceRef = useRef<number | null>(null)
  const trackPathLookupRef = useRef<Map<number, TrackPathPoint>>(new Map())

  // Custom hook for chart configuration
  const { chartConfig, saveChartConfig } = useChartConfig()

  // Build optimized lookup map for track path data
  useEffect(() => {
    if (trackPathData.length > 0) {
      const lookupMap = new Map<number, TrackPathPoint>()

      // Create a lookup map with rounded distances for faster access
      trackPathData.forEach((point) => {
        const roundedDistance = Math.round(point.distance)
        lookupMap.set(roundedDistance, point)
      })

      trackPathLookupRef.current = lookupMap
    }
  }, [trackPathData])

  // Memoized car position calculation - only recalculates when distance or track data changes
  const hoveredData = useMemo((): HoveredData | null => {
    if (hoveredDistance === null || trackPathData.length === 0) {
      return null
    }

    // Use optimized lookup first
    const roundedDistance = Math.round(hoveredDistance)
    let closestPoint = trackPathLookupRef.current.get(roundedDistance)

    // If not found in lookup, fall back to linear search
    if (!closestPoint) {
      closestPoint = trackPathData.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.distance - hoveredDistance)
        const currDiff = Math.abs(curr.distance - hoveredDistance)
        return currDiff < prevDiff ? curr : prev
      })
    }

    return {
      distance: closestPoint.distance,
      x: closestPoint.x,
      y: closestPoint.y,
    }
  }, [hoveredDistance, trackPathData])

  // Optimized chart hover handler with debouncing
  const handleChartHover = useCallback((distance: number | null) => {
    // Clear any pending updates
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Skip if distance hasn't changed significantly (reduce noise)
    if (distance !== null && lastHoverDistanceRef.current !== null) {
      const threshold = 3 // 3 meter threshold to reduce noise
      if (Math.abs(distance - lastHoverDistanceRef.current) < threshold) {
        return
      }
    }

    // Debounce the update to prevent excessive re-renders
    hoverTimeoutRef.current = setTimeout(() => {
      if (distance !== lastHoverDistanceRef.current) {
        lastHoverDistanceRef.current = distance
        setHoveredDistance(distance) // Single state update
      }
    }, 16) // ~60fps throttling
  }, [])

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setTelemetryError(null)
        setTrackPathError(null)
        setTrackMapError(null)

        const promises = []

        // Fetch telemetry data
        promises.push(
          fetch("https://xttutongfcumlplt.public.blob.vercel-storage.com/telemetryJsonData.json")
            .then(async (response) => {
              if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              const data = await response.json()
              setTelemetryData(data)

              // Set initial zoom range based on telemetry data
              if (data.speed?.data?.length > 0) {
                const minDistance = data.speed.data[0].x
                const maxDistance = data.speed.data[data.speed.data.length - 1].x
                setZoomRange({ min: minDistance, max: maxDistance })
              }
            })
            .catch((err) => {
              setTelemetryError(err instanceof Error ? err.message : "Failed to fetch telemetry data")
            }),
        )

        // Fetch track path data
        promises.push(
          fetch("https://xttutongfcumlplt.public.blob.vercel-storage.com/trackPathJsonData.json")
            .then(async (response) => {
              if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              const data = await response.json()
              setTrackPathData(data)
            })
            .catch((err) => {
              setTrackPathError(err instanceof Error ? err.message : "Failed to fetch track path data")
            }),
        )

        // Wait for all requests to complete
        await Promise.allSettled(promises)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sessionId, lapNumber])

  // Chart zoom handlers
  const handleZoomIn = useCallback(() => {
    const range = zoomRange.max - zoomRange.min
    const center = (zoomRange.min + zoomRange.max) / 2
    const newRange = range * 0.7 // Zoom in by 30%
    setZoomRange({
      min: center - newRange / 2,
      max: center + newRange / 2,
    })
  }, [zoomRange])

  const handleZoomOut = useCallback(() => {
    const range = zoomRange.max - zoomRange.min
    const center = (zoomRange.min + zoomRange.max) / 2
    const newRange = range * 1.4 // Zoom out by 40%
    setZoomRange({
      min: Math.max(0, center - newRange / 2),
      max: Math.min(3806.8, center + newRange / 2),
    })
  }, [zoomRange])

  const handleResetZoom = useCallback(() => {
    if (telemetryData?.speed?.data?.length > 0) {
      const minDistance = telemetryData.speed.data[0].x
      const maxDistance = telemetryData.speed.data[telemetryData.speed.data.length - 1].x
      setZoomRange({ min: minDistance, max: maxDistance })
    }
  }, [telemetryData])

  const handleZoomComplete = useCallback((min: number, max: number) => {
    setZoomRange({ min, max })
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Get chart height in pixels
  const getChartHeight = () => {
    switch (chartHeight) {
      case "compact":
        return 150
      case "comfortable":
        return 200
      case "expanded":
        return 300
      default:
        return 200
    }
  }

  // Get visible charts based on configuration
  const visibleCharts = useMemo(() => chartConfig.filter((chart) => chart.visible), [chartConfig])

  // Memoize telemetry data for TrackMap to prevent unnecessary re-renders
  const trackMapTelemetryData = useMemo(() => {
    if (!telemetryData) return null
    return {
      throttle: telemetryData.throttle,
      brake: telemetryData.brake,
    }
  }, [telemetryData])

  const [apiSelectedLap, setApiSelectedLap] = useState<LapData | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState(false);
  interface TelemetryData {
    [channelName: string]: { x: number; y: number }[];
}
  useEffect(() => {
    if (!lapNumber) { // Guard against missing ID
      setTelemetry(null);
      return;
    }
    
    setIsTelemetryLoading(true);
    api.telemetry.getLapTelemetry(lapNumber)
      .then(data => {
        setTelemetry(data);
        console.log(data);
      })
      .catch(err => console.error("Failed to fetch telemetry:", err))
      .finally(() => setIsTelemetryLoading(false));
    }, [apiSelectedLap?.id]); // Depend on the ID to ensure re-fetch
    

  if (loading) {
    return (
       <FeatureLayout header={<FeatureNavigation />}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg">Loading telemetry data...</p>
            <p className="text-zinc-400 text-sm">
              {sessionId && lapNumber ? `Session ${sessionId}, Lap ${lapNumber}` : "Fetching remote data"}
            </p>
          </div>
        </div>
        </FeatureLayout>
    )
  }

  // Show specific error alerts for each failed request
  const hasErrors = telemetryError || trackPathError || trackMapError

  if (hasErrors) {
    return (
      <FeatureLayout header={<FeatureNavigation />}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl space-y-4">
            {telemetryError && (
              <Alert className="bg-red-950/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <strong>Telemetry Data Error:</strong>
                  <br />
                  {telemetryError}
                  <br />
                  <span className="text-xs text-zinc-400 mt-1 block">URL: telemetryJsonData.json</span>
                </AlertDescription>
              </Alert>
            )}

            {trackPathError && (
              <Alert className="bg-red-950/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <strong>Track Path Data Error:</strong>
                  <br />
                  {trackPathError}
                  <br />
                  <span className="text-xs text-zinc-400 mt-1 block">URL: trackPathJsonData.json</span>
                </AlertDescription>
              </Alert>
            )}

            {trackMapError && (
              <Alert className="bg-red-950/50 border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  <strong>Track Map SVG Error:</strong>
                  <br />
                  {trackMapError}
                  <br />
                  <span className="text-xs text-zinc-400 mt-1 block">URL: bahrain-paddock-track-map.svg</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center pt-4">
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                Retry Loading
              </Button>
            </div>
          </div>
        </div>
      </FeatureLayout>
    )
  }

  if (!telemetryData && !telemetryError) {
    return (
        <FeatureLayout header={<FeatureNavigation />}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-lg">No telemetry data available</p>
        </div>
      </FeatureLayout>
    )
  }


  return (
    <FeatureLayout header={<FeatureNavigation />}>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full px-6 py-6 flex flex-col">
          {/* Header */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Race Engineer</h1>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span>Bahrain Paddock Circuit</span>
                  <span>•</span>
                  <span>Porsche 911 GT3 R</span>
                  {sessionId && lapNumber && (
                    <>
                      <span>•</span>
                      <Badge variant="default" className="bg-red-600">
                        Session {sessionId}, Lap {lapNumber}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLayout(layout === "mapRight" ? "mapLeft" : "mapRight")}
                  className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Toggle Layout
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>

                <div className="flex items-center border border-zinc-600 rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-none border-r border-zinc-600"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-none border-r border-zinc-600"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetZoom}
                    className="text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-none"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={chartHeight === "compact" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHeight("compact")}
                    className={
                      chartHeight === "compact"
                        ? "bg-red-600"
                        : "border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                    }
                  >
                    Compact
                  </Button>
                  <Button
                    variant={chartHeight === "comfortable" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHeight("comfortable")}
                    className={
                      chartHeight === "comfortable"
                        ? "bg-red-600"
                        : "border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                    }
                  >
                    Comfortable
                  </Button>
                  <Button
                    variant={chartHeight === "expanded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartHeight("expanded")}
                    className={
                      chartHeight === "expanded"
                        ? "bg-red-600"
                        : "border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
                    }
                  >
                    Expanded
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout */}
          <div className={`flex-1 flex gap-6 min-h-0 ${layout === "mapLeft" ? "flex-row-reverse" : ""}`}>
            {/* Track Map */}
            <div className="w-1/2 min-h-0">
              <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-white">Track Map</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <TrackMap
                    trackPathData={trackPathData}
                    hoveredData={hoveredData}
                    setHoveredData={() => {}} // No direct interaction with track map
                    zoomRange={zoomRange}
                    onTrackMapError={setTrackMapError}
                    telemetryData={trackMapTelemetryData}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="w-1/2 min-h-0 overflow-y-auto">
              <div className="space-y-4 pr-2">
                {visibleCharts.map((chartConfig) => {
                  const dataSet = telemetryData[chartConfig.id as keyof TelemetryData]
                  if (!dataSet) return null

                  return (
                    <TelemetryChart
                      key={chartConfig.id}
                      title={dataSet.label}
                      data={dataSet}
                      height={getChartHeight()}
                      hoveredDistance={hoveredDistance} // Pass distance instead of full data
                      zoomRange={zoomRange}
                      onZoomComplete={handleZoomComplete}
                      onHover={handleChartHover}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        chartConfig={chartConfig}
        onSave={saveChartConfig}
      />
    </FeatureLayout>
  )
}
