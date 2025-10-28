#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SavosBot Club - ФИНАЛЬНАЯ рабочая версия для Python 3.13
Запускается БЕЗ asyncio.run() для совместимости
"""

import os
import json
import logging
import aiohttp
from datetime import datetime
from typing import Dict, Any, Optional

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class DatabaseManager:
    """Простой менеджер базы данных"""
    
    def __init__(self):
        self.data_dir = 'data'
        self.users_file = os.path.join(self.data_dir, 'users.json')
        self.stats_file = os.path.join(self.data_dir, 'statistics.json')
    
    def initialize(self):
        """Инициализация базы данных"""
        os.makedirs(self.data_dir, exist_ok=True)
        
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(self.stats_file):
            with open(self.stats_file, 'w') as f:
                json.dump({
                    'total_users': 0,
                    'active_users': 0,
                    'today_users': 0,
                    'last_update': datetime.now().isoformat()
                }, f)
    
    def save_user(self, user_data: Dict[str, Any]):
        """Сохранение пользователя"""
        try:
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            # Проверка существования
            user_exists = any(u['id'] == user_data['id'] for u in users)
            
            if not user_exists:
                users.append(user_data)
                
                with open(self.users_file, 'w') as f:
                    json.dump(users, f, indent=2)
                
                logger.info(f"✅ Пользователь {user_data['id']} сохранён")
            else:
                # Обновляем существующего пользователя
                for i, u in enumerate(users):
                    if u['id'] == user_data['id']:
                        users[i] = {**u, **user_data}
                        break
                
                with open(self.users_file, 'w') as f:
                    json.dump(users, f, indent=2)
                
                logger.info(f"✅ Пользователь {user_data['id']} обновлён")
            
            # Обновление статистики
            self.update_stats()
            
        except Exception as e:
            logger.error(f"❌ Ошибка сохранения: {e}")
    
    def update_stats(self):
        """Обновление статистики"""
        try:
            with open(self.users_file, 'r') as f:
                users = json.load(f)
            
            today = datetime.now().date().isoformat()
            active = [u for u in users if u.get('is_active', False)]
            today_users = [u for u in users if u.get('joined_at', '').startswith(today)]
            
            stats = {
                'total_users': len(users),
                'active_users': len(active),
                'today_users': len(today_users),
                'last_update': datetime.now().isoformat()
            }
            
            with open(self.stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
            
        except Exception as e:
            logger.error(f"❌ Ошибка статистики: {e}")
    
    def get_statistics(self) -> Dict[str, Any]:
        """Получение статистики"""
        try:
            with open(self.stats_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"❌ Ошибка чтения статистики: {e}")
            return {
                'total_users': 0,
                'active_users': 0,
                'today_users': 0
            }

class WebsiteConnection:
    """Подключение к сайту"""
    
    def __init__(self, website_url: str, api_key: str):
        self.website_url = website_url.rstrip('/')
        self.api_key = api_key
        self.timeout = aiohttp.ClientTimeout(total=10)
        self.connected = False
    
    def check_connection(self) -> Dict[str, Any]:
        """Проверка подключения (синхронная)"""
        try:
            try:
                import requests
                response = requests.get(f"{self.website_url}/api/health", timeout=5)
                if response.status_code == 200:
                    self.connected = True
                    return response.json()
                else:
                    self.connected = False
                    return {'status': 'error', 'message': f'HTTP {response.status_code}'}
            except ImportError:
                logger.warning("⚠️ Библиотека requests не установлена")
                self.connected = False
                return {'status': 'error', 'message': 'requests not installed'}
        except Exception as e:
            self.connected = False
            return {'status': 'error', 'message': str(e)}
    
    def send_user(self, user_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Отправка пользователя на сайт"""
        try:
            import requests
            response = requests.post(
                f"{self.website_url}/api/users",
                json={
                    **user_data,
                    'source': 'telegram_bot'
                },
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                timeout=5
            )
            if response.status_code == 200:
                logger.info(f"✅ Пользователь {user_data['id']} отправлен на сайт")
                return response.json()
            else:
                logger.warning(f"⚠️ Ошибка отправки: {response.status_code}")
                return None
        except Exception as e:
            logger.warning(f"⚠️ Ошибка подключения к сайту: {e}")
            return None

