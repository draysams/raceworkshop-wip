// frontend/src/services/api.ts

import type {
    IRaceWorkshopAPI,
    SessionFilters,
    SessionSummary,
    LapData,
    LiveSessionData
} from '../shared/types';

// The global declaration remains correct.
declare global {
    interface Window {
        pywebview: {
            api: {
                getSessionHistory: (filters: SessionFilters) => Promise<string>;
                getSessionDetail: (sessionId: number) => Promise<string | null>;
                appGetNodeVersion: (msg: string) => Promise<string>;
            };
        };
    }
}

// --- Telemetry Service Object ---
// We create a dedicated object to manage the WebSocket lifecycle and listeners.
// This is cleaner and solves the 'this' and property existence issues.
const telemetryService = {
    socket: null as WebSocket | null,
    listeners: [] as Array<(data: LiveSessionData) => void>,

    start(simulatorId: string): void {
        if (this.socket) {
            console.warn("[Telemetry] Already started.");
            return;
        }
        console.log(`[Telemetry] Starting for ${simulatorId}... Connecting to ws://localhost:8765`);
        this.socket = new WebSocket('ws://localhost:8765');

        this.socket.onopen = () => {
            console.log("[Telemetry] WebSocket connection established.");
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Notify all registered listeners
                this.listeners.forEach(callback => callback(data));
            } catch (e) {
                console.error("[Telemetry] Error parsing incoming data:", e);
            }
        };

        this.socket.onclose = () => {
            console.log("[Telemetry] WebSocket connection closed.");
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            console.error("[Telemetry] WebSocket error:", error);
            this.socket = null;
        };
    },

    stop(): void {
        if (this.socket) {
            console.log("[Telemetry] Stopping connection.");
            this.socket.close();
            this.socket = null;
        }
    },

    onData(callback: (data: LiveSessionData) => void): () => void {
        this.listeners.push(callback);
        // Return an unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
            console.log("[Telemetry] Listener unsubscribed.");
        };
    },
};


// --- Main API Export ---
// This now correctly implements the IRaceWorkshopAPI interface.
export const api: IRaceWorkshopAPI = {
    // We can add the appGetNodeVersion back if needed, using the lazy access pattern.
    appGetNodeVersion: async (msg: string): Promise<string> => {
        if (window.pywebview && window.pywebview.api) {
            return await window.pywebview.api.appGetNodeVersion(msg);
        }
        return "Pywebview API not connected.";
    },

    db: {
        getSessionHistory: async (filters: SessionFilters): Promise<SessionSummary[]> => {
            try {
                if (window.pywebview && window.pywebview.api) {
                    const jsonString = await window.pywebview.api.getSessionHistory(filters);
                    return JSON.parse(jsonString);
                }
                console.error("Pywebview API not available for getSessionHistory.");
                return [];
            } catch (e) {
                console.error("Failed to get session history from backend:", e);
                return [];
            }
        },
        getSessionDetail: async (sessionId: number): Promise<{ session: SessionSummary; laps: LapData[] } | null> => {
            try {
                if (window.pywebview && window.pywebview.api) {
                    const jsonString = await window.pywebview.api.getSessionDetail(sessionId);
                    if (!jsonString || jsonString === 'null') return null;
                    return JSON.parse(jsonString);
                }
                 console.error("Pywebview API not available for getSessionDetail.");
                return null;
            } catch (e) {
                console.error(`Error fetching session detail for ID ${sessionId}:`, e);
                return null;
            }
        },
    },

    // The telemetry part of the API now just delegates to our dedicated service object.
    telemetry: telemetryService,
};