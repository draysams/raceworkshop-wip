// frontend/src/shared/types.ts

// =================================================================
//                      CORE DATA STRUCTURES
// =================================================================

export interface SessionSummary {
    id: number;
    simulator: 'lmu' | 'acc' | 'ac' | 'iracing';
    track: string;
    car: string;
    sessionType: 'Practice' | 'Qualifying' | 'Race' | 'Unknown';
    date: string;
    dateEnded: string | null;
    duration: string;
    durationMs: number;
    bestLap: string | null;
    bestLapMs: number | null;
    averageLap: string | null;
    averageLapMs: number | null;
    totalLaps: number;
    validLaps: number;
    distance: number;
    fuelUsed: number;
    weather: string;
    trackTemp: number;
    airTemp: number;
}

export interface LapData {
    id: number
    stintId: number;
    lapNumber: number;
    lapTime: string; // "3:28.456" format
    lapTimeMs: number;
    sector1: string;
    sector1Ms: number;
    sector2: string;
    sector2Ms: number;
    sector3: string;
    sector3Ms: number;
    isValid: boolean;
    delta: number; // Delta to best lap in milliseconds
    fuelUsed: number;
    tyrePressure: { fl: number; fr: number; rl: number; rr: number };
    speed: { sector1: number; sector2: number; sector3: number; topSpeed: number };
}

export interface LiveSessionData {
    sessionId: number | null;
    isConnected: boolean;
    sessionType: string;
    track: string;
    car: string;
    sessionTimeRemaining: string;
    currentLap: number;
    position: number;
    fuelLevel: number; // Fuel percentage
    tyrePressures: {
        frontLeft: number;
        frontRight: number;
        rearLeft: number;
        rearRight: number;
    };
    weather: string;
    trackTemp: number;
    airTemp: number;
    lastLap?: LapData;
    bestLapTime?: string | null;
    optimalLapTime?: string | null;
}

export interface SessionFilters {
    simulator?: string;
    track?: string;
    car?: string;
    sessionType?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// --- NEW TYPES START ---

export interface Simulator {
    id: number;
    name: string;
}

export interface GlobalDashboardStats {
    totalSessions: number;
    totalLaps: number;
    totalDriveTime: string; // Formatted as "HH:MM:SS"
    recentSessions: SessionSummary[];
}

// For now, ModuleDashboardStats is identical to GlobalDashboardStats.
// It can be expanded with module-specific stats in the future.
export type ModuleDashboardStats = GlobalDashboardStats;

// --- NEW TYPES END ---


// =================================================================
//                      MODULE & API DEFINITIONS
// =================================================================

export interface TransponderStatus {
    message: string;
    color: string;
}

export interface IRaceWorkshopAPI {
    simulators: {
        getSimulatorList: () => Promise<Simulator[]>;
    };
    dashboard: {
        getGlobalDashboardStats: () => Promise<GlobalDashboardStats>;
        getModuleDashboardStats: (simulatorId: number) => Promise<ModuleDashboardStats>;
    };
    sessions: {
        getSessionHistory: (filters: SessionFilters) => Promise<SessionSummary[]>;
        getSessionDetail: (sessionId: number) => Promise<{ session: SessionSummary; laps: LapData[] } | null>;
    };
    telemetry: {
        start: (simulatorId: string) => void;
        stop: () => void;
        onData: (callback: (data: LiveSessionData) => void) => () => void;
        getLapTelemetry: (lapId: number) => Promise<any>; // Define a proper type for telemetry data later
        compareLaps: (lapId1: number, lapId2: number) => Promise<any>; // Define a proper type for comparison data later
    };
}