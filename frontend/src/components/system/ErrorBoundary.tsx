"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black flex items-center justify-center p-8">
                    <div className="bg-surface border border-border rounded-lg p-8 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
                        </div>

                        <p className="text-gray-400 mb-6">An unexpected error occurred. Please restart the application.</p>

                        {this.state.error && (
                            <details className="mb-6">
                                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
                                    Error details
                                </summary>
                                <pre className="mt-2 text-xs text-gray-500 bg-black p-3 rounded border border-border overflow-auto font-mono">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
                        >
                            Restart Application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
