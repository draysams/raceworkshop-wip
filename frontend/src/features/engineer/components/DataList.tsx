import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Target } from "lucide-react"

interface DataItem {
  id: string | number
  title: string
  subtitle?: string
  badges?: Array<{ text: string; variant?: "default" | "secondary" | "outline" }>
  metrics?: Array<{ label: string; value: string | number; color?: string }>
  actions?: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>
}

interface DataListProps {
  items: DataItem[]
  emptyMessage?: string
  emptyIcon?: React.ReactNode
}

export function DataList({ items, emptyMessage = "No data available", emptyIcon }: DataListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {item.badges?.map((badge, index) => (
              <Badge key={index} variant={badge.variant || "outline"}>
                {badge.text}
              </Badge>
            ))}
            <div className="text-sm">
              <div className="font-medium">{item.title}</div>
              {item.subtitle && <div className="text-muted-foreground">{item.subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {item.metrics?.map((metric, index) => (
              <div key={index} className="text-right">
                <div className={`font-mono text-sm ${metric.color || ""}`}>{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
            {item.actions?.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.onClick}
              >
                {action.icon || <Target className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
