import type React from "react"
import { BaseLayout } from "../../components/layout/BaseLayout"

interface FeatureTemplateProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export function FeatureTemplate({ title, subtitle, children }: FeatureTemplateProps) {
    return (
        <BaseLayout title={title} subtitle={subtitle}>
            {children}
        </BaseLayout>
    )
}
