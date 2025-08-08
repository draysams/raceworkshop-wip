"use client"

import { useState } from "react"
import { SessionHistory } from "./SessionHistory"
import { SessionDetail } from "./SessionDetail"
import Telemetry from "../telemetry/Telemetry"

export function SessionManager() {
    const [currentView, setCurrentView] = useState<"history" | "detail" | "telemetry">("history")
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
    const [selectedLapNumber, setSelectedLapNumber] = useState<number | null>(null)

    const handleViewSession = (sessionId: number) => {
        setSelectedSessionId(sessionId)
        setCurrentView("detail")
    }

    const handleViewTelemetry = (lapNumber: number) => {
        setCurrentView("telemetry")
        setSelectedLapNumber(lapNumber)
    }

    const handleBackToHistory = () => {
        setCurrentView("history")
        setSelectedSessionId(null)
    }

    const handleBackToSessionDetail = () => {
        setCurrentView("detail")
        setSelectedLapNumber(null)
    }

    if (currentView === "detail" && selectedSessionId) {
        return <SessionDetail sessionId={selectedSessionId} onBack={handleBackToHistory} onViewTelemetry={handleViewTelemetry} />
    }

    if (currentView === "telemetry" && selectedSessionId && selectedLapNumber) {
        return <Telemetry sessionId={selectedSessionId} lapNumber={selectedLapNumber} onBackToSessionDetail={handleBackToSessionDetail} />
    }

    return <SessionHistory onViewSession={handleViewSession} />
}
