# 🚀 SavosBot Club - Деплой на Render.com

## ❌ Проблема с Railway
Railway показывает "Limited Access" - ваш план позволяет деплоить только базы данных.

## ✅ Решение - Render.com

### 🎯 Рекомендуемый план действий

#### Шаг 1: Деплой на Render.com
1. **Зайдите на**: [render.com](https://render.com)
2. **Войдите через GitHub**
3. **Нажмите "New"** → **"Web Service"**
4. **Выберите репозиторий**: `belix888/savos-club`
5. **Настройки**:
   - **Name**: `savosbot-club`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

#### Шаг 2: Переменные окружения
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://your-app.vercel.app
```

#### Шаг 3: База данных
1. **Создайте PostgreSQL** в Render
2. **Скопируйте DATABASE_URL**
3. **Добавьте в переменные окружения**

#### Шаг 4: Настройка webhook
После получения URL от Render:
```bash
curl -X POST "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.render.com/webhook"}'
```

## 🌐 Архитектура

- **Frontend + API**: Vercel (https://your-app.vercel.app)
- **Telegram Bot**: Render (https://your-app.render.com)
- **База данных**: Render PostgreSQL
- **Webhook**: Vercel → Render

## 🔧 Альтернативы

### Fly.io
- Бесплатный план с ограничениями
- Глобальная сеть
- Требует Docker

### Cyclic.sh
- Специализируется на Node.js
- Бесплатный план
- Простой деплой

### Heroku
- Очень надежный
- Платный (бесплатный план удален)

## 🔑 Данные для входа
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 Тестирование
1. **Web App**: https://your-app.vercel.app
2. **Telegram Bot**: Найдите бота в Telegram
3. **API**: https://your-app.vercel.app/api/health

---

**🚀 Используйте Render.com для деплоя Telegram бота!**
