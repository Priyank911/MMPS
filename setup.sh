#!/bin/bash
# Multi-Modal Prompt Refinement System - Linux/Mac Setup Script
# This script helps automate the initial setup process

echo "============================================"
echo "Multi-Modal Prompt Refinement System Setup"
echo "============================================"
echo ""

# Check for Node.js
echo "[1/7] Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js found"
node --version
echo ""

# Check for npm
echo "[2/7] Checking for npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed!"
    exit 1
fi
echo "✓ npm found"
npm --version
echo ""

# Install backend dependencies
echo "[3/7] Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "ERROR: backend/package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Backend npm install failed!"
    exit 1
fi
echo "✓ Backend dependencies installed"
echo ""

# Setup backend .env
echo "[4/7] Setting up backend environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created backend/.env from template"
        echo ""
        echo "IMPORTANT: Please edit backend/.env and add your API keys:"
        echo "  - GROQ_API_KEY"
        echo "  - HUGGINGFACE_API_KEY"
        echo ""
    else
        echo "WARNING: .env.example not found"
    fi
else
    echo "✓ backend/.env already exists"
fi
cd ..
echo ""

# Install frontend dependencies
echo "[5/7] Installing frontend dependencies..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "ERROR: frontend/package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Frontend npm install failed!"
    exit 1
fi
echo "✓ Frontend dependencies installed"
echo ""

# Setup frontend .env
echo "[6/7] Setting up frontend environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created frontend/.env from template"
        echo ""
        echo "IMPORTANT: Please edit frontend/.env and add your Cloudinary credentials:"
        echo "  - REACT_APP_CLOUDINARY_CLOUD_NAME"
        echo "  - REACT_APP_CLOUDINARY_UPLOAD_PRESET"
        echo ""
    else
        echo "WARNING: .env.example not found"
    fi
else
    echo "✓ frontend/.env already exists"
fi
cd ..
echo ""

echo "[7/7] Setup verification..."
echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Configure API Keys:"
echo "   - Edit backend/.env and add:"
echo "     * GROQ_API_KEY (get from https://console.groq.com)"
echo "     * HUGGINGFACE_API_KEY (get from https://huggingface.co/settings/tokens)"
echo ""
echo "2. Configure Cloudinary:"
echo "   - Edit frontend/.env and add:"
echo "     * REACT_APP_CLOUDINARY_CLOUD_NAME"
echo "     * REACT_APP_CLOUDINARY_UPLOAD_PRESET"
echo "   - Get credentials from https://cloudinary.com"
echo ""
echo "3. Start the Backend:"
echo "   - Open a terminal"
echo "   - cd backend"
echo "   - npm start"
echo ""
echo "4. Start the Frontend (in a new terminal):"
echo "   - Open another terminal"
echo "   - cd frontend"
echo "   - npm start"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo "For troubleshooting, see TROUBLESHOOTING.md"
echo ""
