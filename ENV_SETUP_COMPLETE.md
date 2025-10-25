# 🔧 Настройка переменных окружения для Render

## ✅ Файлы созданы:

### 📁 **Созданные файлы:**
- ✅ `.env.production` - файл с переменными окружения
- ✅ `env.production.template` - шаблон для других разработчиков
- ✅ Обновлен `src/index.js` для загрузки переменных
- ✅ Обновлен `.gitignore` для безопасности

## 🚀 **Что нужно сделать:**

### **Шаг 1: Загрузите изменения на GitHub**
```bash
git add .
git commit -m "Add production environment variables"
git push
```

### **Шаг 2: Перезапустите деплой на Render**
1. **Зайдите на**: [dashboard.render.com](https://dashboard.render.com)
2. **Найдите сервис**: `savos-club`
3. **Нажмите "Manual Deploy"** → **"Deploy latest commit"**
4. **Дождитесь завершения деплоя**

### **Шаг 3: Проверьте работу бота**
1. **Найдите бота в Telegram**
2. **Отправьте команду** `/start`
3. **Проверьте ответ** от бота

## 🔧 **Переменные окружения:**

### **В файле `.env.production`:**
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://savos-club.onrender.com
DB_PATH=./database/club.db
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=5242880
PORT=10000
```

## 🌐 **Архитектура:**

```
Telegram Bot → Webhook → Render (savos-club.onrender.com)
                                    ↓
                              Vercel (your-app.vercel.app)
                                    ↓
                              SQLite Database (Render)
```

## 🔑 **Данные для входа:**
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 **Тестирование:**
1. **Telegram Bot**: Найдите бота и отправьте `/start`
2. **Web App**: https://your-app.vercel.app
3. **API**: https://savos-club.onrender.com/api/health

## 🔧 **Troubleshooting:**

### **Если бот не отвечает:**
1. Проверьте логи на Render
2. Убедитесь, что переменные загружены
3. Перезапустите сервис

### **Если сайт не работает:**
1. Проверьте статус Vercel
2. Проверьте переменные окружения
3. Перезапустите деплой

---

**🚀 Загрузите изменения на GitHub и перезапустите деплой на Render!**
