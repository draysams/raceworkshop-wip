"use client"

import type React from "react"

import { useState } from "react"

interface ComingSoonOverlayProps {
    title: string
    description?: string
    children: React.ReactNode
    showInfoButton?: boolean
}

export function ComingSoonOverlay({ title, description, children, showInfoButton = true }: ComingSoonOverlayProps) {
    const [showModal, setShowModal] = useState(false)

    return (
        <>
            <div className="relative">
                {/* Content (made semi-transparent) */}
                <div className="opacity-30 pointer-events-none">{children}</div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                        {description && <p className="text-gray-400 mb-4">{description}</p>}
                        {showInfoButton && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Learn More
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Paint Shop Development</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-white font-medium mb-2">🎨 What's Coming</h4>
                                <ul className="text-gray-400 text-sm space-y-1">
                                    <li>• Visual livery editor with drag & drop</li>
                                    <li>• Template library for all car models</li>
                                    <li>• Custom decal and sponsor management</li>
                                    <li>• Real-time 3D preview</li>
                                    <li>• Export to game-ready formats</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="text-white font-medium mb-2">📅 Timeline</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Beta Release:</span>
                                        <span className="text-accent">Q2 2024</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Full Release:</span>
                                        <span className="text-white">Q3 2024</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-accent/10 border border-accent/20 rounded p-3">
                                <p className="text-accent text-sm">
                                    <strong>Early Access:</strong> Join our Discord community to get notified about beta testing
                                    opportunities!
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-surface hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-md border border-border transition-colors"
                            >
                                Close
                            </button>
                            <button className="flex-1 bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-md transition-colors">
                                Join Discord
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
