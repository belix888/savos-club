# SavosBot Club - Автоматическая загрузка на GitHub
Write-Host "🚀 SavosBot Club - Автоматическая загрузка на GitHub" -ForegroundColor Green
Write-Host ""

# Проверка настроек Git
Write-Host "📋 Проверка настроек Git..." -ForegroundColor Yellow
git config --global user.name "belix888"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Имя пользователя настроено" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка настройки имени пользователя" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host ""

# Добавление файлов в Git
Write-Host "📁 Добавление файлов в Git..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Файлы добавлены" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка добавления файлов" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host ""

# Создание коммита
Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Коммит создан" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка создания коммита" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit 1
}

Write-Host ""

# Загрузка на GitHub
Write-Host "🌐 Загрузка на GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Убедитесь, что настроен Personal Access Token!" -ForegroundColor Red
Write-Host ""

git push -u origin main
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 УСПЕШНО! SavosBot Club загружен на GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Репозиторий: https://github.com/belix888/savosbot" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Деплой на Vercel: https://vercel.com/new" -ForegroundColor White
    Write-Host "2. Деплой на Railway: https://railway.app/new" -ForegroundColor White
    Write-Host "3. Настройка Telegram Bot webhook" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Ошибка загрузки на GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Возможные решения:" -ForegroundColor Yellow
    Write-Host "1. Настройте Personal Access Token" -ForegroundColor White
    Write-Host "2. Проверьте права доступа к репозиторию" -ForegroundColor White
    Write-Host "3. Выполните команду: git remote set-url origin https://belix888:YOUR_TOKEN@github.com/belix888/savosbot.git" -ForegroundColor White
    Write-Host ""
}

Read-Host "Нажмите Enter для выхода"
