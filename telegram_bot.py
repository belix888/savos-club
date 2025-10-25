#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SavosBot Club - Telegram Bot
Python version with website integration
"""

import os
import json
import logging
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

import aiohttp
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from dotenv import load_dotenv

# Import local modules
from database_init import DatabaseManager
from website_connection import WebsiteConnection

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class SavosBot:
    def __init__(self):
        self.bot_token = os.getenv('BOT_TOKEN')
        self.website_url = os.getenv('WEBSITE_URL', 'https://your-app.vercel.app')
        self.api_key = os.getenv('API_KEY', 'savosbot2024')
        
        # Initialize components
        self.db_manager = DatabaseManager()
        self.website_conn = WebsiteConnection(self.website_url, self.api_key)
        
        # Initialize application
        self.application = Application.builder().token(self.bot_token).build()
        
        # Setup handlers
        self.setup_handlers()
        
    def setup_handlers(self):
        """Setup command and callback handlers"""
        # Command handlers
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("stats", self.stats_command))
        
        # Callback handlers
        self.application.add_handler(CallbackQueryHandler(self.stats_callback, pattern='^stats$'))
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        user = update.effective_user
        logger.info(f"Start command received from user {user.id}")
        
        # Prepare user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'joined_at': datetime.now().isoformat(),
            'is_active': True
        }
        
        # Save user to database
        await self.db_manager.save_user(user_data)
        
        # Send to website
        await self.website_conn.send_user_to_website(user_data)
        
        # Create keyboard
        keyboard = [
            [
                InlineKeyboardButton(
                    "📱 Открыть приложение",
                    web_app=WebAppInfo(url=self.website_url)
                )
            ],
            [
                InlineKeyboardButton(
                    "🔧 Админ-панель",
                    web_app=WebAppInfo(url=f"{self.website_url}/admin-panel")
                )
            ],
            [
                InlineKeyboardButton("📊 Статистика", callback_data="stats")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        # Send welcome message
        await update.message.reply_text(
            "🎉 Добро пожаловать в SavosBot Club!\n\n"
            "Используйте кнопки ниже для навигации:",
            reply_markup=reply_markup
        )
        
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = (
            "🤖 SavosBot Club - Помощь\n\n"
            "Команды:\n"
            "/start - Начать работу\n"
            "/help - Показать помощь\n"
            "/stats - Показать статистику"
        )
        await update.message.reply_text(help_text)
        
    async def stats_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /stats command"""
        stats = await self.db_manager.get_statistics()
        
        stats_text = (
            f"📊 Статистика SavosBot Club:\n\n"
            f"👥 Всего пользователей: {stats['total_users']}\n"
            f"🟢 Активных: {stats['active_users']}\n"
            f"📅 Зарегистрировано сегодня: {stats['today_users']}"
        )
        
        await update.message.reply_text(stats_text)
        
    async def stats_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle stats callback"""
        query = update.callback_query
        await query.answer()
        
        stats = await self.db_manager.get_statistics()
        
        stats_text = (
            f"📊 Статистика SavosBot Club:\n\n"
            f"👥 Всего пользователей: {stats['total_users']}\n"
            f"🟢 Активных: {stats['active_users']}\n"
            f"📅 Зарегистрировано сегодня: {stats['today_users']}"
        )
        
        await query.edit_message_text(stats_text)
        
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle errors"""
        logger.error(f"Update {update} caused error {context.error}")
        
    def run(self):
        """Run the bot"""
        logger.info("🚀 Starting SavosBot...")
        
        # Add error handler
        self.application.add_error_handler(self.error_handler)
        
        # Start the bot
        self.application.run_polling()

async def main():
    """Main function"""
    # Initialize database
    db_manager = DatabaseManager()
    await db_manager.initialize()
    
    # Initialize website connection
    website_conn = WebsiteConnection(
        os.getenv('WEBSITE_URL', 'https://your-app.vercel.app'),
        os.getenv('API_KEY', 'savosbot2024')
    )
    
    # Test website connection
    health = await website_conn.check_website_health()
    logger.info(f"Website health: {health}")
    
    # Create and run bot
    bot = SavosBot()
    bot.run()

if __name__ == '__main__':
    asyncio.run(main())
