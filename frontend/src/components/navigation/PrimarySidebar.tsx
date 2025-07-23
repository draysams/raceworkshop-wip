"use client"
import { features } from "../../../features.config"

interface PrimarySidebarProps {
    activeModule: string | null
    onModuleSelect: (moduleId: string) => void
}

export function PrimarySidebar({ activeModule, onModuleSelect }: PrimarySidebarProps) {
    const enabledModules = Object.entries(features).filter(([, config]) => config.enabled)

    return (
        <div className="w-16 bg-black border-r border-gray-800 flex flex-col items-center py-4 gap-2">
            <div className="mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">RW</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {enabledModules.map(([moduleId, config]) => (
                    <button
                        key={moduleId}
                        onClick={() => onModuleSelect(moduleId)}
                        className={`
              w-12 h-12 rounded-lg flex items-center justify-center text-2xl
              transition-all duration-200 relative group
              ${activeModule === moduleId
                                ? "bg-accent text-white shadow-lg"
                                : "bg-surface hover:bg-accent/20 text-gray-400 hover:text-white"
                            }
            `}
                        title={config.name}
                    >
                        {config.icon}

                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-surface border border-gray-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {config.name}
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-auto">
                <button className="w-12 h-12 rounded-lg bg-surface hover:bg-accent/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </div>
    )
}
