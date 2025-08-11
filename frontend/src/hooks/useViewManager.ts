"use client"

import React, { useState, useCallback, createContext, useContext, ReactNode } from "react"

export interface ViewState {
    module: string | null
    submodule: string | null
    sessionId?: number | null
    telemetryData?: {
        sessionId: number
        lapId: number
    } | null
}

export interface ViewManager {
    activeView: ViewState
    setActiveModule: (moduleId: string) => void
    setActiveSubmodule: (submoduleId: string) => void
    setActiveSession: (sessionId: number) => void
    setActiveTelemetry: (sessionId: number, lapId: number) => void
    goToDashboard: () => void
}

const ViewManagerContext = createContext<ViewManager | null>(null)

interface ViewManagerProviderProps {
    children: ReactNode
}

export function ViewManagerProvider({ children }: ViewManagerProviderProps) {
    const [activeView, setActiveView] = useState<ViewState>({
        module: null,
        submodule: null,
        sessionId: null,
        telemetryData: null,
    })

    const setActiveModule = useCallback((moduleId: string) => {
        setActiveView({
            module: moduleId,
            submodule: null,
            sessionId: null,
            telemetryData: null,
        })
    }, [])

    const setActiveSubmodule = useCallback((submoduleId: string) => {
        setActiveView((prev) => ({
            ...prev,
            submodule: submoduleId,
            sessionId: null,
            telemetryData: null,
        }))
    }, [])

    const setActiveSession = useCallback((sessionId: number) => {
        setActiveView((prev) => ({
            ...prev,
            submodule: "session-detail",
            sessionId: sessionId,
            telemetryData: null,
        }))
    }, [])

    const setActiveTelemetry = useCallback((sessionId: number, lapId: number) => {
        setActiveView((prev) => ({
            ...prev,
            submodule: "telemetry",
            sessionId: null,
            telemetryData: {
                sessionId,
                lapId,
            },
        }))
    }, [])

    const goToDashboard = useCallback(() => {
        setActiveView((prev) => ({
            ...prev,
            submodule: null,
            sessionId: null,
            telemetryData: null,
        }))
    }, [])

    const viewManager: ViewManager = {
        activeView,
        setActiveModule,
        setActiveSubmodule,
        setActiveSession,
        setActiveTelemetry,
        goToDashboard,
    }

    return React.createElement(ViewManagerContext.Provider, { value: viewManager }, children)
}

export function useViewManager(): ViewManager {
    const context = useContext(ViewManagerContext)
    if (!context) {
        throw new Error("useViewManager must be used within a ViewManagerProvider")
    }
    return context
}
