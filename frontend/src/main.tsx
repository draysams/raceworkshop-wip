// frontend/src/main.tsx
import React from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./components/system/ErrorBoundary"
import "./index.css"

/**
 * Renders the React application into the DOM.
 */
const renderApp = () => {
  let container = document.getElementById("root")
  if (!container) {
    container = document.createElement("div")
    container.id = "root"
    document.body.appendChild(container)
  }
  
  const root = createRoot(container)
  
  root.render(
    // <React.StrictMode>  // <-- Temporarily commented out for Chunk 3 WebSocket testing
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    // </React.StrictMode>, // <-- Temporarily commented out for Chunk 3 WebSocket testing
  )
}

// --- THIS IS THE FIX ---
// We wrap the entire application bootstrap logic in an event listener.
// The 'pywebviewready' event is fired by the Python backend once its API
// has been successfully injected into the JavaScript 'window' object.
// This completely resolves the race condition where the React app might
// try to call the API before it exists.
window.addEventListener('pywebviewready', () => {
  console.log("Pywebview is ready. Rendering React application.")
  renderApp()
})
// --- END FIX ---