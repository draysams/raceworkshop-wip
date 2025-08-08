"use client"

import { useEffect, useRef, useCallback, useMemo } from "react"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"
import "chartjs-plugin-crosshair"
import "chartjs-plugin-zoom"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TelemetryPoint {
  x: number
  y: number
}

interface TelemetryDataSet {
  label: string
  data: TelemetryPoint[]
  borderColor: string
  interpolate?: boolean
  stepped?: boolean
}

interface ZoomRange {
  min: number
  max: number
}

interface TelemetryChartProps {
  title: string
  data: TelemetryDataSet
  height: number
  hoveredDistance: number | null // Changed from hoveredData to just distance
  zoomRange: ZoomRange
  onZoomComplete: (min: number, max: number) => void
  onHover?: (distance: number | null) => void
}

export function TelemetryChart({
  title,
  data,
  height,
  hoveredDistance,
  zoomRange,
  onZoomComplete,
  onHover,
}: TelemetryChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastHoverDistanceRef = useRef<number | null>(null)

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(
    () => ({
      datasets: [
        {
          label: data.label,
          data: data.data,
          borderColor: data.borderColor,
          backgroundColor: data.borderColor + "20",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: data.interpolate ? 0.1 : 0,
          stepped: data.stepped ? ("before" as const) : false,
        },
      ],
    }),
    [data],
  )

  // Throttled hover handler to reduce flickering
  const throttledHover = useCallback(
    (distance: number | null) => {
      // Clear any pending hover updates
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }

      // Only update if the distance has changed significantly (reduce noise)
      const threshold = 5 // 5 meter threshold
      if (distance !== null && lastHoverDistanceRef.current !== null) {
        if (Math.abs(distance - lastHoverDistanceRef.current) < threshold) {
          return // Skip update if change is too small
        }
      }

      // Debounce the hover update
      hoverTimeoutRef.current = setTimeout(() => {
        if (onHover && distance !== lastHoverDistanceRef.current) {
          lastHoverDistanceRef.current = distance
          onHover(distance)
        }
      }, 16) // ~60fps throttling
    },
    [onHover],
  )

  // Memoize chart options to prevent recreation on every render
  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      animation: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      onHover: (event, activeElements) => {
        if (chartRef.current && event.native) {
          const chart = chartRef.current
          const rect = chart.canvas.getBoundingClientRect()
          const x = event.native.clientX - rect.left

          // Convert pixel position to data value
          const dataX = chart.scales.x.getValueForPixel(x)

          // Only call throttled hover if we're within the chart bounds
          if (dataX >= zoomRange.min && dataX <= zoomRange.max) {
            throttledHover(dataX)
          } else {
            throttledHover(null)
          }
        }
      },
      onHoverLeave: () => {
        throttledHover(null)
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
        crosshair: {
          line: {
            color: "#dc2626",
            width: 2,
          },
          sync: {
            enabled: true,
            group: 1, // All charts in the same sync group
            suppressTooltips: true,
          },
        },
        zoom: {
          pan: {
            enabled: false,
          },
          zoom: {
            drag: {
              enabled: true,
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              borderColor: "rgba(220, 38, 38, 0.5)",
              borderWidth: 1,
            },
            wheel: {
              enabled: false,
            },
            onZoomComplete: ({ chart }) => {
              const { min, max } = chart.scales.x
              onZoomComplete(min, max)
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: zoomRange.min,
          max: zoomRange.max,
          display: true,
          grid: {
            color: "#374151",
          },
          ticks: {
            color: "#9ca3af",
            callback: (value) => Math.floor(Number(value)) + "m",
          },
        },
        y: {
          display: true,
          grid: {
            color: "#374151",
          },
          ticks: {
            color: "#9ca3af",
          },
        },
      },
    }),
    [zoomRange, onZoomComplete, throttledHover],
  )

  // Update chart when zoom range changes
  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current
      chart.options.scales!.x!.min = zoomRange.min
      chart.options.scales!.x!.max = zoomRange.max
      chart.update("none")
    }
  }, [zoomRange])

  // Update crosshair when hovered distance changes - this enables sync across charts
  useEffect(() => {
    if (chartRef.current && hoveredDistance !== null) {
      const chart = chartRef.current

      // Only show crosshair if the hovered distance is within the visible range
      if (hoveredDistance >= zoomRange.min && hoveredDistance <= zoomRange.max) {
        // Get the pixel position for the distance
        const xScale = chart.scales.x
        const pixelX = xScale.getPixelForValue(hoveredDistance)

        // Create a synthetic mouse event to trigger crosshair
        const syntheticEvent = {
          type: "mousemove",
          chart: chart,
          x: pixelX,
          y: height / 2, // Middle of chart
          native: {
            clientX: pixelX,
            clientY: height / 2,
            type: "mousemove",
          },
        }

        // Trigger the crosshair plugin
        // @ts-ignore - Chart.js plugin event handling
        if (chart.options.plugins?.crosshair?.sync?.enabled) {
          // The crosshair plugin will handle the visual sync
          chart.notifyPlugins("afterEvent", { event: syntheticEvent })
        }
      }
    }
  }, [hoveredDistance, zoomRange, height])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Memoize the closest data point value to prevent recalculation
  const hoveredValue = useMemo(() => {
    if (!hoveredDistance || hoveredDistance < zoomRange.min || hoveredDistance > zoomRange.max) {
      return null
    }

    const closestPoint = data.data.reduce((prev, curr) =>
      Math.abs(curr.x - hoveredDistance) < Math.abs(prev.x - hoveredDistance) ? curr : prev,
    )
    return closestPoint.y.toFixed(data.stepped ? 0 : 2)
  }, [hoveredDistance, zoomRange, data.data, data.stepped])

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base">{title}</CardTitle>
          {hoveredValue !== null && (
            <div className="text-sm">
              <span className="text-zinc-400">{data.label}: </span>
              <span className="text-white font-mono">{hoveredValue}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height: `${height}px` }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
