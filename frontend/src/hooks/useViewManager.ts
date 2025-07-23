"use client"

import { useState, useCallback } from "react"

export interface ViewState {
    module: string | null
    submodule: string | null
}

export interface ViewManager {
    activeView: ViewState
    setActiveModule: (moduleId: string) => void
    setActiveSubmodule: (submoduleId: string) => void
    goToDashboard: () => void
}

export function useViewManager(): ViewManager {
    const [activeView, setActiveView] = useState<ViewState>({
        module: null,
        submodule: null,
    })

    const setActiveModule = useCallback((moduleId: string) => {
        setActiveView({
            module: moduleId,
            submodule: null, // Reset to dashboard when changing modules
        })
    }, [])

    const setActiveSubmodule = useCallback((submoduleId: string) => {
        setActiveView((prev) => ({
            ...prev,
            submodule: submoduleId,
        }))
    }, [])

    const goToDashboard = useCallback(() => {
        setActiveView((prev) => ({
            ...prev,
            submodule: null,
        }))
    }, [])

    return {
        activeView,
        setActiveModule,
        setActiveSubmodule,
        goToDashboard,
    }
}
