@echo off
echo Starting SmartPark...

echo Clearing ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 "') do taskkill /PID %%a /F >nul 2>&1

timeout /t 2 /nobreak >nul

echo Starting API...
start "SmartPark API" cmd /k "cd /d G:\ACloude\Project\SmartPark\src\SmartPark.Api && dotnet run"

timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "SmartPark Frontend" cmd /k "cd /d G:\ACloude\Project\SmartPark\frontend\smartpark-ui && npm run dev"

echo Done! API on port 5000, Frontend on port 5173.
