import { Progress } from "../../../components/ui/progress"

interface PerformanceMetric {
  label: string
  value: number
  maxValue?: number
  unit?: string
  description?: string
}

interface PerformanceMetricsProps {
  metrics: PerformanceMetric[]
  columns?: 1 | 2 | 3
}

export function PerformanceMetrics({ metrics, columns = 3 }: PerformanceMetricsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {metrics.map((metric, index) => (
        <div key={index} className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{metric.label}</span>
            <span className="text-sm text-zinc-400">
              {metric.value.toFixed(1)}
              {metric.unit && metric.unit}
            </span>
          </div>
          <Progress
            value={metric.maxValue ? (metric.value / metric.maxValue) * 100 : metric.value}
            className="h-2"
          />
          {metric.description && (
            <div className="text-xs text-zinc-400 mt-1">{metric.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}
