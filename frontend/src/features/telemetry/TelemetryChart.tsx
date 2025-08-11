"use client"

import { useEffect, useRef, useMemo } from "react"

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
import Zoom from "chartjs-plugin-zoom"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Zoom)

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
  hoveredDistance: number | null
  zoomRange: ZoomRange
  onZoomComplete: (min: number, max: number) => void
  onHover?: (distance: number | null) => void
  comparisonData?: TelemetryDataSet
  isComparisonMode?: boolean
}

export function TelemetryChart({
  title,
  data,
  height,
  hoveredDistance,
  zoomRange,
  onZoomComplete,
  onHover,
  comparisonData,
  isComparisonMode = false,
}: TelemetryChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null)

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(
    () => {
      const datasets = [
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
      ]

      // Add comparison data if available
      if (isComparisonMode && comparisonData) {
        datasets.push({
          label: comparisonData.label,
          data: comparisonData.data,
          borderColor: comparisonData.borderColor,
          backgroundColor: comparisonData.borderColor + "20",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: comparisonData.interpolate ? 0.1 : 0,
          stepped: comparisonData.stepped ? ("before" as const) : false,
        })
      }

      return { datasets }
    },
    [data, comparisonData, isComparisonMode],
  )

  // Memoize chart options to prevent recreation on every render
  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      parsing: false as const,
      animation: false as const,
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      onHover: (event: any, activeElements: any) => {
        if (chartRef.current && event.native && 'clientX' in event.native) {
          const chart = chartRef.current
          const rect = chart.canvas.getBoundingClientRect()
          const x = (event.native as MouseEvent).clientX - rect.left

          // Convert pixel position to data value
          const dataX = chart.scales.x.getValueForPixel(x)

          // Only call onHover if we're within the chart bounds and dataX is defined
          if (dataX !== undefined && dataX >= zoomRange.min && dataX <= zoomRange.max) {
            onHover?.(dataX)
          } else {
            onHover?.(null)
          }
        }
      },
      onHoverLeave: () => {
        onHover?.(null)
      },
      plugins: {
        legend: {
          display: isComparisonMode,
          position: 'top' as const,
          labels: {
            color: '#9ca3af',
            usePointStyle: true,
            pointStyle: 'line',
          },
        },
        tooltip: {
          enabled: false,
        },
        zoom: {
          pan: {
            enabled: false,
          },
          zoom: {
            drag: {
              enabled: true,
              mode: 'x',
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              borderColor: "rgba(220, 38, 38, 0.5)",
              borderWidth: 1,
            },
            wheel: {
              enabled: false,
            },
            onZoomComplete: ({ chart }: { chart: any }) => {
              const { min, max } = chart.scales.x
              onZoomComplete(min, max)
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: zoomRange.min,
          max: zoomRange.max,
          display: true,
          grid: {
            color: "#374151",
          },
          ticks: {
            color: "#9ca3af",
            callback: (value: any) => Math.floor(Number(value)) + "m",
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
    [zoomRange, onZoomComplete, onHover],
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

  // Memoize the closest data point values to prevent recalculation
  const hoveredValues = useMemo(() => {
    if (!hoveredDistance || hoveredDistance < zoomRange.min || hoveredDistance > zoomRange.max) {
      return null
    }

    // Check if main data exists and has points
    if (!data.data || data.data.length === 0) {
      return null
    }

    // Find closest point for main data
    const mainClosestPoint = data.data.reduce((prev, curr) =>
      Math.abs(curr.x - hoveredDistance) < Math.abs(prev.x - hoveredDistance) ? curr : prev,
    )
    const mainValue = mainClosestPoint.y.toFixed(data.stepped ? 0 : 2)

    // Find closest point for comparison data if available
    let comparisonValue: string | null = null
    if (isComparisonMode && comparisonData && comparisonData.data && comparisonData.data.length > 0) {
      const comparisonClosestPoint = comparisonData.data.reduce((prev, curr) =>
        Math.abs(curr.x - hoveredDistance) < Math.abs(prev.x - hoveredDistance) ? curr : prev,
      )
      comparisonValue = comparisonClosestPoint.y.toFixed(comparisonData.stepped ? 0 : 2)
    }

    return {
      main: mainValue,
      comparison: comparisonValue
    }
  }, [hoveredDistance, zoomRange, data.data, data.stepped, isComparisonMode, comparisonData])

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-base">{title}</CardTitle>
          {hoveredValues !== null && (
            <div className="text-sm space-y-1">
              <div>
                <span className="text-zinc-400">{data.label}: </span>
                <span className="text-white font-mono">{hoveredValues.main}</span>
              </div>
              {isComparisonMode && hoveredValues.comparison !== null && (
                <div>
                  <span className="text-zinc-400">{comparisonData?.label || 'Comparison'}: </span>
                  <span className="text-white font-mono">{hoveredValues.comparison}</span>
                </div>
              )}
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
