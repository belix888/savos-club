# SavosBot Club - Загрузка в новый репозиторий
Write-Host "🚀 SavosBot Club - Загрузка в новый репозиторий" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Настройка Git..." -ForegroundColor Yellow
git config --global user.name "belix888"
git config --global user.email "belix888@example.com"

Write-Host "🔗 Обновление URL репозитория..." -ForegroundColor Yellow
git remote set-url origin https://belix888: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@github.com/belix888/savosbot-club.git

Write-Host "📁 Добавление файлов..." -ForegroundColor Yellow
git add .

Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"

Write-Host "🌐 Загрузка на GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "🎉 УСПЕШНО! SavosBot Club загружен на GitHub!" -ForegroundColor Green
Write-Host "📍 Новый репозиторий: https://github.com/belix888/savosbot-club" -ForegroundColor Cyan
Write-Host ""

Read-Host "Нажмите Enter для выхода"
