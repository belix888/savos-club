# SavosBot Club - Загрузка через командную строку
Write-Host "🚀 SavosBot Club - Загрузка через командную строку" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Настройка Git..." -ForegroundColor Yellow
git config --global user.name "belix888"
git config --global user.email "belix888@example.com"
git config --global credential.helper manager-core

Write-Host "🔗 Настройка репозитория..." -ForegroundColor Yellow
git remote set-url origin https://github.com/belix888/savos-club.git

Write-Host "📁 Добавление файлов..." -ForegroundColor Yellow
git add .

Write-Host "💾 Создание коммита..." -ForegroundColor Yellow
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"

Write-Host "🌐 Загрузка на GitHub..." -ForegroundColor Yellow
Write-Host "⚠️  Введите ваш Personal Access Token когда Git запросит пароль!" -ForegroundColor Red
Write-Host ""

git push -u origin main

Write-Host ""
Write-Host "🎉 SavosBot Club загружен на GitHub!" -ForegroundColor Green
Write-Host "📍 Репозиторий: https://github.com/belix888/savos-club" -ForegroundColor Cyan
Write-Host ""

Read-Host "Нажмите Enter для выхода"
