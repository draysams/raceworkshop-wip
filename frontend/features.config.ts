export interface SubmoduleConfig {
    name: string
    enabled: boolean
}

export interface ModuleConfig {
    name: string
    icon: string
    enabled: boolean
    submodules: {
        dashboard: SubmoduleConfig
        transponder: SubmoduleConfig
        sessions: SubmoduleConfig
        telemetry: SubmoduleConfig
        setup: SubmoduleConfig
    }
}

export interface FeaturesConfig {
    [key: string]: ModuleConfig
}

export const features: FeaturesConfig = {
    lmu: {
        name: "Le Mans Ultimate",
        icon: "🏁",
        enabled: true,
        submodules: {
            dashboard: { name: "Dashboard", enabled: true },
            transponder: { name: "Transponder", enabled: true },
            sessions: { name: "Sessions", enabled: true },
            telemetry: { name: "Telemetry", enabled: false },
            setup: { name: "Setup", enabled: false },
        },
    },
    acc: {
        name: "Assetto Corsa Competizione",
        icon: "🏎️",
        enabled: true,
        submodules: {
            dashboard: { name: "Dashboard", enabled: true },
            transponder: { name: "Transponder", enabled: true },
            sessions: { name: "Sessions", enabled: true },
            telemetry: { name: "Telemetry", enabled: false },
            setup: { name: "Setup", enabled: false },
        },
    },
    ac: {
        name: "Assetto Corsa",
        icon: "🚗",
        enabled: false,
        submodules: {
            dashboard: { name: "Dashboard", enabled: true },
            transponder: { name: "Transponder", enabled: false },
            sessions: { name: "Sessions", enabled: false },
            telemetry: { name: "Telemetry", enabled: false },
            setup: { name: "Setup", enabled: false },
        },
    },
    iracing: {
        name: "iRacing",
        icon: "🏆",
        enabled: false,
        submodules: {
            dashboard: { name: "Dashboard", enabled: true },
            transponder: { name: "Transponder", enabled: false },
            sessions: { name: "Sessions", enabled: false },
            telemetry: { name: "Telemetry", enabled: false },
            setup: { name: "Setup", enabled: false },
        },
    },
}
