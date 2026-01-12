@echo off
REM Multi-Modal Prompt Refinement System - Windows Setup Script
REM This script helps automate the initial setup process

echo ============================================
echo Multi-Modal Prompt Refinement System Setup
echo ============================================
echo.

REM Check for Node.js
echo [1/7] Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js found
node --version
echo.

REM Check for npm
echo [2/7] Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm found
npm --version
echo.

REM Install backend dependencies
echo [3/7] Installing backend dependencies...
cd backend
if not exist "package.json" (
    echo ERROR: backend/package.json not found!
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
echo.

REM Setup backend .env
echo [4/7] Setting up backend environment...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo ✓ Created backend/.env from template
        echo.
        echo IMPORTANT: Please edit backend/.env and add your API keys:
        echo   - GROQ_API_KEY
        echo   - HUGGINGFACE_API_KEY
        echo.
    ) else (
        echo WARNING: .env.example not found
    )
) else (
    echo ✓ backend/.env already exists
)
cd ..
echo.

REM Install frontend dependencies
echo [5/7] Installing frontend dependencies...
cd frontend
if not exist "package.json" (
    echo ERROR: frontend/package.json not found!
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend npm install failed!
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed
echo.

REM Setup frontend .env
echo [6/7] Setting up frontend environment...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env
        echo ✓ Created frontend/.env from template
        echo.
        echo IMPORTANT: Please edit frontend/.env and add your Cloudinary credentials:
        echo   - REACT_APP_CLOUDINARY_CLOUD_NAME
        echo   - REACT_APP_CLOUDINARY_UPLOAD_PRESET
        echo.
    ) else (
        echo WARNING: .env.example not found
    )
) else (
    echo ✓ frontend/.env already exists
)
cd ..
echo.

echo [7/7] Setup verification...
echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo NEXT STEPS:
echo.
echo 1. Configure API Keys:
echo    - Edit backend\.env and add:
echo      * GROQ_API_KEY (get from https://console.groq.com)
echo      * HUGGINGFACE_API_KEY (get from https://huggingface.co/settings/tokens)
echo.
echo 2. Configure Cloudinary:
echo    - Edit frontend\.env and add:
echo      * REACT_APP_CLOUDINARY_CLOUD_NAME
echo      * REACT_APP_CLOUDINARY_UPLOAD_PRESET
echo    - Get credentials from https://cloudinary.com
echo.
echo 3. Start the Backend:
echo    - Open a terminal
echo    - cd backend
echo    - npm start
echo.
echo 4. Start the Frontend (in a new terminal):
echo    - Open another terminal
echo    - cd frontend
echo    - npm start
echo.
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see QUICKSTART.md
echo For troubleshooting, see TROUBLESHOOTING.md
echo.
pause
