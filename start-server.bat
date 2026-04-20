@echo off
setlocal

set "ROOT_DIR=%~dp0"

start "CGTShowcase Dev Server" cmd /k "cd /d "%ROOT_DIR%" ^&^& npm.cmd start -- --host 0.0.0.0 --port 4201"

endlocal
