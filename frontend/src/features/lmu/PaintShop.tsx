"use client"

import { ComingSoonOverlay } from "../../components/ui/ComingSoonOverlay"

export function LMUPaintShop() {
    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-white mb-2">Paint Shop</h1>
                    <p className="text-gray-400">Create and manage custom liveries for Le Mans Ultimate</p>
                </div>

                <ComingSoonOverlay
                    title="Paint Shop Coming Soon"
                    description="Advanced livery editor with 3D preview and template library"
                >
                    <div className="space-y-6">
                        {/* Main Editor Area */}
                        <div className="bg-surface border border-border rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Livery Editor</h3>
                                <div className="flex gap-2">
                                    <button className="bg-accent text-white px-3 py-1 rounded text-sm">Save</button>
                                    <button className="bg-surface border border-border text-white px-3 py-1 rounded text-sm">
                                        Export
                                    </button>
                                </div>
                            </div>

                            {/* 3D Preview Area */}
                            <div className="bg-black border border-border rounded-lg h-64 flex items-center justify-center mb-4">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-red-500 rounded-lg mx-auto mb-2"></div>
                                    <p className="text-gray-400">3D Car Preview</p>
                                </div>
                            </div>

                            {/* Tools Panel */}
                            <div className="grid grid-cols-4 gap-2">
                                {["Colors", "Decals", "Numbers", "Sponsors"].map((tool) => (
                                    <button
                                        key={tool}
                                        className="bg-black border border-border text-white py-2 px-3 rounded text-sm hover:bg-gray-800 transition-colors"
                                    >
                                        {tool}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Livery Gallery */}
                            <div className="bg-surface border border-border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Your Liveries</h3>
                                <div className="space-y-3">
                                    {[
                                        { name: "Racing Stripes", car: "Porsche 963", colors: "from-blue-500 to-white" },
                                        { name: "Flame Design", car: "Ferrari 499P", colors: "from-red-500 to-yellow-500" },
                                        { name: "Carbon Fiber", car: "BMW M4 GT3", colors: "from-gray-800 to-gray-600" },
                                    ].map((livery, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-black rounded border border-border">
                                            <div className={`w-12 h-8 bg-gradient-to-r ${livery.colors} rounded`}></div>
                                            <div className="flex-1">
                                                <h4 className="text-white font-medium">{livery.name}</h4>
                                                <p className="text-gray-400 text-sm">{livery.car}</p>
                                            </div>
                                            <button className="text-accent hover:text-accent-hover text-sm">Edit</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Templates & Assets */}
                            <div className="bg-surface border border-border rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Templates & Assets</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-white font-medium mb-2">Car Templates</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {["Porsche 963", "Ferrari 499P", "BMW M4"].map((car) => (
                                                <div key={car} className="bg-black border border-border rounded p-2 text-center">
                                                    <div className="w-full h-8 bg-gray-700 rounded mb-1"></div>
                                                    <p className="text-xs text-gray-400">{car}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-white font-medium mb-2">Decal Library</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="bg-black border border-border rounded p-2 aspect-square">
                                                    <div className="w-full h-full bg-accent/20 rounded"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ComingSoonOverlay>
            </div>
        </div>
    )
}
