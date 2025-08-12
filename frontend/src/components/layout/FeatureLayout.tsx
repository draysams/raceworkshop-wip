import type React from "react";
import { BaseLayout } from "./BaseLayout";

interface FeatureLayoutProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
}

export function FeatureLayout({ children, className = "", header }: FeatureLayoutProps) {
  return (
    <div className={`h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950 flex flex-col overflow-hidden ${className}`}>
      {header}
      <BaseLayout>
        {children}
      </BaseLayout>
    </div>
  );
}