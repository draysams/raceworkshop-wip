import { ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"

interface ChartConfig {
  id: string
  label: string
  visible: boolean
  order: number
}

interface ConfigModalProps {
  isOpen: boolean
  onClose: () => void
  chartConfig: ChartConfig[]
  onSave: (config: ChartConfig[]) => void
}

export function ConfigModal({ isOpen, onClose, chartConfig = [], onSave }: ConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<ChartConfig[]>(chartConfig)

  const handleVisibilityChange = (id: string, visible: boolean) => {
    setLocalConfig((prev) => prev.map((chart) => (chart.id === id ? { ...chart, visible } : chart)))
  }

  const moveChartUp = (index: number) => {
    if (index === 0) return

    const newConfig = [...localConfig]
    const temp = newConfig[index]
    newConfig[index] = newConfig[index - 1]
    newConfig[index - 1] = temp

    // Update order values
    newConfig[index].order = index
    newConfig[index - 1].order = index - 1

    setLocalConfig(newConfig)
  }

  const moveChartDown = (index: number) => {
    if (index === localConfig.length - 1) return

    const newConfig = [...localConfig]
    const temp = newConfig[index]
    newConfig[index] = newConfig[index + 1]
    newConfig[index + 1] = temp

    // Update order values
    newConfig[index].order = index
    newConfig[index + 1].order = index + 1

    setLocalConfig(newConfig)
  }

  const handleSave = () => {
    onSave(localConfig)
    onClose()
  }

  const handleCancel = () => {
    setLocalConfig(chartConfig)
    onClose()
  }

  if (localConfig.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Configure Charts</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-zinc-400">
            <p>No charts available to configure.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white w-[40vw] h-[60vh]  max-w-none">
        <DialogHeader>
          <DialogTitle className="text-white">Configure Charts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {localConfig.map((chart, index) => (
            <div
              key={chart.id}
              className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                {/* Up/Down Arrow Controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveChartUp(index)}
                    disabled={index === 0}
                    className="p-1 h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveChartDown(index)}
                    disabled={index === localConfig.length - 1}
                    className="p-1 h-6 w-6 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>

                {/* Visibility Checkbox */}
                <Checkbox
                  id={`chart-${chart.id}`}
                  checked={chart.visible}
                  onCheckedChange={(checked) => handleVisibilityChange(chart.id, checked as boolean)}
                  className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                />

                {/* Chart Label */}
                <label htmlFor={`chart-${chart.id}`} className="text-white font-medium cursor-pointer flex-1">
                  {chart.label}
                </label>

                {/* Order Display */}
                <div className="text-sm text-zinc-400 font-mono">#{index + 1}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
