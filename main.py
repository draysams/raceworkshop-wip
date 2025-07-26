# main.py (DIAGNOSTIC LAUNCHER)

import webview
import os
import sys
import subprocess
from rw_backend.core.api_bridge import ApiBridge
from rw_backend.database.manager import initialize_database

daemon_process = None

def main():
    global daemon_process
    initialize_database()

    print("[Main] Launching background daemon process...", flush=True)
    try:
        python_executable = sys.executable
        command = [python_executable, "daemon.py"]
        
        # --- THE FIX FOR DEBUGGING ---
        # On Windows, we will temporarily remove all output redirection and
        # use the CREATE_NEW_CONSOLE flag. This will force a new, separate
        # console window to open for the daemon, where we are guaranteed to see its output.
        creationflags = 0
        if sys.platform == "win32":
            creationflags = subprocess.CREATE_NEW_CONSOLE
            
        daemon_process = subprocess.Popen(command, creationflags=creationflags)
        print(f"[Main] Daemon process started in new window with PID: {daemon_process.pid}", flush=True)

    except Exception as e:
        print(f"[Main] CRITICAL: Failed to launch daemon process: {e}", flush=True)
        return

    # --- REGULAR PYWEBVIEW SETUP (Unchanged) ---
    api_bridge = ApiBridge()
    is_dev = os.getenv("RACEWORKSHOP_DEV_MODE") == "1"
    url = "http://localhost:5173" if is_dev else 'frontend/dist/index.html'
    
    print(f"--- Starting in {'DEVELOPMENT' if is_dev else 'PRODUCTION'} mode ---", flush=True)
    print(f"--- Loading UI from: {url} ---", flush=True)
    
    window = webview.create_window('RaceWorkshop', url, js_api=api_bridge, width=1600, height=1200, min_size=(1024, 768))
    
    def on_closing():
        print("[Main] Window is closing. Terminating daemon process...", flush=True)
        if daemon_process:
            daemon_process.terminate()
            try:
                daemon_process.wait(timeout=5)
                print("[Main] Daemon process terminated gracefully.", flush=True)
            except subprocess.TimeoutExpired:
                print("[Main] Daemon process did not terminate gracefully, forcing kill.", flush=True)
                daemon_process.kill()
    
    window.events.closing += on_closing
    webview.start(debug=is_dev)

if __name__ == '__main__':
    main()