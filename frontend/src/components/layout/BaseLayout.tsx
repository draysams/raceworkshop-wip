import type React from "react"
interface BaseLayoutProps {
    children: React.ReactNode
}

export function BaseLayout({ children }: BaseLayoutProps) {
    return (
        <div className="flex-1 overflow-auto">
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}
