# 🚀 SavosBot Club - ГОТОВЫЕ КОМАНДЫ для загрузки

## 🎯 Что нужно сделать

### 1. Создайте Personal Access Token
1. Зайдите на: https://github.com/settings/tokens
2. Нажмите "Generate new token (classic)"
3. Выберите scopes: `repo`, `workflow`, `write:packages`
4. Скопируйте токен

### 2. Выполните команды в PowerShell

Откройте PowerShell в папке `H:\savosbot\` и выполните:

```powershell
# Настройка Git
git config --global user.name "belix888"
git config --global user.email "your_email@example.com"
git config --global credential.helper store

# Установка URL с токеном (ЗАМЕНИТЕ YOUR_TOKEN на ваш токен!)
git remote set-url origin https://belix888:YOUR_TOKEN@github.com/belix888/savosbot.git

# Загрузка файлов
git add .
git commit -m "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
git push -u origin main
```

## 🎮 Альтернатива - Готовые скрипты

### Вариант A: Batch файл
```cmd
# Просто запустите файл
upload-to-github.bat
```

### Вариант B: PowerShell скрипт
```powershell
# Запустите PowerShell скрипт
.\upload-to-github.ps1
```

## 🔧 Если не работает

### Проверьте настройки:
```powershell
# Проверка текущих настроек
git config --global --list
git remote -v
```

### Сброс настроек:
```powershell
# Сброс учетных данных
git config --global --unset credential.helper
git config --global credential.helper store
```

## 🎉 После успешной загрузки

### 1. Проверьте репозиторий
https://github.com/belix888/savosbot

### 2. Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savosbot`
5. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
   JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
   NODE_ENV=production
   ```
6. Нажмите "Deploy"

### 3. Деплой на Railway
1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savosbot`
5. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
   JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
   NODE_ENV=production
   WEBHOOK_URL=https://your-app.vercel.app
   ```
6. Добавьте PostgreSQL базу данных

### 4. Настройка Telegram Bot
После получения URL от Vercel:
```bash
curl -X POST "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.vercel.app/webhook"}'
```

## 🔑 Данные для входа

- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 🌐 Результат

После выполнения всех шагов:
- **GitHub**: https://github.com/belix888/savosbot
- **Web App**: https://your-app.vercel.app
- **Admin Panel**: https://your-app.vercel.app/admin-panel
- **Mini App**: https://your-app.vercel.app/mini-app
- **Telegram Bot**: Работает через webhook

---

**🚀 Выполните команды выше и ваш SavosBot Club будет загружен на GitHub!**
