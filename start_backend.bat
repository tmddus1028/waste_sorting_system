@echo off
cd /d "%~dp0"
title Waste Sorting AI Backend
echo Starting Waste Sorting AI backend...
echo Server URL: http://127.0.0.1:8000
echo Do not close this window while using the website.
echo Wait until you see: Uvicorn running on http://127.0.0.1:8000
echo.

for /f "tokens=5" %%P in ('netstat -ano ^| findstr "127.0.0.1:8000" ^| findstr "LISTENING"') do (
    echo Stopping old backend process on port 8000: %%P
    taskkill /PID %%P /F >nul 2>nul
)

"C:\Python314\python.exe" -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --log-level info
echo.
echo Backend server stopped. If you saw an error above, check that Python packages are installed:
echo "C:\Python314\python.exe" -m pip install -r backend\requirements.txt
pause
