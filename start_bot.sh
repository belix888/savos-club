#!/bin/bash

# SavosBot Club - Telegram Bot Startup Script for Linux/Mac
# This script initializes and starts the Telegram bot

echo "🚀 Starting SavosBot Telegram Bot..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 3.8 or higher is required. Current version: $python_version"
    exit 1
fi

echo "✅ Python version: $python_version"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env-python.txt ]; then
        cp env-python.txt .env
        echo "✅ .env file created from template"
        echo "⚠️  Please edit .env file with your actual values before running again"
        exit 1
    else
        echo "❌ env-python.txt template not found"
        exit 1
    fi
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p logs

# Set permissions
chmod +x start_bot.py
chmod +x telegram_bot.py
chmod +x database_init.py
chmod +x website_connection.py

# Start the bot
echo "🤖 Starting Telegram Bot..."
python3 start_bot.py
