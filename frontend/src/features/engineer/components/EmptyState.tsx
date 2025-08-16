import { Card } from "../../../components/ui/card"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title?: string
  message: string
}

export function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
              <div className="text-zinc-400">
        <Icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        {title && <h3 className="text-lg font-medium mb-2">{title}</h3>}
        <p>{message}</p>
      </div>
    </Card>
  )
}
