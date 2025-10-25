#!/bin/bash

# SavosBot Telegram Bot Startup Script
# This script initializes and starts the Telegram bot

echo "🚀 Starting SavosBot Telegram Bot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env-telegram.txt ]; then
        cp env-telegram.txt .env
        echo "✅ .env file created from template"
        echo "⚠️  Please edit .env file with your actual values before running again"
        exit 1
    else
        echo "❌ env-telegram.txt template not found"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p logs

# Set permissions
chmod 755 telegram-bot.js
chmod 755 database-init.js
chmod 755 website-connection.js

# Start the bot
echo "🤖 Starting Telegram Bot..."
node telegram-bot.js
