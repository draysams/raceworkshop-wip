import type { ViewState } from "../../src/hooks/useViewManager"
import { ModuleDashboard } from "../../features/dashboard/ModuleDashboard"
import { GlobalDashboard } from "../../features/dashboard/GlobalDashboard"
import { LMUTransponder } from "../../features/lmu/Transponder"
import { ACCTransponder } from "../../features/acc/Transponder"
import { SessionManager } from "../../features/sessions/SessionManager"

interface ContentPaneProps {
    activeView: ViewState
    onNavigate: (submoduleId: string) => void
    onModuleSelect: (moduleId: string) => void
}

export function ContentPane({ activeView, onNavigate, onModuleSelect }: ContentPaneProps) {
    // No module selected - show global dashboard
    if (!activeView.module) {
        return (
            <GlobalDashboard
                onModuleSelect={onModuleSelect}
                onNavigateToSessions={(moduleId) => {
                    onModuleSelect(moduleId)
                    onNavigate("sessions")
                }}
            />
        )
    }

    // Dashboard view (submodule is null)
    if (!activeView.submodule) {
        return <ModuleDashboard moduleId={activeView.module} onNavigate={onNavigate} />
    }

    // Specific submodule views
    const renderSubmodule = () => {
        const key = `${activeView.module}-${activeView.submodule}`

        switch (key) {
            case "lmu-transponder":
                return <LMUTransponder />
            case "acc-transponder":
                return <ACCTransponder />
            case "lmu-sessions":
            case "acc-sessions":
                return <SessionManager />
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