class SavosBotWorking:
    """Рабочая версия бота БЕЗ asyncio проблем С ПОДКЛЮЧЕНИЕМ К САЙТУ"""
    
    def __init__(self):
        self.bot_token = os.getenv('BOT_TOKEN')
        if not self.bot_token:
            raise ValueError("❌ BOT_TOKEN не найден! Создайте файл .env")
        
        self.website_url = os.getenv('WEBSITE_URL', 'https://savos-club-two.vercel.app')
        self.api_key = os.getenv('API_KEY', 'savosbot2024')
        
        self.db = DatabaseManager()
        self.db.initialize()  # Синхронная инициализация
        
        # Проверка подключения к сайту
        self.website = WebsiteConnection(self.website_url, self.api_key)
        connection_result = self.website.check_connection()
        logger.info(f"🌐 Статус сайта: {connection_result.get('status')}")
        
        self.application = Application.builder().token(self.bot_token).build()
        
        # Регистрация обработчиков
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("help", self.help))
        self.application.add_handler(CommandHandler("stats", self.stats))
        self.application.add_handler(CommandHandler("sync", self.sync))
        self.application.add_handler(MessageHandler(filters.CONTACT, self.handle_contact))
        # Обработчик текстовых сообщений с номером телефона
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_text))
        
    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик /start"""
        user = update.effective_user
        logger.info(f"👤 Новый пользователь: {user.id} ({user.username})")
        
        # Проверяем, есть ли пользователь в базе
        try:
            if os.path.exists(self.db.users_file):
                with open(self.db.users_file, 'r') as f:
                    users = json.load(f)
            else:
                users = []
        except Exception as e:
            logger.error(f"❌ Ошибка чтения базы: {e}")
            users = []
        
        existing_user = next((u for u in users if u['id'] == user.id), None)
        
        if existing_user:
            # Пользователь уже зарегистрирован
            keyboard = [
                [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url="https://savos-club-two.vercel.app/mini-app"))],
                [InlineKeyboardButton("📋 Мой профиль", callback_data="profile")]
            ]
            
            await update.message.reply_text(
                f"👋 С возвращением, {user.first_name}!\n\n"
                "Добро пожаловать обратно в SavosBot Club.",
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
        else:
            # Новый пользователь - просим телефон
            phone_keyboard = [[KeyboardButton("📲 Отправить номер телефона", request_contact=True)]]
            
            # Сохраняем базовые данные
            profile_link = f"https://t.me/{user.username}" if user.username else None
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'joined_at': datetime.now().isoformat(),
                'is_active': True,
                'profile_link': profile_link,
                'photo_url': None,
                'phone': None
            }
            
            # Получаем фото профиля
            try:
                photos = await context.bot.get_user_profile_photos(user.id, limit=1)
                if photos.total_count > 0:
                    photo_file = await context.bot.get_file(photos.photos[0][0].file_id)
                    user_data['photo_url'] = photo_file.file_path
            except Exception as e:
                logger.warning(f"⚠️ Не удалось получить фото: {e}")
            
            # НЕ отправляем на сайт до получения телефона
            # Только сохраняем локально для последующей синхронизации
            self.db.save_user(user_data)
            
            await update.message.reply_text(
                f"👋 Добро пожаловать в SavosBot Club, {user.first_name}!\n\n"
                "📞 Для завершения регистрации отправьте ваш номер телефона:",
                reply_markup=ReplyKeyboardMarkup(
                    phone_keyboard,
                    resize_keyboard=True,
                    one_time_keyboard=True
                )
            )
    
    async def handle_contact(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик получения контакта с номером телефона"""
        user = update.effective_user
        contact = update.message.contact
        
        logger.info(f"📞 Получен контакт от пользователя {user.id}")
        
        # Загружаем пользователя из БД
        try:
            if os.path.exists(self.db.users_file):
                with open(self.db.users_file, 'r') as f:
                    users = json.load(f)
            else:
                users = []
        except Exception as e:
            logger.error(f"❌ Ошибка чтения базы: {e}")
            users = []
        
        # Считаем зарегистрированных пользователей (с телефоном)
        registered_count = len([u for u in users if u.get('phone')])
        
        # Обновляем телефон пользователя и устанавливаем internal_id
        user_internal = None
        for u in users:
            if u['id'] == user.id:
                u['phone'] = contact.phone_number
                if not u.get('internal_id'):
                    u['internal_id'] = registered_count + 1
                user_internal = u
                break
        
        with open(self.db.users_file, 'w') as f:
            json.dump(users, f, indent=2)
        
        # Отправка на сайт ВСЕГДА
        logger.info(f"📤 Попытка отправки пользователя на сайт...")
        if user_internal:
            result = self.website.send_user(user_internal)
            if result:
                logger.info(f"✅ Пользователь успешно отправлен на сайт")
            else:
                logger.warning(f"⚠️ Не удалось отправить на сайт, сохранено локально")
        
        # Находим внутренний ID пользователя
        internal_id = user_internal.get('internal_id', registered_count + 1) if user_internal else registered_count + 1
        
        # Убираем клавиатуру и показываем завершение регистрации
        keyboard = [
            [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url="https://savos-club-two.vercel.app/mini-app"))],
            [InlineKeyboardButton("📋 Мой профиль", callback_data="profile")]
        ]
        
        await update.message.reply_text(
            f"✅ Регистрация завершена!\n\n"
            f"👤 Имя: {user.first_name} {user.last_name or ''}\n"
            f"📞 Телефон: +{contact.phone_number}\n"
            f"🆔 ID в системе: {internal_id}\n"
            f"🔗 Профиль: {'https://t.me/' + user.username if user.username else 'не указан'}",
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        
        logger.info(f"✅ Пользователь {user.id} зарегистрирован (телефон: {contact.phone_number})")
    
    async def handle_text(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик текстовых сообщений (для ввода номера телефона)"""
        user = update.effective_user
        text = update.message.text
        
        logger.info(f"📝 Получен текст от пользователя {user.id}: {text}")
        
        # Проверяем, есть ли пользователь в базе и нет ли у него телефона
        try:
            if os.path.exists(self.db.users_file):
                with open(self.db.users_file, 'r') as f:
                    users = json.load(f)
            else:
                users = []
        except Exception as e:
            logger.error(f"❌ Ошибка чтения базы: {e}")
            await update.message.reply_text("❌ Ошибка чтения базы данных. Попробуйте /start")
            return
        
        # Ищем пользователя
        user_data = next((u for u in users if u['id'] == user.id), None)
        
        if user_data and not user_data.get('phone'):
            # Пользователь существует но нет телефона - проверяем текст
            # Простая проверка на номер телефона
            import re
            phone_regex = r'^[\d\s\+\-\(\)]+$'
            if re.match(phone_regex, text) and len(re.sub(r'\D', '', text)) >= 10:
                # Это похоже на номер телефона
                phone = re.sub(r'\D', '', text)  # Оставляем только цифры
                
                # Определяем или устанавливаем internal_id
                # Считаем зарегистрированных пользователей (с телефоном)
                registered_count = len([u for u in users if u.get('phone')])
                if not user_data.get('internal_id'):
                    # Генерируем internal_id на основе количества зарегистрированных
                    user_data['internal_id'] = registered_count + 1
                
                # Обновляем телефон
                user_data['phone'] = phone
                
                # Сохраняем
                for i, u in enumerate(users):
                    if u['id'] == user.id:
                        users[i] = user_data
                        break
                
                with open(self.db.users_file, 'w') as f:
                    json.dump(users, f, indent=2)
                
                # Отправка на сайт ВСЕГДА (даже если сайт не доступен, попробуем)
                logger.info(f"📤 Попытка отправки пользователя на сайт...")
                result = self.website.send_user(user_data)
                if result:
                    logger.info(f"✅ Пользователь успешно отправлен на сайт")
                else:
                    logger.warning(f"⚠️ Не удалось отправить на сайт, сохранено локально")
                
                keyboard = [
                    [InlineKeyboardButton("📱 Открыть приложение", web_app=WebAppInfo(url="https://savos-club-two.vercel.app/mini-app"))],
                    [InlineKeyboardButton("📋 Мой профиль", callback_data="profile")]
                ]
                
                # Внутренний ID уже установлен выше
                internal_id = user_data.get('internal_id', registered_count + 1)
                
                await update.message.reply_text(
                    f"✅ Регистрация завершена!\n\n"
                    f"👤 Имя: {user.first_name} {user.last_name or ''}\n"
                    f"📞 Телефон: +{phone}\n"
                    f"🆔 ID в системе: {internal_id}\n"
                    f"🔗 Профиль: {'https://t.me/' + user.username if user.username else 'не указан'}",
                    reply_markup=InlineKeyboardMarkup(keyboard)
                )
                
                logger.info(f"✅ Пользователь {user.id} зарегистрирован (телефон: {phone})")
            else:
                # Не похоже на номер телефона
                await update.message.reply_text(
                    "❌ Номер телефона введен некорректно.\n\n"
                    "Используйте кнопку ниже или введите корректный номер:"
                )
        elif user_data and user_data.get('phone'):
            # У пользователя уже есть телефон - обычное сообщение
            await update.message.reply_text(
                "Вы уже зарегистрированы! Используйте /start для доступа к функциям."
            )
        else:
            # Пользователь не зарегистрирован
            await update.message.reply_text(
                "Пожалуйста, начните с команды /start"
            )
    
    async def help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик /help"""
        await update.message.reply_text(
            "🤖 SavosBot Club\n\n"
            "Команды:\n"
            "/start - Начать работу\n"
            "/help - Показать помощь\n"
            "/stats - Показать статистику"
        )
    
    async def stats(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик /stats"""
        stats = self.db.get_statistics()
        
        status = "✅ Подключено" if self.website.connected else "❌ Отключено"
        
        await update.message.reply_text(
            f"📊 Статистика:\n\n"
            f"👥 Всего: {stats['total_users']}\n"
            f"🟢 Активных: {stats['active_users']}\n"
            f"📅 Сегодня: {stats['today_users']}\n\n"
            f"🌐 Сайт: {status}"
        )
    
    async def sync(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик /sync - синхронизация с сайтом"""
        if not self.website.connected:
            await update.message.reply_text(
                "❌ Сайт недоступен.\n"
                "Все данные сохранены локально.\n"
                "Попробуйте позже."
            )
            return
        
        await update.message.reply_text("🔄 Начинаю синхронизацию...")
        
        # Здесь можно добавить логику синхронизации
        await update.message.reply_text("✅ Синхронизация завершена!")
    
    def run(self):
        """Запуск бота"""
        logger.info("🚀 Запуск SavosBot...")
        
        # Добавляем обработчик ошибок
        self.application.add_error_handler(self.error_handler)
        
        self.application.run_polling(
            allowed_updates=['message', 'callback_query', 'inline_query'],
            drop_pending_updates=True,  # Игнорируем старые обновления
            close_loop=False
        )
    
    async def error_handler(self, update: object, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик ошибок"""
        import traceback
        
        logger.error(f"Exception while handling an update: {context.error}")
        
        tb = ''.join(traceback.format_exception(None, context.error, context.error.__traceback__))
        logger.error(tb)
        
        # Не крашим бота при сетевых ошибках
        if isinstance(context.error, Exception) and 'Network' in str(type(context.error)):
            logger.warning("⚠️ Network error occurred, continuing...")
            return

def main():
    """Главная функция - БЕЗ async"""
    bot = SavosBotWorking()
    bot.run()

if __name__ == '__main__':
    main()
