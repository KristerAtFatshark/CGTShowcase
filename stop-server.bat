@echo off
setlocal

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":4201 .*LISTENING"') do (
  taskkill /PID %%p /F >nul 2>&1
)

endlocal
