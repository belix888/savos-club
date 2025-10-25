# 🔧 Настройка переменных окружения на Render

## ✅ URL базы данных получен!
**DATABASE_URL**: `postgresql://savosdb_user:EEDZroYI8d3jkOd3kJc4H9wGYeTGKkMs@dpg-d3uhq9v5r7bs73fia8v0-a/savosdb`

## 🚀 Что нужно сделать на Render:

### **Шаг 1: Откройте Environment Variables**
1. **Зайдите на**: [dashboard.render.com](https://dashboard.render.com)
2. **Найдите сервис**: `savos-club`
3. **Нажмите "Environment"** в меню MANAGE

### **Шаг 2: Добавьте переменные окружения**
Добавьте следующие переменные:

```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://savos-club.onrender.com
DATABASE_URL=postgresql://savosdb_user:EEDZroYI8d3jkOd3kJc4H9wGYeTGKkMs@dpg-d3uhq9v5r7bs73fia8v0-a/savosdb
DB_PATH=./database/club.db
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=5242880
PORT=10000
```

### **Шаг 3: Перезапустите деплой**
1. **Нажмите "Manual Deploy"** → **"Deploy latest commit"**
2. **Дождитесь завершения деплоя**

## 🔧 Альтернатива - через файл .env.production:

Если не можете найти Environment Variables на Render:

### **Создайте файл .env.production:**
```bash
# Скопируйте содержимое из env.production.template
cp env.production.template .env.production
```

### **Загрузите на GitHub:**
```bash
git add .
git commit -m "Add production environment variables with database URL"
git push
```

## 🌐 Архитектура:

```
Telegram Bot → Webhook → Render (savos-club.onrender.com)
                                    ↓
                              PostgreSQL Database
                                    ↓
                              Vercel (your-app.vercel.app)
```

## 🔑 Данные для входа:
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 Тестирование:
1. **Telegram Bot**: Найдите бота и отправьте `/start`
2. **Web App**: https://your-app.vercel.app
3. **API**: https://savos-club.onrender.com/api/health

## 🔧 Troubleshooting:

### **Если бот не отвечает:**
1. Проверьте логи на Render
2. Убедитесь, что переменные добавлены
3. Перезапустите сервис

### **Если база данных не работает:**
1. Проверьте DATABASE_URL
2. Убедитесь, что PostgreSQL сервис запущен
3. Проверьте подключение

---

**🚀 Добавьте переменные окружения на Render и перезапустите деплой!**
