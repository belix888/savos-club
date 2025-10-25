# 🚀 SavosBot Club - Готовые ссылки для деплоя

## 📋 Быстрый деплой

### 1. Vercel (Frontend + API)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/belix888/savosbot)

**Настройки для Vercel:**
- Repository: `belix888/savosbot`
- Framework: Other
- Root Directory: `./`
- Build Command: `npm run vercel-build`
- Output Directory: `./`

**Переменные окружения:**
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
```

### 2. Railway (Telegram Bot + Database)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/belix888/savosbot)

**Настройки для Railway:**
- Repository: `belix888/savosbot`
- Service Type: Web Service
- Build Command: `npm install`
- Start Command: `npm start`

**Переменные окружения:**
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://your-app.vercel.app
```

**База данных:**
- Добавьте PostgreSQL service
- Переменная `DATABASE_URL` будет создана автоматически

### 3. Render (Альтернативный вариант)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/belix888/savosbot)

**Настройки для Render:**
- Repository: `belix888/savosbot`
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`

## 🔧 Пошаговая инструкция

### Шаг 1: Загрузка на GitHub
1. Выполните команды из файла `GITHUB_UPLOAD.md`
2. Убедитесь, что код загружен в https://github.com/belix888/savosbot

### Шаг 2: Деплой на Vercel
1. Нажмите кнопку "Deploy with Vercel" выше
2. Войдите через GitHub
3. Выберите репозиторий `belix888/savosbot`
4. Добавьте переменные окружения
5. Нажмите "Deploy"
6. Получите URL: `https://your-app.vercel.app`

### Шаг 3: Деплой на Railway
1. Нажмите кнопку "Deploy on Railway" выше
2. Войдите через GitHub
3. Выберите репозиторий `belix888/savosbot`
4. Добавьте переменные окружения
5. Добавьте PostgreSQL базу данных
6. Получите URL: `https://your-app.railway.app`

### Шаг 4: Настройка Telegram Bot
1. Обновите webhook URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-app.vercel.app/webhook"}'
   ```

2. Проверьте webhook:
   ```bash
   curl "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/getWebhookInfo"
   ```

## 🌐 Результат

После деплоя у вас будет:
- **GitHub**: https://github.com/belix888/savosbot
- **Web App**: https://your-app.vercel.app
- **Admin Panel**: https://your-app.vercel.app/admin-panel
- **Mini App**: https://your-app.vercel.app/mini-app
- **Telegram Bot**: https://your-app.railway.app

## 🔑 Данные для входа

- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 Тестирование

### 1. Web App
- Откройте https://your-app.vercel.app
- Проверьте все страницы
- Протестируйте админ-панель

### 2. Telegram Bot
- Найдите бота в Telegram
- Отправьте `/start`
- Используйте кнопку "Открыть приложение"

## 🛠️ Troubleshooting

### Проблемы с деплоем
- Проверьте переменные окружения
- Убедитесь, что все зависимости установлены
- Проверьте логи в Vercel/Railway

### Проблемы с ботом
- Проверьте webhook URL
- Убедитесь, что бот запущен
- Проверьте токен бота

---

**🎉 Готово! Ваш SavosBot Club будет работать в продакшене!**
