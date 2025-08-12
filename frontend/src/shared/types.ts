// frontend/src/shared/types.ts

// =================================================================
//                      CORE DATA STRUCTURES
// =================================================================

// --- NEW: Enhanced Track and Car interfaces ---
export interface Track {
    id: string;
    displayName: string;
    shortName: string;
    lengthM?: number;
    type?: string;
    imagePath?: string;
}

export interface Car {
    id: string;
    displayName: string;
    model?: string;
    class?: string;
    season?: string;
    manufacturer?: string;
    engine?: string;
    thumbnailUrl?: string;
}

export interface Setup {
    id: number;
    name: string;
    summary: any;
    details: any;
    weather: any;
}

export interface Stint {
    id: number;
    stintNumber: number;
    startedOnLap: number;
    endedOnLap: number | null;
    setup: Setup | null;
    // New enhanced fields
    bestLap: string | null;
    averageLap: string | null;
    optimalLap: string | null;
    consistency: string; // percentage like "95.2%"
    fuelUsed: number;
    startTime: string | null; // ISO timestamp
    endTime: string | null; // ISO timestamp
}

export interface SessionSummary {
    id: number;
    simulator: 'lmu' | 'acc' | 'ac' | 'iracing';
    track: Track;
    car: Car;
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
    // New fields from enhanced DTO
    distance: number;
    fuelUsed: number;
    weather: string;
    trackTemp: number;
    airTemp: number;
}

export interface SessionDetail extends SessionSummary {
    stints: Stint[];
    laps: LapData[];
    // New analytics object
    analytics: {
        optimalLap: string | null;
        fuelUsed: number;
        distanceCovered: number; // in kilometers
    };
}

export interface LapData {
    id: number;
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
    // Legacy fields for backward compatibility
    delta?: number; // Delta to best lap in milliseconds
    fuelUsed?: number;
    tyrePressure?: { fl: number; fr: number; rl: number; rr: number };
    speed?: { sector1: number; sector2: number; sector3: number; topSpeed: number };
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

// New analytics data structure based on the backend DashboardAnalytics service
export interface DashboardAnalytics {
    total_sessions: number;
    total_laps: number;
    track_time: string; // Formatted as "HH:MM:SS"
    total_distance_driven_km: number;
    most_driven_car: string;
    most_driven_track: string;
    favorite_combo: string;
    new_pbs_last_7_days: number;
    on_fire_track: string;
    consistency_score: string; // Formatted as "XX.X%"
    average_laps_per_session: number;
    most_active_day: string;
}

export interface GlobalDashboardStats {
    analytics: DashboardAnalytics;
    recentSessions: SessionSummary[];
}

// For now, ModuleDashboardStats is identical to GlobalDashboardStats.
// It can be expanded with module-specific stats in the future.
export type ModuleDashboardStats = GlobalDashboardStats;

// --- NEW TYPES END ---

// =================================================================
//                      TELEMETRY TYPES
// =================================================================

export interface TelemetryDataPoint {
    x: number; // Distance along lap
    y: number; // Value
}

export interface TelemetryChannel {
    label: string;
    data: TelemetryDataPoint[];
    borderColor: string;
    interpolate?: boolean;
    stepped?: boolean;
}

export interface TrackPathPoint {
    distance: number;
    x: number;
    y: number;
}

export interface LapTelemetryData {
    telemetry: {
        // Core telemetry channels
        speed: TelemetryChannel;
        throttle: TelemetryChannel;
        brake: TelemetryChannel;
        rpm: TelemetryChannel;
        gear: TelemetryChannel;
        steering: TelemetryChannel;
        fuelLevel: TelemetryChannel;
        
        // Tire data
        tirePressure: {
            fl: TelemetryChannel;
            fr: TelemetryChannel;
            rl: TelemetryChannel;
            rr: TelemetryChannel;
        };
        tireWear: {
            fl: TelemetryChannel;
            fr: TelemetryChannel;
            rl: TelemetryChannel;
            rr: TelemetryChannel;
        };
        tireTemp: {
            fl: TelemetryChannel;
            fr: TelemetryChannel;
            rl: TelemetryChannel;
            rr: TelemetryChannel;
        };
        
        // Brake temperatures (new)
        brakeTemp: {
            fl: TelemetryChannel;
            fr: TelemetryChannel;
            rl: TelemetryChannel;
            rr: TelemetryChannel;
        };
        
        // Ride height (new)
        rideHeight: {
            fl: TelemetryChannel;
            fr: TelemetryChannel;
            rl: TelemetryChannel;
            rr: TelemetryChannel;
        };
        
        // Session context fields (new)
        timeIntoLap: TelemetryChannel;
        estimatedLapTime: TelemetryChannel;
        trackEdge: TelemetryChannel;
    };
    trackpath: TrackPathPoint[];
}

export interface LapComparisonData {
    lap1: {
        lapId: number;
        telemetry: LapTelemetryData['telemetry'];
        trackpath: TrackPathPoint[];
    };
    lap2: {
        lapId: number;
        telemetry: LapTelemetryData['telemetry'];
        trackpath: TrackPathPoint[];
    };
}

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
        getSessionDetail: (sessionId: number) => Promise<SessionDetail | null>;
    };
    telemetry: {
        start: (simulatorId: string) => void;
        stop: () => void;
        onData: (callback: (data: LiveSessionData) => void) => () => void;
        getLapTelemetry: (lapId: number) => Promise<LapTelemetryData>;
        compareLaps: (lapId1: number, lapId2: number) => Promise<LapComparisonData>;
    };
}