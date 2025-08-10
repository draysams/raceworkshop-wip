import { useState, useEffect } from "react"
import { Card, CardContent } from "../../components/ui/card"

interface TelemetryDashboardProps {
  hoveredDistance: number | null
  telemetryData: any
  isComparisonMode?: boolean
  comparisonData?: any
}

interface TireData {
  pressure: number
  temperature: number
}

interface DashboardData {
  gear: number
  speed: number
  rpm: number
  steeringAngle: number
  throttle: number
  brake: number
  tires: {
    fl: TireData
    fr: TireData
    rl: TireData
    rr: TireData
  }
  fuelUsed: number
  tc: boolean
  abs: boolean
}

export function TelemetryDashboard({ 
  hoveredDistance, 
  telemetryData, 
  isComparisonMode = false,
  comparisonData 
}: TelemetryDashboardProps) {
  const [steeringWheelSvg, setSteeringWheelSvg] = useState<string>("")
  const [tyreSvg, setTyreSvg] = useState<string>("")

  // Load steering wheel SVG
  useEffect(() => {
    const loadSteeringWheelSvg = async () => {
      try {
        const response = await fetch("/assets/ui/steer.svg")
        const svgContent = await response.text()
        setSteeringWheelSvg(svgContent)
      } catch (error) {
        console.error("Failed to load steering wheel SVG:", error)
        // Fallback to a simple steering wheel shape
        setSteeringWheelSvg(`
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="#FFFFFF99" stroke-width="3" fill="none"/>
            <circle cx="50" cy="50" r="15" stroke="#FFFFFF99" stroke-width="2" fill="none"/>
            <line x1="50" y1="5" x2="50" y2="15" stroke="#FFFFFF99" stroke-width="2"/>
            <line x1="50" y1="85" x2="50" y2="95" stroke="#FFFFFF99" stroke-width="2"/>
            <line x1="5" y1="50" x2="15" y2="50" stroke="#FFFFFF99" stroke-width="2"/>
            <line x1="85" y1="50" x2="95" y2="50" stroke="#FFFFFF99" stroke-width="2"/>
          </svg>
        `)
      }
    }

    loadSteeringWheelSvg()
  }, [])

  // Load tyre SVG
  useEffect(() => {
    const loadTyreSvg = async () => {
      try {
        const response = await fetch("/assets/ui/tyre.svg")
        const svgContent = await response.text()
        setTyreSvg(svgContent)
      } catch (error) {
        console.error("Failed to load tyre SVG:", error)
        // Fallback to a simple tyre shape
        setTyreSvg(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="12" rx="8" ry="4" stroke="#FFFFFF99" stroke-width="2" fill="none"/>
          </svg>
        `)
      }
    }

    loadTyreSvg()
  }, [])

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    gear: 0,
    speed: 0,
    rpm: 0,
    steeringAngle: 0,
    throttle: 0,
    brake: 0,
    tires: {
      fl: { pressure: 0, temperature: 0 },
      fr: { pressure: 0, temperature: 0 },
      rl: { pressure: 0, temperature: 0 },
      rr: { pressure: 0, temperature: 0 }
    },
    fuelUsed: 0,
    tc: false,
    abs: false
  })

  const [comparisonDashboardData, setComparisonDashboardData] = useState<DashboardData>({
    gear: 0,
    speed: 0,
    rpm: 0,
    steeringAngle: 0,
    throttle: 0,
    brake: 0,
    tires: {
      fl: { pressure: 0, temperature: 0 },
      fr: { pressure: 0, temperature: 0 },
      rl: { pressure: 0, temperature: 0 },
      rr: { pressure: 0, temperature: 0 }
    },
    fuelUsed: 0,
    tc: false,
    abs: false
  })

  // Extract data from telemetry at hovered distance
  useEffect(() => {
    if (hoveredDistance && telemetryData) {
      const data = extractDataAtDistance(telemetryData, hoveredDistance)
      setDashboardData(data)
    }
  }, [hoveredDistance, telemetryData])

  // Extract comparison data
  useEffect(() => {
    if (hoveredDistance && comparisonData && isComparisonMode) {
      const data = extractDataAtDistance(comparisonData, hoveredDistance)
      setComparisonDashboardData(data)
    }
  }, [hoveredDistance, comparisonData, isComparisonMode])

  const extractDataAtDistance = (data: any, distance: number) => {
    const getClosestValue = (dataset: any[], targetDistance: number) => {
      if (!dataset || dataset.length === 0) return 0
      const closest = dataset.reduce((prev, curr) =>
        Math.abs(curr.x - targetDistance) < Math.abs(prev.x - targetDistance) ? curr : prev
      )
      return closest.y
    }

    return {
      gear: getClosestValue(data.gear?.data, distance) || 0,
      speed: getClosestValue(data.speed?.data, distance) || 0,
      rpm: getClosestValue(data.rpm?.data, distance) || 0,
      steeringAngle: getClosestValue(data.steering?.data, distance) || 0,
      throttle: getClosestValue(data.throttle?.data, distance) || 0,
      brake: getClosestValue(data.brake?.data, distance) || 0,
      tires: {
        fl: { pressure: 26.4, temperature: 85.4 }, // Placeholder data
        fr: { pressure: 25.4, temperature: 74.8 },
        rl: { pressure: 26.1, temperature: 86.0 },
        rr: { pressure: 25.4, temperature: 79.0 }
      },
      fuelUsed: 2.90, // Placeholder data
      tc: false, // Placeholder data
      abs: false // Placeholder data
    }
  }

  const getTireColor = (temperature: number) => {
    if (temperature === 0) return "#6B7280" // gray-600
    if (temperature < 60) return "#3B82F6" // blue-500
    if (temperature < 70) return "#EAB308" // yellow-500
    return "#EF4444" // red-500
  }

  const getTireSvgWithColor = (temperature: number) => {
    const color = getTireColor(temperature)
    // Replace the fill color in the SVG with the temperature-based color
    return tyreSvg.replace(/fill="#fff"/g, `fill="${color}"`).replace(/fill-opacity="0.3"/g, 'fill-opacity="0.8"')
  }

  const formatSpeed = (speed: number) => Math.round(speed)
  const formatRPM = (rpm: number) => Math.round(rpm)
  const formatSteering = (angle: number) => (angle * 180 / Math.PI).toFixed(1)
  const formatThrottle = (throttle: number) => Math.round(throttle * 100)
  const formatBrake = (brake: number) => Math.round(brake * 100)

  const renderDashboard = (data: DashboardData, isComparison: boolean = false) => (
    <Card className={`bg-zinc-900/50 border-zinc-800 ${isComparison ? 'border-orange-500/50' : ''}`}>
     <CardContent className="px-2">
     <div className="flex items-center justify-between gap-1">
          {/* Speedometer Gauge */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#374151"
                strokeWidth="4"
              />
              
              {/* Speedometer arc with progressive colors */}
              <defs>
                <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" /> {/* Red */}
                  <stop offset="17%" stopColor="#EF4444" /> {/* Red ends at 60/360 */}
                  <stop offset="17%" stopColor="#EAB308" /> {/* Yellow starts */}
                  <stop offset="58%" stopColor="#EAB308" /> {/* Yellow ends at 210/360 */}
                  <stop offset="58%" stopColor="#10B981" /> {/* Green starts */}
                  <stop offset="100%" stopColor="#10B981" /> {/* Green */}
                </linearGradient>
              </defs>
              
              {/* Background arc (gray) */}
              <path
                d="M 50 5 A 45 45 0 1 1 50 95"
                fill="none"
                stroke="#374151"
                strokeWidth="4"
                strokeLinecap="round"
              />
              
              {/* Active speed indicator - colored arc that grows */}
              <path
                d="M 50 5 A 45 45 0 1 1 50 95"
                fill="none"
                stroke="url(#speedGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(Math.abs(data.speed) / 360) * 283} 283`}
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="text-xs font-bold">{data.gear || "---"}</div>
              <div className="text-lg font-bold">{Math.abs(data.speed).toFixed(0) || "---"}</div>
              <div className="text-xs">{formatRPM(data.rpm) || "---"}</div>
            </div>
          </div>

          {/* Steering Wheel */}
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 relative"
              style={{ transform: `rotate(${data.steeringAngle * 360 / Math.PI}deg)` }}
              dangerouslySetInnerHTML={{ __html: steeringWheelSvg }}
            />
            <div className="text-xs text-white mt-1">{formatSteering(data.steeringAngle)}°</div>
          </div>

          {/* Brake and Throttle Bars */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="text-xs text-white w-12">Brake</div>
              <div className="w-20 h-3 bg-zinc-700 rounded-full overflow-hidden flex">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-full w-1 mr-0.5 transition-all duration-200 ${
                      i < Math.floor(formatBrake(data.brake) / 5) ? 'bg-red-500' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-white w-8">{formatBrake(data.brake)}%</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-white w-12">Throttle</div>
              <div className="w-20 h-3 bg-zinc-700 rounded-full overflow-hidden flex">
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-full w-1 mr-0.5 transition-all duration-200 ${
                      i < Math.floor(formatThrottle(data.throttle) / 5) ? 'bg-green-500' : 'bg-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-white w-8">{formatThrottle(data.throttle)}%</div>
            </div>
          </div>

          {/* Tires */}
          <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.tires).map(([position, tire]) => (
                <div key={position} className="flex items-center gap-1">
                  <div 
                    className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                    dangerouslySetInnerHTML={{ __html: getTireSvgWithColor(tire.temperature) }}
                  />
                  <div className="text-xs text-white min-w-0 hidden xl:block">
                    <div className="flex items-baseline">
                      <span className="text-xs">{tire.pressure}</span>
                      <span className="text-[8px] ml-0.5">PSI</span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-xs">{tire.temperature}</span>
                      <span className="text-[8px] ml-0.5">°C</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Vehicle Assists and Fuel */}
          <div className="flex flex-col gap-1 text-xs text-white">
            <div className="flex items-center gap-2">
              <span>TC</span>
              <span className={data.tc ? 'text-green-500' : 'text-red-500'}>
                {data.tc ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>ABS</span>
              <span className={data.abs ? 'text-green-500' : 'text-red-500'}>
                {data.abs ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Fuel/Lap</span>
              <span>{data.fuelUsed} L</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!hoveredDistance) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="text-center text-zinc-400 text-sm">
            Hover over a chart to see telemetry data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {renderDashboard(dashboardData, false)}
      {isComparisonMode && comparisonData && (
        <div className="relative">
          <div className="absolute -top-2 left-2 text-xs text-orange-400 bg-zinc-900 px-2 py-1 rounded">
            Comparison Lap
          </div>
          {renderDashboard(comparisonDashboardData, true)}
        </div>
      )}
    </div>
  )
}
