"use client"

import { DatePicker } from "./DatePicker"

interface DateRangePickerProps {
    fromDate: string
    toDate: string
    onFromDateChange: (date: string) => void
    onToDateChange: (date: string) => void
    className?: string
}

export function DateRangePicker({
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    className = "",
}: DateRangePickerProps) {
    const clearRange = () => {
        onFromDateChange("")
        onToDateChange("")
    }

    const hasDateRange = fromDate || toDate

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="block text-sm text-gray-400">Date Range</label>
                {hasDateRange && (
                    <button
                        type="button"
                        onClick={clearRange}
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear Range
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-2">
                <DatePicker value={fromDate} onChange={onFromDateChange} placeholder="From date" />
                <DatePicker value={toDate} onChange={onToDateChange} placeholder="To date" />
            </div>

            {/* Quick date range buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date()
                        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                        onFromDateChange(lastWeek.toISOString().split("T")[0])
                        onToDateChange(today.toISOString().split("T")[0])
                    }}
                    className="px-2 py-1 bg-black hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded text-xs transition-colors"
                >
                    Last 7 days
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date()
                        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                        onFromDateChange(lastMonth.toISOString().split("T")[0])
                        onToDateChange(today.toISOString().split("T")[0])
                    }}
                    className="px-2 py-1 bg-black hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 rounded text-xs transition-colors"
                >
                    Last 30 days
                </button>
            </div>
        </div>
    )
}
