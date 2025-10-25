#!/bin/bash

echo "🏛️ SavosBot Club - Установка и запуск"
echo "======================================"

# Проверяем наличие Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js найден: $(node --version)"

# Проверяем наличие npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден. Установите npm"
    exit 1
fi

echo "✅ npm найден: $(npm --version)"

# Проверяем наличие файла .env
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден. Создаем из примера..."
    cp env.example .env
    echo "📝 Отредактируйте файл .env и добавьте ваш BOT_TOKEN"
    echo "   Получить токен можно у @BotFather в Telegram"
    read -p "Нажмите Enter после настройки .env файла..."
fi

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей"
    exit 1
fi

echo "✅ Зависимости установлены"

# Инициализируем базу данных
echo "🗄️  Инициализируем базу данных..."
node database/setup.js

if [ $? -ne 0 ]; then
    echo "❌ Ошибка инициализации базы данных"
    exit 1
fi

echo "✅ База данных инициализирована"

# Проверяем настройки
echo "🔍 Проверяем настройки..."

if grep -q "your_telegram_bot_token_here" .env; then
    echo "⚠️  Не забудьте настроить BOT_TOKEN в файле .env"
fi

if grep -q "your-domain.com" .env; then
    echo "⚠️  Не забудьте настроить WEBHOOK_URL в файле .env"
fi

echo ""
echo "🎉 Установка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Отредактируйте файл .env и добавьте ваш BOT_TOKEN"
echo "2. Запустите бота командой: npm start"
echo "3. Откройте админ-панель: http://localhost:3000"
echo "4. Пароль админки: admin123"
echo ""
echo "🚀 Для запуска используйте:"
echo "   npm start     - продакшен"
echo "   npm run dev   - разработка"
echo ""
echo "📱 Mini App будет доступен по адресу: http://localhost:3000/mini-app"
echo "🔧 Админ-панель: http://localhost:3000"
echo ""
echo "Удачного использования! 🎊"
