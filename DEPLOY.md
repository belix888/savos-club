# 🚀 SavosBot Club - Деплой на Vercel

## 📋 Подготовка к деплою

### 1. GitHub Repository

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SavosBot Club"
   git branch -M main
   git remote add origin https://github.com/yourusername/savosbot-club.git
   git push -u origin main
   ```

### 2. Vercel Деплой

1. **Подключите к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Войдите через GitHub
   - Нажмите "New Project"
   - Выберите ваш репозиторий `savosbot-club`

2. **Настройте переменные окружения в Vercel:**
   ```
   BOT_TOKEN=your_telegram_bot_token
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=production
   ```

3. **Деплой:**
   - Vercel автоматически задеплоит проект
   - Получите URL: `https://your-app.vercel.app`

### 3. Настройка Telegram Bot

1. **Обновите webhook URL:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url": "https://your-app.vercel.app/webhook"}'
   ```

2. **Проверьте webhook:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

## 🔧 Локальная разработка

### Установка зависимостей:
```bash
npm install
```

### Запуск в режиме разработки:
```bash
npm run dev
```

### Настройка базы данных:
```bash
npm run setup
npm run demo
npm run create-super-admin
```

## 🌐 Доступ к приложению

После деплоя:
- **Web App**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/admin-panel`
- **Mini App**: `https://your-app.vercel.app/mini-app`

## 🔑 Данные для входа

- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 Telegram Bot

1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Используйте кнопку "Открыть приложение"

## 🛠️ Troubleshooting

### Проблемы с базой данных:
- Vercel использует временную файловую систему
- База данных пересоздается при каждом деплое
- Для продакшена используйте внешнюю БД (PostgreSQL, MongoDB)

### Проблемы с webhook:
- Убедитесь, что URL начинается с `https://`
- Проверьте, что бот запущен на Vercel
- Проверьте логи в Vercel Dashboard

### Проблемы с файлами:
- Загрузки файлов не сохраняются на Vercel
- Используйте внешнее хранилище (AWS S3, Cloudinary)

## 🔒 Безопасность

- Никогда не коммитьте `.env` файлы
- Используйте сильные пароли для JWT
- Регулярно обновляйте зависимости
- Настройте CORS правильно

## 📊 Мониторинг

- Используйте Vercel Analytics
- Настройте логирование
- Мониторьте производительность
- Отслеживайте ошибки

---

**🎉 Готово! Ваш SavosBot Club теперь работает в продакшене!**

