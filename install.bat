@echo off
chcp 65001 >nul
echo 🏛️ SavosBot Club - Установка и запуск
echo ======================================

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не найден. Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js найден: %NODE_VERSION%

REM Проверяем наличие npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm не найден. Установите npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm найден: %NPM_VERSION%

REM Проверяем наличие файла .env
if not exist ".env" (
    echo ⚠️  Файл .env не найден. Создаем из примера...
    copy env.example .env
    echo 📝 Отредактируйте файл .env и добавьте ваш BOT_TOKEN
    echo    Получить токен можно у @BotFather в Telegram
    pause
)

REM Устанавливаем зависимости
echo 📦 Устанавливаем зависимости...
npm install

if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

echo ✅ Зависимости установлены

REM Инициализируем базу данных
echo 🗄️  Инициализируем базу данных...
node database/setup.js

if %errorlevel% neq 0 (
    echo ❌ Ошибка инициализации базы данных
    pause
    exit /b 1
)

echo ✅ База данных инициализирована

REM Проверяем настройки
echo 🔍 Проверяем настройки...

findstr /c:"your_telegram_bot_token_here" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Не забудьте настроить BOT_TOKEN в файле .env
)

findstr /c:"your-domain.com" .env >nul
if %errorlevel% equ 0 (
    echo ⚠️  Не забудьте настроить WEBHOOK_URL в файле .env
)

echo.
echo 🎉 Установка завершена!
echo.
echo 📋 Следующие шаги:
echo 1. Отредактируйте файл .env и добавьте ваш BOT_TOKEN
echo 2. Запустите бота командой: npm start
echo 3. Откройте админ-панель: http://localhost:3000
echo 4. Пароль админки: admin123
echo.
echo 🚀 Для запуска используйте:
echo    npm start     - продакшен
echo    npm run dev   - разработка
echo.
echo 📱 Mini App будет доступен по адресу: http://localhost:3000/mini-app
echo 🔧 Админ-панель: http://localhost:3000
echo.
echo Удачного использования! 🎊
pause
