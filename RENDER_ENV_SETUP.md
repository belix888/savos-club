# 🔧 Настройка переменных окружения на Render.com

## 🎯 Ваш бот готов!
**Bot Token**: `8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c`

## ✅ Что нужно настроить на Render.com:

### **Шаг 1: Откройте панель управления Render**
1. Зайдите на [dashboard.render.com](https://dashboard.render.com)
2. Найдите ваш сервис `savos-club`
3. Нажмите на него

### **Шаг 2: Настройте переменные окружения**
1. **Перейдите в раздел "Environment"**
2. **Добавьте следующие переменные**:

```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://your-app.vercel.app
```

### **Шаг 3: Настройте базу данных**
1. **Создайте PostgreSQL** (если еще не создали):
   - Нажмите "New" → "PostgreSQL"
   - Name: `savosbot-club-db`
   - Plan: `Free`
2. **Скопируйте DATABASE_URL** из настроек базы данных
3. **Добавьте в переменные окружения**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### **Шаг 4: Перезапустите сервис**
1. **Нажмите "Manual Deploy"** → **"Deploy latest commit"**
2. **Дождитесь завершения деплоя**

## 🌐 Настройка Vercel (если еще не настроено):

### **Переменные окружения для Vercel:**
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
```

## 🔧 Настройка webhook:

После настройки переменных выполните команду:
```bash
curl -X POST "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://savos-club.onrender.com/webhook"}'
```

## 🎯 Проверка работы:

### **1. Проверьте webhook:**
```bash
curl "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/getWebhookInfo"
```

### **2. Протестируйте бота:**
1. Найдите бота в Telegram
2. Отправьте `/start`
3. Проверьте ответ

### **3. Проверьте сайт:**
- **Vercel**: https://your-app.vercel.app
- **Render**: https://savos-club.onrender.com

## 🔑 Данные для входа:
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 Результат:
После настройки у вас будет:
- ✅ **Telegram Bot** работает и отвечает на команды
- ✅ **Web App** доступен на Vercel
- ✅ **Mini App** интегрирован с ботом
- ✅ **Админ-панель** для управления
- ✅ **База данных** для хранения данных

---

**🚀 Настройте переменные окружения и ваш бот будет работать!**
