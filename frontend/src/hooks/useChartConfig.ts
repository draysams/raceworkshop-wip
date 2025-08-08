"use client"

import { useState, useEffect } from "react"

interface ChartConfig {
  id: string
  label: string
  visible: boolean
  order: number
}

const DEFAULT_CHART_CONFIG: ChartConfig[] = [
  { id: "speed", label: "Speed", visible: true, order: 0 },
  { id: "throttle", label: "Throttle", visible: true, order: 1 },
  { id: "brake", label: "Brake", visible: true, order: 2 },
  { id: "steering", label: "Steering", visible: true, order: 3 },
  { id: "gear", label: "Gear", visible: false, order: 4 },
  { id: "rpm", label: "RPM", visible: false, order: 5 },
  { id: "tc", label: "TC", visible: false, order: 6 },
  { id: "abs", label: "ABS", visible: false, order: 7 },
]

const STORAGE_KEY = "porsche-telemetry-chart-config"

export function useChartConfig() {
  const [chartConfig, setChartConfig] = useState<ChartConfig[]>(DEFAULT_CHART_CONFIG)

  // Load configuration from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate the structure
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              typeof item === "object" && "id" in item && "label" in item && "visible" in item && "order" in item,
          )
        ) {
          setChartConfig(parsed)
        }
      }
    } catch (error) {
      console.warn("Failed to load chart configuration from localStorage:", error)
    }
  }, [])

  const saveChartConfig = (config: ChartConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      setChartConfig(config)
    } catch (error) {
      console.error("Failed to save chart configuration to localStorage:", error)
    }
  }

  return {
    chartConfig,
    saveChartConfig,
  }
}
