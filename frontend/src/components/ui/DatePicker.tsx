"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface DatePickerProps {
    value: string
    onChange: (date: string) => void
    placeholder?: string
    className?: string
}

export function DatePicker({ value, onChange, placeholder = "Select date", className = "" }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [displayValue, setDisplayValue] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Format date for display
    useEffect(() => {
        if (value) {
            const date = new Date(value)
            setDisplayValue(date.toLocaleDateString())
        } else {
            setDisplayValue("")
        }
    }, [value])

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value
        onChange(newDate)
        setIsOpen(false)
    }

    const clearDate = () => {
        onChange("")
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent text-left flex items-center justify-between hover:border-gray-700 transition-colors"
            >
                <span className={displayValue ? "text-white" : "text-gray-400"}>{displayValue || placeholder}</span>
                <div className="flex items-center gap-1">
                    {value && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                clearDate()
                            }}
                            className="text-gray-400 hover:text-white transition-colors p-1"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-gray-800 rounded-lg shadow-lg z-50 p-4">
                    <div className="mb-3">
                        <label className="block text-sm text-gray-400 mb-2">Select Date</label>
                        <input
                            ref={inputRef}
                            type="date"
                            value={value}
                            onChange={handleDateChange}
                            className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-3 py-2 bg-black hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={clearDate}
                            className="flex-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
