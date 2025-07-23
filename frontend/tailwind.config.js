import { fontFamily } from 'tailwindcss/defaultTheme';
import defaultConfig from "shadcn/ui/tailwind.config"

/** @type {import('tailwindcss').Config} */
export default {
    ...defaultConfig,


    content: [
        "./index.html",
        "./src/ui/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        ...defaultConfig.theme,
        extend: {
            fontFamily: {
                sans: ['Geist', ...fontFamily.sans],
                mono: ['Geist Mono', ...fontFamily.mono],
            },
            // Define our semantic color palette directly with hex codes.
            colors: {
                ...defaultConfig.theme.extend.colors,
                primary: "#000000", // True black like Vercel
                secondary: "#0a0a0a", // Very dark grey for content areas
                surface: "#171717", // Dark grey for elevated elements
                border: "#1f1f1f", // Much dimmer border color - dark grey instead of bright
                accent: {
                    DEFAULT: "#8b5cf6", // Purple accent
                    hover: "#7c3aed", // Darker purple for hover
                    secondary: "#10b981", // Green accent for positive states
                    foreground: "hsl(var(--accent-foreground))",
                },
                foreground: {
                    DEFAULT: "#fafafa", // Primary text - very light
                    secondary: "#a1a1aa", // Secondary text - medium grey
                    tertiary: "#71717a", // Tertiary text - darker grey
                },
                // Add these for immediate use
                "text-primary": "#fafafa",
                "text-secondary": "#a1a1aa",
                "text-tertiary": "#71717a",
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                ...defaultConfig.theme.extend.keyframes,
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                pulse: {
                    "0%": {
                        transform: "scale(1)",
                        opacity: "1",
                    },
                    "50%": {
                        transform: "scale(1.05)",
                        opacity: "0.7",
                    },
                    "100%": {
                        transform: "scale(1)",
                        opacity: "1",
                    },
                },
            },
            animation: {
                ...defaultConfig.theme.extend.animation,
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", // Added pulse animation
            },
        },
    },
    plugins: [...defaultConfig.plugins, require("tailwindcss-animate")], // Plugins remain unchanged
}