"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { ReactSVGPanZoom, TOOL_AUTO, TOOL_PAN, TOOL_ZOOM_IN, TOOL_ZOOM_OUT } from "react-svg-pan-zoom"
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Move, MousePointer, RotateCcw } from "lucide-react"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"


interface TrackPathPoint {
  distance: number
  x: number
  y: number
}

interface HoveredData {
  distance: number
  x: number
  y: number
}

interface ZoomRange {
  min: number
  max: number
}

interface TelemetryDataSet {
  data: { x: number; y: number }[]
}

interface TrackMapProps {
  trackPathData: TrackPathPoint[]
  hoveredData: HoveredData | null
  setHoveredData: (data: HoveredData | null) => void
  zoomRange: ZoomRange
  onTrackMapError?: (error: string | null) => void
  telemetryData: {
    throttle: TelemetryDataSet
    brake: TelemetryDataSet
  } | null
  trackName?: string // Add track name prop
}

interface CarPathSegment {
  pathData: string
  color: string
}

// Track name to SVG file mapping
const TRACK_SVG_MAP: Record<string, string> = {
  'Algarve International Circuit': '/assets/tracks/6 Hours of Portimao - Algarve International Circuit.svg',
  'Fuji Speedway': '/assets/tracks/6 Hours of Fuji - Fuji Speedway.svg',
  'Imola': '/assets/tracks/6 Hours of Imola - Autodromo Enzo e Dino Ferrari.svg',
}

// Helper function to get track SVG path
const getTrackSvgPath = (trackName: string): string => {
  return TRACK_SVG_MAP[trackName] || '/assets/tracks/default-track.svg'
}

