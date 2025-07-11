@echo off
echo ========================================
echo   Salem Coaching System - Tiger Jokes
echo ========================================
echo.
echo Starting the development server...
echo.
cd /d "C:\Users\a_sub\salem-coaching-system"

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting the server...
echo.
echo ----------------------------------------
echo Server will start at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo ----------------------------------------
echo.

call npm run dev

pause