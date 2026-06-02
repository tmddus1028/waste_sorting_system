@echo off
cd /d "%~dp0frontend"
title Waste Sorting Vite Dev Server
echo Starting Waste Sorting Vite dev server...
echo Web URL: shown by Vite below
echo Do not close this window while using the website.
echo.
npm run dev -- --host 127.0.0.1
echo.
echo Web server stopped.
pause
