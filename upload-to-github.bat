@echo off
echo 🚀 SavosBot Club - Автоматическая загрузка на GitHub
echo.

echo 📋 Проверка настроек Git...
git config --global user.name "belix888"
if %errorlevel% neq 0 (
    echo ❌ Ошибка настройки имени пользователя
    pause
    exit /b 1
)

echo ✅ Имя пользователя настроено
echo.

echo 📁 Добавление файлов в Git...
git add .
if %errorlevel% neq 0 (
    echo ❌ Ошибка добавления файлов
    pause
    exit /b 1
)

echo ✅ Файлы добавлены
echo.

echo 💾 Создание коммита...
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
if %errorlevel% neq 0 (
    echo ❌ Ошибка создания коммита
    pause
    exit /b 1
)

echo ✅ Коммит создан
echo.

echo 🌐 Загрузка на GitHub...
echo ⚠️  Убедитесь, что настроен Personal Access Token!
echo.
git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ Ошибка загрузки на GitHub
    echo.
    echo 🔧 Возможные решения:
    echo 1. Настройте Personal Access Token
    echo 2. Проверьте права доступа к репозиторию
    echo 3. Выполните команду: git remote set-url origin https://belix888:YOUR_TOKEN@github.com/belix888/savosbot.git
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 УСПЕШНО! SavosBot Club загружен на GitHub!
echo.
echo 📍 Репозиторий: https://github.com/belix888/savosbot
echo.
echo 🚀 Следующие шаги:
echo 1. Деплой на Vercel: https://vercel.com/new
echo 2. Деплой на Railway: https://railway.app/new
echo 3. Настройка Telegram Bot webhook
echo.
pause
