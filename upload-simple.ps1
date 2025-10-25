# SavosBot Club - Простая загрузка на GitHub
Write-Host "🚀 SavosBot Club - Загрузка на GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Настройка Git..." -ForegroundColor Yellow
git config --global user.name "belix888"
Write-Host "✅ Имя пользователя настроено" -ForegroundColor Green

Write-Host ""
Write-Host "📁 Добавление файлов..." -ForegroundColor Yellow
git add .
Write-Host "✅ Файлы добавлены" -ForegroundColor Green

Write-Host ""
Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
Write-Host "✅ Коммит создан" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Загрузка на GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Убедитесь, что настроен Personal Access Token!" -ForegroundColor Red
Write-Host ""

git push -u origin main

Write-Host ""
Write-Host "🎉 SavosBot Club загружен на GitHub!" -ForegroundColor Green
Write-Host "📍 Репозиторий: https://github.com/belix888/savosbot" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Деплой на Vercel: https://vercel.com/new" -ForegroundColor White
Write-Host "2. Деплой на Railway: https://railway.app/new" -ForegroundColor White
Write-Host ""

Read-Host "Нажмите Enter для выхода"
