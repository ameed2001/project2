@echo off
echo Stopping development server...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Starting development server...
cd /d "%~dp0"
start cmd /k "yarn dev"
echo Development server restarted!
