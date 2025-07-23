"use client"
import { features } from "../../../features.config"

interface TopBarProps {
    activeModule: string | null
    activeSubmodule: string | null
    onSubmoduleSelect: (submoduleId: string) => void
    onDashboardSelect: () => void
}

export function TopBar({ activeModule, activeSubmodule, onSubmoduleSelect, onDashboardSelect }: TopBarProps) {
    if (!activeModule) {
        return (
            <div className="h-14 bg-black border-b border-gray-800 flex items-center px-6">
                <h1 className="text-lg font-semibold text-white">RaceWorkshop</h1>
            </div>
        )
    }

    const moduleConfig = features[activeModule]
    if (!moduleConfig) return null

    const enabledSubmodules = Object.entries(moduleConfig.submodules).filter(([, config]) => config.enabled)

    return (
        <div className="h-14 bg-black border-b border-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
                <h1 className="text-lg font-semibold text-white flex items-center gap-3">
                    <span className="text-xl">{moduleConfig.icon}</span>
                    {moduleConfig.name}
                </h1>

                <nav className="flex items-center gap-1">
                    <button
                        onClick={onDashboardSelect}
                        className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${!activeSubmodule ? "bg-accent text-white" : "text-gray-400 hover:text-white hover:bg-surface"}
            `}
                    >
                        Dashboard
                    </button>

                    {enabledSubmodules.map(([submoduleId, config]) => (
                        <button
                            key={submoduleId}
                            onClick={() => onSubmoduleSelect(submoduleId)}
                            className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${activeSubmodule === submoduleId
                                    ? "bg-accent text-white"
                                    : "text-gray-400 hover:text-white hover:bg-surface"
                                }
              `}
                        >
                            {config.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse"></div>
                    Connected
                </div>
            </div>
        </div>
    )
}
