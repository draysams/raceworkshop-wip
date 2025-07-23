import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./components/system/ErrorBoundary"
import "./index.css"

/**
 * Ensure the application can bootstrap even if an element
 * with id="root" is not present (e.g., in a preview iframe).
 */
let container = document.getElementById("root")
if (!container) {
  container = document.createElement("div")
  container.id = "root"
  document.body.appendChild(container)
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
