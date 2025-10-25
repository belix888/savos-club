@echo off
REM SavosBot Telegram Bot Startup Script for Windows
REM This script initializes and starts the Telegram bot

echo 🚀 Starting SavosBot Telegram Bot...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from template...
    if exist env-telegram.txt (
        copy env-telegram.txt .env
        echo ✅ .env file created from template
        echo ⚠️  Please edit .env file with your actual values before running again
        pause
        exit /b 1
    ) else (
        echo ❌ env-telegram.txt template not found
        pause
        exit /b 1
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist data mkdir data
if not exist logs mkdir logs

REM Start the bot
echo 🤖 Starting Telegram Bot...
node telegram-bot.js

pause
