"use client"

import { useEffect, useState } from "react"
import { features } from "../../../features.config"
import { RecentSessionsWidget } from "./widgets/RecentSessionWidget"
import { api } from "../../services/api"
import type { ModuleDashboardStats, Simulator } from "../../shared/types"

interface ModuleDashboardProps {
    moduleId: string
    onNavigate: (submoduleId: string) => void
}

export function ModuleDashboard({ moduleId, onNavigate }: ModuleDashboardProps) {
    const [stats, setStats] = useState<ModuleDashboardStats | null>(null)
    // --- CHANGE START: Add state for the simulator list ---
    const [simulators, setSimulators] = useState<Simulator[]>([])
    // --- CHANGE END ---
    
    const moduleConfig = features[moduleId]

    // --- CHANGE START: Fetch the list of simulators on mount ---
    useEffect(() => {
        const fetchSims = async () => {
            const simList = await api.simulators.getSimulatorList();
            setSimulators(simList);
        };
        fetchSims();
    }, []);
    // --- CHANGE END ---

    useEffect(() => {
        if (!moduleId || !moduleConfig || simulators.length === 0) return;

        // Find the correct simulator ID from the fetched list
        const currentSim = simulators.find(sim => sim.name === moduleConfig.name);
        if (!currentSim) {
            console.warn(`Simulator "${moduleConfig.name}" not found in database.`);
            return;
        }

        const fetchModuleStats = async () => {
            try {
                // Use the dynamically found ID for the API call
                const fetchedStats = await api.dashboard.getModuleDashboardStats(currentSim.id);
                setStats(fetchedStats);
            } catch (error) {
                console.error(`Failed to fetch module dashboard stats for ${moduleId}:`, error);
            }
        };

        fetchModuleStats();
    }, [moduleId, moduleConfig, simulators]); // Re-run when the list of simulators is available

    if (!moduleConfig) {
        return <div className="p-6 text-center"><p className="text-gray-400">Module not found</p></div>;
    }

    return (
        // --- The rest of the JSX remains the same as the previous version ---
        // It will now correctly display "..." while loading, and then the live data.
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">{moduleConfig.name} Dashboard</h1>
                    <p className="text-gray-400">Overview of your {moduleConfig.name} racing data and performance</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-white">{stats?.totalSessions ?? "..."}</div>
                        <div className="text-xs text-gray-400">Total Sessions</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-accent">{stats?.totalLaps.toLocaleString() ?? "..."}</div>
                        <div className="text-xs text-gray-400">Total Laps</div>
                    </div>
                    <div className="bg-surface border border-gray-800 rounded-lg p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-green-400">{stats?.totalDriveTime ?? "..."}</div>
                        <div className="text-xs text-gray-400">Time Driven</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    <div className="xl:col-span-2">
                        <RecentSessionsWidget
                            moduleId={moduleId}
                            onAnalyse={() => onNavigate("sessions")}
                            onViewAll={() => onNavigate("sessions")}
                        />
                    </div>
                    
                    <div className="bg-surface border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button onClick={() => onNavigate("transponder")} className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-md py-2 px-3 text-sm font-medium transition-colors">
                                Start Live Session
                            </button>
                            <button onClick={() => onNavigate("sessions")} className="w-full bg-surface hover:bg-gray-800 text-white border border-gray-800 rounded-md py-2 px-3 text-sm font-medium transition-colors">
                                Analyze All Sessions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}