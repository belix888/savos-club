# 🔧 Быстрое исправление ошибки подключения

## ❌ **Ошибка:**
```
ERROR - ❌ Website health check failed: Cannot connect to host your-app.vercel.app:443
```

## ✅ **Решение:**

### **1. На вашем хостинге отредактируйте файл `.env`:**
```env
# Замените эту строку:
WEBSITE_URL=https://your-app.vercel.app

# На эту:
WEBSITE_URL=https://savos-club-two.vercel.app
```

### **2. Перезапустите бота:**
```bash
# Остановите бота (Ctrl+C)
python3 telegram_bot.py
```

### **3. Проверьте результат:**
Должно появиться:
```
✅ Website health: {'status': 'ok', 'message': 'SavosBot Club API is running'}
```

## ✅ **Проверка сайта:**
Сайт доступен по адресу: https://savos-club-two.vercel.app
API работает: https://savos-club-two.vercel.app/api/health

---

**🎯 Проблема решена! Бот теперь сможет подключаться к сайту.**
