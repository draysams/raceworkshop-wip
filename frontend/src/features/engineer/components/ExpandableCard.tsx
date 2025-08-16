import { ChevronDown, ChevronUp, Trophy } from "lucide-react"
import { Badge } from "../../../components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card"
import { ReactNode } from "react"

interface ExpandableCardProps {
  id: string
  title: string
  subtitle?: string
  badges?: Array<{ text: string; variant?: "default" | "secondary" | "outline" }>
  metrics: Array<{
    value: string | number
    label: string
    color?: string
  }>
  isExpanded: boolean
  onToggle: () => void
  children?: ReactNode
  showTrophy?: boolean
  trophyCount?: number
}

export function ExpandableCard({
  id,
  title,
  subtitle,
  badges = [],
  metrics,
  isExpanded,
  onToggle,
  children,
  showTrophy = false,
  trophyCount = 0,
}: ExpandableCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md bg-zinc-900/50 border-zinc-800 hover:border-red-800/50"
      onClick={onToggle}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {title}
                {showTrophy && trophyCount > 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                {subtitle && <span>{subtitle}</span>}
                {badges.map((badge, index) => (
                  <Badge key={index} variant={badge.variant || "outline"} className="text-xs">
                    {badge.text}
                  </Badge>
                ))}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className={`text-lg font-bold ${metric.color || ""}`}>
                {typeof metric.value === "number" && metric.value % 1 !== 0
                  ? metric.value.toFixed(1)
                  : metric.value}
              </div>
                              <div className="text-xs text-zinc-500">{metric.label}</div>
            </div>
          ))}
        </div>

        {isExpanded && (
          <div
            className="space-y-4 animate-in slide-in-from-top-2 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
