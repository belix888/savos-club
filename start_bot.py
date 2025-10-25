#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SavosBot Club - Telegram Bot Startup Script
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import telegram
        import aiohttp
        import dotenv
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def setup_environment():
    """Setup environment files"""
    env_file = Path(".env")
    env_template = Path("env-python.txt")
    
    if not env_file.exists():
        if env_template.exists():
            print("⚠️  .env file not found. Creating from template...")
            env_file.write_text(env_template.read_text())
            print("✅ .env file created from template")
            print("⚠️  Please edit .env file with your actual values before running again")
            return False
        else:
            print("❌ env-python.txt template not found")
            return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = ["data", "logs"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def install_dependencies():
    """Install dependencies if needed"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

async def test_website_connection():
    """Test website connection"""
    try:
        from website_connection import WebsiteConnection
        from dotenv import load_dotenv
        
        load_dotenv()
        
        website_url = os.getenv('WEBSITE_URL', 'https://your-app.vercel.app')
        api_key = os.getenv('API_KEY', 'savosbot2024')
        
        conn = WebsiteConnection(website_url, api_key)
        health = await conn.check_website_health()
        
        if health.get('status') == 'ok':
            print("✅ Website connection successful")
        else:
            print(f"⚠️  Website connection issue: {health}")
            
    except Exception as e:
        print(f"⚠️  Website connection test failed: {e}")

def main():
    """Main startup function"""
    print("🚀 Starting SavosBot Telegram Bot...")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Setup environment
    if not setup_environment():
        return False
    
    # Create directories
    create_directories()
    
    # Check dependencies
    if not check_dependencies():
        print("Installing dependencies...")
        if not install_dependencies():
            return False
    
    # Test website connection
    print("Testing website connection...")
    asyncio.run(test_website_connection())
    
    # Start the bot
    print("🤖 Starting Telegram Bot...")
    try:
        from telegram_bot import main as bot_main
        asyncio.run(bot_main())
    except KeyboardInterrupt:
        print("\n👋 Bot stopped by user")
    except Exception as e:
        print(f"❌ Bot error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
