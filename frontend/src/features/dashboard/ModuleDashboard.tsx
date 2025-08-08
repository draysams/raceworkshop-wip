"use client"

import { useEffect, useState } from "react"
import { features } from "../../../features.config"
import { api } from "../../services/api"
import type { ModuleDashboardStats, Simulator } from "../../shared/types"
import { ModuleNavigation } from "../../components/navigation/ModuleNavigation"
import { PerformanceAnalyticsWidget } from "./widgets/PerformanceAnalyticsWidget"
import { QuickActionsWidget } from "./widgets/QuickActionsWidget"
import { RecentSessionsWidget } from "./widgets/RecentSessionWidget"
import { TransponderDetectionWidget } from "./widgets/TransponderDetectionWidget"
import { FeatureLayout } from "../../components/layout/FeatureLayout";

interface ModuleDashboardProps {
    moduleId: string
    onNavigate: (submoduleId: string) => void
}

export function ModuleDashboard({ moduleId, onNavigate }: ModuleDashboardProps) {
    if (!moduleId) {
        moduleId = "lmu" // Default to LMU if no module is specified
    }
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
                console.log(fetchedStats);
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



    

    // Simulate auto-detection
    useEffect(() => {
        const timer = setTimeout(() => {
            if (Math.random() > 0.7) {
                setAutoDetected(true)
            }
        }, 3000)
        return () => clearTimeout(timer)
    }, [])




    const [isTransponderActive, setIsTransponderActive] = useState(false)
    const [autoDetected, setAutoDetected] = useState(false)

    return (
        <FeatureLayout header={<ModuleNavigation />}>
            {/* Main Content Area - Fills remaining height */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full px-6 py-6 overflow-y-auto">
                    <div className="space-y-6">
                        {/* Auto-detection Alert */}
                        <TransponderDetectionWidget
                            autoDetected={autoDetected}
                            isTransponderActive={isTransponderActive}
                            setIsTransponderActive={setIsTransponderActive}
                            setAutoDetected={setAutoDetected}
                        />  
                        {/* Performance Analytics Section */}
                        <PerformanceAnalyticsWidget />
                        {/* Bottom Section - Takes remaining space */}
                        <div className="grid lg:grid-cols-3 gap-6 min-h-0 flex-1">
                            {/* Recent Sessions - Scrollable */}
                            <RecentSessionsWidget
                                moduleId={moduleId}
                                onAnalyse={() => onNavigate("sessions")}
                                onViewAll={() => onNavigate("sessions")}
                            />
                            {/* Sidebar - Fixed height with scrollable content */}
                            <div className="space-y-4 min-h-0">
                                {/* Quick Actions */}
                                <QuickActionsWidget />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}

