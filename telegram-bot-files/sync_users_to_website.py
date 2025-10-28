#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для синхронизации пользователей из JSON в SQLite на сайте
"""

import os
import json
import requests
import sys

def main():
    """Синхронизация всех пользователей"""
    
    # Путь к JSON файлу
    users_file = os.path.join('data', 'users.json')
    
    if not os.path.exists(users_file):
        print("❌ Файл users.json не найден!")
        sys.exit(1)
    
    # Загружаем пользователей
    with open(users_file, 'r') as f:
        users = json.load(f)
    
    if not users:
        print("📭 Нет пользователей для синхронизации")
        sys.exit(0)
    
    print(f"📊 Найдено {len(users)} пользователей")
    
    # Настройки подключения
    website_url = os.getenv('WEBSITE_URL', 'https://savos-club-two.vercel.app')
    api_key = os.getenv('API_KEY', 'savosbot2024')
    
    # Синхронизируем каждого пользователя
    success_count = 0
    error_count = 0
    
    for user in users:
        try:
            print(f"\n📤 Отправка пользователя {user.get('id')} ({user.get('first_name')})...")
            
            response = requests.post(
                f"{website_url}/api/users",
                json={
                    **user,
                    'source': 'telegram_bot_sync'
                },
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Пользователь {user.get('id')} успешно синхронизирован (internal_id: {result.get('internal_id')})")
                success_count += 1
            else:
                print(f"⚠️ Ошибка синхронизации {user.get('id')}: {response.status_code}")
                error_count += 1
                
        except Exception as e:
            print(f"❌ Ошибка при отправке {user.get('id')}: {e}")
            error_count += 1
    
    print(f"\n{'='*50}")
    print(f"✅ Успешно: {success_count}")
    print(f"❌ Ошибок: {error_count}")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()

