"use client"

import React, { useState, useCallback, createContext, useContext, ReactNode } from "react"

export interface ViewState {
    module: string | null
    submodule: string | null
    sessionId?: number | null
    telemetryData?: {
        sessionId: number
        lapId: number
        sessionData?: any // Add session data to avoid redundant API calls
    } | null
}

export interface ViewManager {
    activeView: ViewState
    setActiveModule: (moduleId: string) => void
    setActiveSubmodule: (submoduleId: string) => void
    setActiveSession: (sessionId: number) => void
    setActiveTelemetry: (sessionId: number, lapId: number, sessionData?: any) => void
    goToDashboard: () => void
    goBack: () => void
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

    const [navigationHistory, setNavigationHistory] = useState<ViewState[]>([])

    const setActiveModule = useCallback((moduleId: string) => {
        const newView = {
            module: moduleId,
            submodule: null,
            sessionId: null,
            telemetryData: null,
        }
        setNavigationHistory(prev => [...prev, activeView])
        setActiveView(newView)
    }, [activeView])

    const setActiveSubmodule = useCallback((submoduleId: string) => {
        const newView = {
            ...activeView,
            submodule: submoduleId,
            sessionId: null,
            telemetryData: null,
        }
        setNavigationHistory(prev => [...prev, activeView])
        setActiveView(newView)
    }, [activeView])

    const setActiveSession = useCallback((sessionId: number) => {
        const newView = {
            ...activeView,
            submodule: "session-detail",
            sessionId: sessionId,
            telemetryData: null,
        }
        setNavigationHistory(prev => [...prev, activeView])
        setActiveView(newView)
    }, [activeView])

    const setActiveTelemetry = useCallback((sessionId: number, lapId: number, sessionData?: any) => {
        const newView = {
            ...activeView,
            submodule: "telemetry",
            sessionId: null,
            telemetryData: {
                sessionId,
                lapId,
                sessionData,
            },
        }
        setNavigationHistory(prev => [...prev, activeView])
        setActiveView(newView)
    }, [activeView])

    const goToDashboard = useCallback(() => {
        const newView = {
            ...activeView,
            submodule: null,
            sessionId: null,
            telemetryData: null,
        }
        setNavigationHistory(prev => [...prev, activeView])
        setActiveView(newView)
    }, [activeView])

    const goBack = useCallback(() => {
        if (navigationHistory.length > 0) {
            const previousView = navigationHistory[navigationHistory.length - 1]
            setActiveView(previousView)
            setNavigationHistory(prev => prev.slice(0, -1))
        }
    }, [navigationHistory])

    const viewManager: ViewManager = {
        activeView,
        setActiveModule,
        setActiveSubmodule,
        setActiveSession,
        setActiveTelemetry,
        goToDashboard,
        goBack,
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
