// frontend/src/services/api.ts

import type {
    IRaceWorkshopAPI,
    SessionFilters,
    SessionSummary,
    LapData,
    LiveSessionData,
    GlobalDashboardStats,
    ModuleDashboardStats,
    Simulator
} from '../shared/types';

// --- CHANGE START: Update the global type definition to match the flat API structure ---
declare global {
    interface Window {
        pywebview: {
            api: {
                // The API is now flat again from the frontend's perspective.
                getSimulatorList: () => Promise<string>; 
                getGlobalDashboardStats: () => Promise<string>;
                getModuleDashboardStats: (simulatorId: number) => Promise<string>;
                getSessionHistory: (filters: SessionFilters) => Promise<string>;
                getSessionDetail: (sessionId: number) => Promise<string | null>;
                getLapTelemetry: (lapId: number) => Promise<string>;
            };
        };
    }
}
// --- CHANGE END ---

const telemetryService = {
    socket: null as WebSocket | null,
    listeners: [] as Array<(data: LiveSessionData) => void>,
    start(simulatorId: string): void {
        if (this.socket) { return; }
        this.socket = new WebSocket('ws://localhost:8765');
        this.socket.onopen = () => console.log("[Telemetry] WebSocket connection established.");
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach(callback => callback(data));
            } catch (e) { console.error("[Telemetry] Error parsing incoming data:", e); }
        };
        this.socket.onclose = () => { this.socket = null; };
        this.socket.onerror = (error) => { console.error("[Telemetry] WebSocket error:", error); this.socket = null; };
    },
    stop(): void { if (this.socket) { this.socket.close(); } },
    onData(callback: (data: LiveSessionData) => void): () => void {
        this.listeners.push(callback);
        return () => { this.listeners = this.listeners.filter(cb => cb !== callback); };
    },
};


export const api: IRaceWorkshopAPI = {
    // --- CHANGE START: Revert API calls to the flat structure ---
     simulators: {
        getSimulatorList: async (): Promise<Simulator[]> => {
            try {
                if (window.pywebview?.api) {
                    const jsonString = await window.pywebview.api.getSimulatorList();
                    return JSON.parse(jsonString);
                }
                throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error("Failed to get simulator list:", e);
                return [];
            }
        }
    },
    dashboard: {
        getGlobalDashboardStats: async (): Promise<GlobalDashboardStats> => {
            try {
                if (window.pywebview?.api) {
                    const jsonString = await window.pywebview.api.getGlobalDashboardStats();
                    return JSON.parse(jsonString);
                }
                throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error("Failed to get global dashboard stats:", e);
                return { totalSessions: 0, totalLaps: 0, totalDriveTime: "00:00:00", recentSessions: [] };
            }
        },
        getModuleDashboardStats: async (simulatorId: number): Promise<ModuleDashboardStats> => {
            try {
                if (window.pywebview?.api) {
                    const jsonString = await window.pywebview.api.getModuleDashboardStats(simulatorId);
                    return JSON.parse(jsonString);
                }
                throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error(`Failed to get module dashboard stats for sim ${simulatorId}:`, e);
                return { totalSessions: 0, totalLaps: 0, totalDriveTime: "00:00:00", recentSessions: [] };
            }
        },
    },
    
    sessions: {
        getSessionHistory: async (filters: SessionFilters): Promise<SessionSummary[]> => {
            try {
                if (window.pywebview?.api) {
                    // Call the top-level method
                    const jsonString = await window.pywebview.api.getSessionHistory(filters);
                    return JSON.parse(jsonString);
                }
                throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error("Failed to get session history from backend:", e);
                return [];
            }
        },
        getSessionDetail: async (sessionId: number): Promise<{ session: SessionSummary; laps: LapData[] } | null> => {
            try {
                if (window.pywebview?.api) {
                    // Call the top-level method
                    const jsonString = await window.pywebview.api.getSessionDetail(sessionId);
                    if (!jsonString || jsonString === 'null') return null;
                    return JSON.parse(jsonString);
                }
                 throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error(`Error fetching session detail for ID ${sessionId}:`, e);
                return null;
            }
        },
    },

    telemetry: {
        ...telemetryService,
        getLapTelemetry: async (lapId: number): Promise<any> => {
            try {
                if (window.pywebview?.api) {
                    // Call the top-level method
                    const jsonString = await window.pywebview.api.getLapTelemetry(lapId);
                    return JSON.parse(jsonString);
                }
                throw new Error("Pywebview API not available.");
            } catch (e) {
                console.error(`Error fetching telemetry for lap ${lapId}:`, e);
                return {};
            }
        },
    },
    // --- CHANGE END ---
};