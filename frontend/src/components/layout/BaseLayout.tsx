import type React from "react"
interface BaseLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
}

export function BaseLayout({ children, title, subtitle }: BaseLayoutProps) {
    return (
        <div className="flex-1 overflow-auto bg-black">
            <div className="p-6">
                {(title || subtitle) && (
                    <div className="mb-6">
                        {title && <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>}
                        {subtitle && <p className="text-gray-400">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