export function TrackMap({
  trackPathData,
  hoveredData,
  setHoveredData,
  zoomRange,
  onTrackMapError,
  telemetryData,
  trackName,
}: TrackMapProps) {
  const [trackPathD, setTrackPathD] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tool, setTool] = useState(TOOL_AUTO)
  const [value, setValue] = useState<any>({})
  const [isViewerReady, setIsViewerReady] = useState(false)
  const viewerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Callback ref to calculate dimensions as soon as container is available
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node
      const rect = node.getBoundingClientRect()
      setDimensions({
        width: rect.width,
        height: rect.height,
      })
    }
  }, [])

  // Update dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height,
        })
      }
    }

    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Fetch and parse SVG content to extract track path
  useEffect(() => {
    const fetchAndParseSvg = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get the SVG path based on track name
        const svgPath = trackName ? getTrackSvgPath(trackName) : '/assets/tracks/default-track.svg'
        
        const response = await fetch(svgPath)
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

        const svgText = await response.text()

        // Parse the SVG using DOMParser
        const parser = new DOMParser()
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml")

        // Look for the track outline path - try multiple possible selectors
        let trackPath = svgDoc.querySelector("#track-outline")
        if (!trackPath) {
          trackPath = svgDoc.querySelector("path")
        }
        if (!trackPath) {
          // If no path found, look for any element with a 'd' attribute
          trackPath = svgDoc.querySelector("[d]")
        }

        if (trackPath && trackPath.getAttribute("d")) {
          const pathData = trackPath.getAttribute("d")!
          setTrackPathD(pathData)
          if (onTrackMapError) {
            onTrackMapError(null) // Clear any previous errors
          }
        } else {
          throw new Error("Could not find track path data in SVG")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load and parse track map SVG"
        setError(errorMessage)
        if (onTrackMapError) {
          onTrackMapError(errorMessage)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAndParseSvg()
  }, [onTrackMapError, trackName])

  // Memoized helper function to get color based on real telemetry data
  const getPointColor = useCallback(
    (distance: number): string => {
      if (!telemetryData) {
        return "#808080" // Grey fallback if no telemetry data
      }

      // Find the closest throttle and brake data points for the given distance
      const throttlePoint = telemetryData.throttle.data.reduce((prev, curr) =>
        Math.abs(curr.x - distance) < Math.abs(prev.x - distance) ? curr : prev,
      )
      const brakePoint = telemetryData.brake.data.reduce((prev, curr) =>
        Math.abs(curr.x - distance) < Math.abs(prev.x - distance) ? curr : prev,
      )

      // Use thresholds to avoid noise
      if (brakePoint && brakePoint.y > 5) {
        return "#DC3545" // Red for braking
      }
      if (throttlePoint && throttlePoint.y > 5) {
        return "#198754" // Green for throttle
      }
      return "#808080" // Grey for coasting
    },
    [telemetryData],
  )

  // Memoized car path segments to prevent unnecessary recalculation
  const carPathSegments = useMemo((): CarPathSegment[] => {
    if (trackPathData.length < 2) return []

    const segments: CarPathSegment[] = []
    let currentPath = `M ${trackPathData[0].x} ${trackPathData[0].y}`
    let currentColor = getPointColor(trackPathData[0].distance)

    for (let i = 1; i < trackPathData.length; i++) {
      const prevPoint = trackPathData[i - 1]
      const currentPoint = trackPathData[i]
      const pointColor = getPointColor(currentPoint.distance)

      if (pointColor !== currentColor) {
        // Finish the old segment
        segments.push({ pathData: currentPath, color: currentColor })
        // Start a new segment that connects seamlessly from the previous point
        currentPath = `M ${prevPoint.x} ${prevPoint.y}`
        currentColor = pointColor
      }

      // Add the current point to the path
      currentPath += ` L ${currentPoint.x} ${currentPoint.y}`
    }

    // Add the final remaining segment
    segments.push({ pathData: currentPath, color: currentColor })

    return segments
  }, [trackPathData, getPointColor])

  // Memoized car path rendering
  const carPathElements = useMemo(() => {
    return carPathSegments.map((segment, index) => (
      <path
        key={index}
        d={segment.pathData}
        fill="none"
        stroke={segment.color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    ))
  }, [carPathSegments])

  // Calculate view box based on zoom range
  const viewBox = useMemo(() => {
    
    if (trackPathData.length === 0) {
      return "-500 -750 750 1250" // Default view box
    }

    // Filter track path data to only include points within the zoom range
    const visiblePoints = trackPathData.filter(
      point => point.distance >= zoomRange.min && point.distance <= zoomRange.max
    )

    // If no points in zoom range or if zoom range covers the entire track, use all track data
    if (visiblePoints.length === 0 || (zoomRange.min <= 0 && zoomRange.max >= 4000)) {
      const allXCoords = trackPathData.map(p => p.x)
      const allYCoords = trackPathData.map(p => p.y)
      
      const minX = Math.min(...allXCoords)
      const maxX = Math.max(...allXCoords)
      const minY = Math.min(...allYCoords)
      const maxY = Math.max(...allYCoords)

      const padding = 100
      const width = maxX - minX + (padding * 2)
      const height = maxY - minY + (padding * 2)

      const calculatedViewBox = `${minX - padding} ${minY - padding} ${width} ${height}`
      return calculatedViewBox
    }

    // Calculate bounding box of visible points
    const xCoords = visiblePoints.map(p => p.x)
    const yCoords = visiblePoints.map(p => p.y)
    
    const minX = Math.min(...xCoords)
    const maxX = Math.max(...xCoords)
    const minY = Math.min(...yCoords)
    const maxY = Math.max(...yCoords)

    // Add padding around the bounding box
    const padding = 50
    const width = maxX - minX + (padding * 2)
    const height = maxY - minY + (padding * 2)

    const calculatedViewBox = `${minX - padding} ${minY - padding} ${width} ${height}`
    return calculatedViewBox
  }, [trackPathData, zoomRange])

  // Reset track map view when zoom range changes
  useEffect(() => {
    if (viewerRef.current && isViewerReady) {
      // Small delay to ensure the viewBox has updated
      setTimeout(() => {
        viewerRef.current.fitToViewer()
      }, 100)
    }
  }, [viewBox, isViewerReady, zoomRange])

  // Initial fit when viewer is ready and data is loaded
  useEffect(() => {
    
    // Trigger fit when data is loaded and component is rendered, regardless of onLoad
    if (viewerRef.current && trackPathData.length > 0 && !loading) {
      
      // Call fitToViewer multiple times with increasing delays to ensure proper alignment
      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current.fitToViewer()
        }
      }, 200)
      
      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current.fitToViewer()
        }
      }, 500)
      
      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current.fitToViewer()
        }
      }, 1000)
      
      // Remove the manual view setting as it's not needed
    }
  }, [trackPathData.length, loading, dimensions])

  // Pan and zoom control handlers
  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomOnViewerCenter(1.2)
    }
  }

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomOnViewerCenter(0.8)
    }
  }

  const handleFitToViewer = () => {
    if (viewerRef.current) {
      viewerRef.current.fitToViewer()
    }
  }

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.fitToViewer()
      setValue({})
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">Loading track map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Alert className="bg-red-950/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-white">
            <strong>Error loading track map:</strong>
            <br />
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div ref={setContainerRef} className="h-full relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700 rounded-lg p-1">
          <Button
            variant={tool === TOOL_AUTO ? "default" : "ghost"}
            size="sm"
            onClick={() => setTool(TOOL_AUTO)}
            className={`p-2 h-8 w-8 ${
              tool === TOOL_AUTO ? "bg-red-600 hover:bg-red-700" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
            title="Auto (Pan & Zoom)"
          >
            <MousePointer className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === TOOL_PAN ? "default" : "ghost"}
            size="sm"
            onClick={() => setTool(TOOL_PAN)}
            className={`p-2 h-8 w-8 ${
              tool === TOOL_PAN ? "bg-red-600 hover:bg-red-700" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
            title="Pan"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === TOOL_ZOOM_IN ? "default" : "ghost"}
            size="sm"
            onClick={() => setTool(TOOL_ZOOM_IN)}
            className={`p-2 h-8 w-8 ${
              tool === TOOL_ZOOM_IN ? "bg-red-600 hover:bg-red-700" : "text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === TOOL_ZOOM_OUT ? "default" : "ghost"}
            size="sm"
            onClick={() => setTool(TOOL_ZOOM_OUT)}
            className={`p-2 h-8 w-8 ${
              tool === TOOL_ZOOM_OUT
                ? "bg-red-600 hover:bg-red-700"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800"
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="border-zinc-600 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs px-2 py-1 h-7"
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="border-zinc-600 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs px-2 py-1 h-7"
          >
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFitToViewer}
            className="border-zinc-600 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs px-2 py-1 h-7"
          >
            Fit to View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="border-zinc-600 bg-zinc-900/90 text-zinc-300 hover:text-white text-xs px-2 py-1 h-7"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Distance indicator - Only show when hovering and stable */}
      {hoveredData && (
        <div className="absolute top-4 right-4 z-10 bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2">
          <div className="text-white font-mono text-sm">{Math.round(hoveredData.distance)}m</div>
        </div>
      )}

      {/* Color Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-zinc-900/90 border border-zinc-700 rounded-lg px-3 py-2">
        <div className="flex items-center gap-4 text-xs text-white">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Throttle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Brake</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Coast</span>
          </div>
        </div>
      </div>

      {/* SVG Pan Zoom Viewer */}
      <ReactSVGPanZoom
        ref={viewerRef}
        width={dimensions.width}
        height={dimensions.height}
        tool={tool}
        onChangeTool={setTool}
        value={value}
        onChangeValue={setValue}
        detectAutoPan={false}
        background="transparent"
        SVGBackground="transparent"
        miniatureProps={{ position: "none" }}
        toolbarProps={{ position: "none" }}
        customToolbar={() => <></>}
        scaleFactorMin={0.1}
        scaleFactorMax={10}
        className="border-0"
        onLoad={() => {
          setIsViewerReady(true)
        }}
      >
        <svg viewBox={viewBox} style={{ overflow: "visible" }}>
          {/* 1. Render the track outline from the extracted path data */}
          {trackPathD && <path d={trackPathD} fill="none" stroke="#555" strokeWidth="2" opacity="0.8" />}

          {/* 2. Render the car path overlay on top */}
          <g id="car-path">{carPathElements}</g>

          {/* 3. Render the car position marker - Only when hovering */}
          {hoveredData && (
            <circle
              cx={hoveredData.x}
              cy={hoveredData.y}
              r="8"
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
            />
          )}
        </svg>
      </ReactSVGPanZoom>
    </div>
  )
}
