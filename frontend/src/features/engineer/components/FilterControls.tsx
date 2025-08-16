import { BarChart3, Search } from "lucide-react"
import { Input } from "../../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Button } from "../../../components/ui/button"

interface FilterOption {
  value: string
  label: string
}

interface FilterControlsProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onViewStatsTable?: () => void
  filters: Array<{
    key: string
    label: string
    value: string
    options: FilterOption[]
    onValueChange: (value: string) => void
    width?: string
  }>
}

export function FilterControls({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onViewStatsTable,
  filters,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {onViewStatsTable && (
        <Button 
          variant="outline" 
          className="gap-2 bg-transparent"
          onClick={onViewStatsTable}
        >
          <BarChart3 className="w-4 h-4" />
          View Stats Table
        </Button>
      )}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-[200px]"
          />
        </div>
      )}

      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onValueChange}>
          <SelectTrigger className={filter.width || "w-[140px]"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}
