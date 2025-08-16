
import { ModuleDashboard } from "../../features/dashboard/ModuleDashboard"
import { Transponder } from "../../features/transponder/Transponder"
import { SessionHistory } from "../../features/sessions/SessionHistory"
import { SessionDetailView } from "../../features/sessions/SessionDetail"
import Telemetry from "../../features/telemetry/Telemetry"
import RaceEngineer from "../../features/engineer/RaceEngineer"
import TrackCarStats from "../../features/engineer/TrackCarStats"
import { useViewManager } from "../../hooks/useViewManager"

export function ContentPane() {
    const viewManager = useViewManager()

    // Dashboard view (submodule is null or "dashboard")
    if (!viewManager.activeView.submodule || viewManager.activeView.submodule === "dashboard") {
        return <ModuleDashboard moduleId={viewManager.activeView.module ?? "lmu"} onNavigate={viewManager.setActiveSubmodule} />
    }

    // Specific submodule views
    const renderSubmodule = () => {
        const key = `${viewManager.activeView.submodule}`

        switch (key) {
            case "transponder":
                return <Transponder />
            case "sessions":
                return <SessionHistory onViewSession={viewManager.setActiveSession} />
            case "session-detail":
                if (!viewManager.activeView.sessionId) {
                    return (
                        <div className="p-6 text-center bg-black">
                            <p className="text-gray-400">No session selected</p>
                        </div>
                    )
                }
                return (
                    <SessionDetailView 
                        sessionId={viewManager.activeView.sessionId} 
                        onBack={() => viewManager.setActiveSubmodule("sessions")}
                        onViewTelemetry={(lapId, sessionData) => {
                            // Navigate to telemetry view with session and lap data
                            viewManager.setActiveTelemetry(viewManager.activeView.sessionId!, lapId, sessionData)
                        }}
                    />
                )
            case "telemetry":
                if (!viewManager.activeView.telemetryData) {
                    return (
                        <div className="p-6 text-center bg-black">
                            <p className="text-gray-400">No telemetry data available</p>
                        </div>
                    )
                }
                return (
                    <Telemetry 
                        sessionId={viewManager.activeView.telemetryData.sessionId}
                        lapId={viewManager.activeView.telemetryData.lapId}
                        sessionData={viewManager.activeView.telemetryData.sessionData}
                        onBackToSessionDetail={() => viewManager.setActiveSession(viewManager.activeView.telemetryData!.sessionId)}
                    />
                )
            case "engineer":
                return <RaceEngineer />
            case "track-car-stats":
                return <TrackCarStats />
            case "paintshop":
                return (
                    <div className="p-6 text-center bg-black">
                        <p className="text-gray-400">Paint Shop feature coming soon</p>
                    </div>
                )
            case "teams":
                return (
                    <div className="p-6 text-center bg-black">
                        <p className="text-gray-400">Teams feature coming soon</p>
                    </div>
                )
            default:
                return (
                    <div className="p-6 text-center bg-black">
                        <p className="text-gray-400">Feature not implemented yet</p>
                    </div>
                )
        }
    }

    return <div className="flex-1 bg-black overflow-hidden">{renderSubmodule()}</div>
}
