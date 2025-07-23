# Makefile for RaceWorkshop Python Application

# --- Variables ---
PYTHON_ENV := venv
FRONTEND_DIR := frontend
FRONTEND_BUILD_CMD := npm run build
MAIN_APP_SCRIPT := main.py

# --- Colors for Output ---
# For better readability in the terminal
export COLOR_BLUE = \033[0;34m
export COLOR_GREEN = \033[0;32m
export COLOR_NC = \033[0m # No Color

# --- Default Target ---
# If you just type 'make', it will run the 'run' target.
.DEFAULT_GOAL := run

# --- Targets ---

# Target to build the frontend
# 'cd frontend && npm run build' is executed in a subshell.
# The 'cd' command is necessary because npm commands are run relative to the current directory.
frontend_build:
	@echo "$(COLOR_BLUE)Building frontend...$(COLOR_NC)"
	@$(MAKE) -C $(FRONTEND_DIR) $(FRONTEND_BUILD_CMD)
	@echo "$(COLOR_GREEN)Frontend build complete.$(COLOR_NC)"

# Target to activate the Python virtual environment and run the main application
run: frontend_build # This means 'run' depends on 'frontend_build'
	@echo "$(COLOR_BLUE)Activating Python environment and running main application...$(COLOR_NC)"
	@echo "If you see (venv) prompt, you can skip this. Otherwise, manually activate:"
	@echo "  Windows: .\\venv\\Scripts\\activate.bat"
	@echo "  macOS/Linux: source ./venv/bin/activate"
	@# The following command attempts to run the script, assuming venv is active.
	@# Forcing activation within the script is complex and OS-dependent.
	@# It's safer to instruct the user to activate it manually first.
	@python $(MAIN_APP_SCRIPT)
	@echo "$(COLOR_GREEN)Application has exited.$(COLOR_NC)"

# Target to clean build artifacts (frontend dist and pyinstaller temp files if applicable)
clean:
	@echo "$(COLOR_BLUE)Cleaning build artifacts...$(COLOR_NC)"
	@rm -rf frontend/dist
	@rm -rf build
	@rm -rf dist
	@rm -rf *.spec
	@echo "$(COLOR_GREEN)Cleaned build artifacts.$(COLOR_NC)"

# Help target to show available commands
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  run          Builds the frontend and runs the main Python application."
	@echo "  frontend_build Builds the frontend application (run manually if needed)."
	@echo "  clean        Removes build artifacts (frontend/dist, etc.)."
	@echo "  help         Displays this help message."
	@echo ""
	@echo "Note: Ensure your Python virtual environment ('venv') is activated before running 'make run'."