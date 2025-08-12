"use client"

import { useState } from "react"
import { SessionHistory } from "./SessionHistory"
import { SessionDetailView } from "./SessionDetail"
import Telemetry from "../telemetry/Telemetry"

export function SessionManager() {
    const [currentView, setCurrentView] = useState<"history" | "detail" | "telemetry">("history")
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
    const [selectedLapId, setSelectedLapId] = useState<number | null>(null)

    const handleViewSession = (sessionId: number) => {
        setSelectedSessionId(sessionId)
        setCurrentView("detail")
    }

    const handleViewTelemetry = (lapId: number) => {
        setCurrentView("telemetry")
        setSelectedLapId(lapId)
    }

    const handleBackToHistory = () => {
        setCurrentView("history")
        setSelectedSessionId(null)
    }

    const handleBackToSessionDetail = () => {
        setCurrentView("detail")
        setSelectedLapId(null)
    }

    if (currentView === "detail" && selectedSessionId) {
        return <SessionDetailView sessionId={selectedSessionId} onBack={handleBackToHistory} onViewTelemetry={handleViewTelemetry} />
    }

    if (currentView === "telemetry" && selectedSessionId && selectedLapId) {
        return <Telemetry sessionId={selectedSessionId} lapId={selectedLapId} onBackToSessionDetail={handleBackToSessionDetail} />
    }

    return <SessionHistory onViewSession={handleViewSession} />
}
