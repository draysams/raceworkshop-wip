"use client"

import { useState } from "react"
import { SessionHistory } from "./SessionHistory"
import { SessionDetail } from "./SessionDetail"

export function SessionManager() {
    const [currentView, setCurrentView] = useState<"history" | "detail">("history")
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)

    const handleViewSession = (sessionId: number) => {
        setSelectedSessionId(sessionId)
        setCurrentView("detail")
    }

    const handleBackToHistory = () => {
        setCurrentView("history")
        setSelectedSessionId(null)
    }

    if (currentView === "detail" && selectedSessionId) {
        return <SessionDetail sessionId={selectedSessionId} onBack={handleBackToHistory} />
    }

    return <SessionHistory onViewSession={handleViewSession} />
}
