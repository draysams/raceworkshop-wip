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
  { id: "fuelLevel", label: "Fuel Level", visible: false, order: 6 },
  { id: "tirePressure.fl", label: "Tire Pressure FL", visible: false, order: 7 },
  { id: "tirePressure.fr", label: "Tire Pressure FR", visible: false, order: 8 },
  { id: "tirePressure.rl", label: "Tire Pressure RL", visible: false, order: 9 },
  { id: "tirePressure.rr", label: "Tire Pressure RR", visible: false, order: 10 },
  { id: "tireWear.fl", label: "Tire Wear FL", visible: false, order: 11 },
  { id: "tireWear.fr", label: "Tire Wear FR", visible: false, order: 12 },
  { id: "tireWear.rl", label: "Tire Wear RL", visible: false, order: 13 },
  { id: "tireWear.rr", label: "Tire Wear RR", visible: false, order: 14 },
  { id: "tireTemp.fl", label: "Tire Temp FL", visible: false, order: 15 },
  { id: "tireTemp.fr", label: "Tire Temp FR", visible: false, order: 16 },
  { id: "tireTemp.rl", label: "Tire Temp RL", visible: false, order: 17 },
  { id: "tireTemp.rr", label: "Tire Temp RR", visible: false, order: 18 },
  { id: "brakeTemp.fl", label: "Brake Temp FL", visible: false, order: 19 },
  { id: "brakeTemp.fr", label: "Brake Temp FR", visible: false, order: 20 },
  { id: "brakeTemp.rl", label: "Brake Temp RL", visible: false, order: 21 },
  { id: "brakeTemp.rr", label: "Brake Temp RR", visible: false, order: 22 },
  { id: "rideHeight.fl", label: "Ride Height FL", visible: false, order: 23 },
  { id: "rideHeight.fr", label: "Ride Height FR", visible: false, order: 24 },
  { id: "rideHeight.rl", label: "Ride Height RL", visible: false, order: 25 },
  { id: "rideHeight.rr", label: "Ride Height RR", visible: false, order: 26 },
  { id: "timeIntoLap", label: "Time Into Lap", visible: false, order: 27 },
  { id: "estimatedLapTime", label: "Estimated Lap Time", visible: false, order: 28 },
  { id: "trackEdge", label: "Track Edge", visible: false, order: 29 },
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
