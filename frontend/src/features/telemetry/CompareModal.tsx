import { Trophy, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { LapData, SessionDetail } from "../../shared/types"
import { api } from "../../services/api"

interface CompareModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: number
  currentLapId: number
  onCompareLaps: (lapId1: number, lapId2: number) => void
}

export function CompareModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  currentLapId,
  onCompareLaps
}: CompareModalProps) {
  const [sessionData, setSessionData] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedLapId, setSelectedLapId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch session data when modal opens
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionData()
    }
  }, [isOpen, sessionId])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.sessions.getSessionDetail(sessionId)
      setSessionData(data)
    } catch (err) {
      setError("Failed to load session data")
      console.error("Error fetching session data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompareWithBest = () => {
    if (sessionData?.bestLapMs) {
      // Find the lap ID that corresponds to the best lap time
      const bestLap = sessionData.laps.find(lap => lap.lapTimeMs === sessionData.bestLapMs)
      if (bestLap) {
        onCompareLaps(currentLapId, bestLap.id)
        onClose()
      }
    }
  }

  const handleCompareWithSelected = () => {
    if (selectedLapId) {
      onCompareLaps(currentLapId, selectedLapId)
      onClose()
    }
  }

  const handleCancel = () => {
    setSelectedLapId(null)
    onClose()
  }

  const formatLapTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = Math.floor((ms % 1000) / 10)
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
  }

  const getBestLapId = (): number | null => {
    if (!sessionData?.bestLapMs) return null
    const bestLap = sessionData.laps.find(lap => lap.lapTimeMs === sessionData.bestLapMs)
    return bestLap?.id || null
  }

  const calculateLapDelta = (lapTimeMs: number): number => {
    if (!selectedLapId) return 0
    const selectedLap = sessionData?.laps.find(lap => lap.id === selectedLapId)
    if (!selectedLap) return 0
    return lapTimeMs - selectedLap.lapTimeMs
  }

  const formatDelta = (delta: number): string => {
    const sign = delta > 0 ? '+' : ''
    return `${sign}${formatLapTime(Math.abs(delta))}`
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Compare Laps</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-zinc-400">
            <p>Loading session data...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Compare Laps</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-zinc-400">
            <p className="text-red-400">{error}</p>
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

  if (!sessionData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Compare Laps</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-zinc-400">
            <p>No session data available.</p>
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

  const bestLapId = getBestLapId()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 border-zinc-800 text-white w-[50vw] h-[70vh] max-w-none">
        <DialogHeader>
          <DialogTitle className="text-white">Compare Laps</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Session Info */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
            <h3 className="text-white font-medium mb-2">Session Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-400">Track:</span> {sessionData.track.displayName}
              </div>
              <div>
                <span className="text-zinc-400">Car:</span> {sessionData.car.displayName}
              </div>
              <div>
                <span className="text-zinc-400">Total Laps:</span> {sessionData.totalLaps}
              </div>
              <div>
                <span className="text-zinc-400">Best Lap:</span> {sessionData.bestLap}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">Quick Actions</h3>
            
            {/* Compare with Best Lap */}
            {bestLapId && (
              <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-white font-medium">Compare with Best Lap</div>
                      <div className="text-sm text-zinc-400">
                        Compare current lap with the session's best lap ({sessionData.bestLap})
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      onCompareLaps(currentLapId, bestLapId)
                      onClose()
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Compare
                  </Button>
                </div>
              </div>
            )}

            {/* Compare with Selected Lap */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-white font-medium">Compare with Selected Lap</div>
                    <div className="text-sm text-zinc-400">
                      {selectedLapId 
                        ? `Compare current lap with Lap ${selectedLapId}`
                        : "Select a lap from the list below to compare"
                      }
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCompareWithSelected}
                  disabled={!selectedLapId}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare
                </Button>
              </div>
            </div>
          </div>

          {/* Lap List */}
          <div className="space-y-3">
            <h3 className="text-white font-medium">Available Laps</h3>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {sessionData.laps.map((lap) => (
                <div
                  key={lap.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedLapId === lap.id
                      ? 'bg-red-600/20 border-red-500'
                      : 'bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setSelectedLapId(lap.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedLapId === lap.id && (
                        <CheckCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <div className="text-white font-medium">Lap {lap.lapNumber}</div>
                        <div className="text-sm text-zinc-400">
                          {formatLapTime(lap.lapTimeMs)} • {lap.isValid ? 'Valid' : 'Invalid'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-mono text-sm">
                        {formatLapTime(lap.lapTimeMs)}
                      </div>
                                             {selectedLapId && selectedLapId !== lap.id && (
                         (() => {
                           const delta = calculateLapDelta(lap.lapTimeMs)
                           return (
                             <div className={`text-xs ${delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                               {formatDelta(delta)}
                             </div>
                           )
                         })()
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-zinc-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-zinc-600 bg-transparent text-zinc-300 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
