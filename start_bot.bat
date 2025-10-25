@echo off
REM SavosBot Club - Telegram Bot Startup Script for Windows
REM This script initializes and starts the Telegram bot

echo 🚀 Starting SavosBot Telegram Bot...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from template...
    if exist env-python.txt (
        copy env-python.txt .env
        echo ✅ .env file created from template
        echo ⚠️  Please edit .env file with your actual values before running again
        pause
        exit /b 1
    ) else (
        echo ❌ env-python.txt template not found
        pause
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist data mkdir data
if not exist logs mkdir logs

REM Start the bot
echo 🤖 Starting Telegram Bot...
python start_bot.py

pause
