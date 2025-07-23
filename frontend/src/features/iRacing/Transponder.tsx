"use client"

import { useState } from "react"

interface LapData {
    lapNumber: number
    lapTime: string
    lapTimeMs: number
    sector1: string
    sector1Ms: number
    sector2: string
    sector2Ms: number
    sector3: string
    sector3Ms: number
    isValid: boolean
    isCurrentLap: boolean
}

interface SessionData {
    isConnected: boolean
    sessionType: string
    track: string
    car: string
    sessionTimeRemaining: string
    currentLap: number
    position: number
    fuelLevel: number
    tyrePressures: {
        frontLeft: number
        frontRight: number
        rearLeft: number
        rearRight: number
    }
    weather: string
    trackTemp: number
    airTemp: number
}

export function ACCTransponder() {
    const [sessionData, setSessionData] = useState<SessionData>({
        isConnected: false,
        sessionType: "Practice",
        track: "Spa-Francorchamps",
        car: "BMW M4 GT3",
        sessionTimeRemaining: "00:00",
        currentLap: 0,
        position: 0,
        fuelLevel: 0,
        tyrePressures: {
            frontLeft: 0,
            frontRight: 0,
            rearLeft: 0,
            rearRight: 0,
        },
        weather: "Clear",
        trackTemp: 0,
        airTemp: 0,
    })

    const [laps, setLaps] = useState<LapData[]>([])

    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold text-white">ACC Transponder</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-sm text-gray-400">Disconnected</span>
                        </div>
                    </div>
                    <p className="text-gray-400">Real-time telemetry and session data from Assetto Corsa Competizione</p>
                </div>

                <div className="bg-surface border border-gray-800 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-400 mb-4">ACC Transponder integration is currently in development</p>
                    <div className="text-sm text-gray-500">
                        <p>Features will include:</p>
                        <ul className="mt-2 space-y-1">
                            <li>• Live lap timing with sector splits</li>
                            <li>• Real-time telemetry data</li>
                            <li>• Session management</li>
                            <li>• Performance analysis</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
