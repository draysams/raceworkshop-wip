import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { ReactNode } from "react"

interface TabItem {
  value: string
  label: string
  content: ReactNode
}

interface ExpandableTabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: TabItem[]
  columns?: number
}

export function ExpandableTabs({ value, onValueChange, tabs, columns = 3 }: ExpandableTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className={`grid w-full grid-cols-${columns}`} onClick={(e) => e.stopPropagation()}>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4 mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
