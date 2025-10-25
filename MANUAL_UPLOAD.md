# 🚀 SavosBot Club - Ручная загрузка на GitHub

## ❌ Проблема с автоматической загрузкой
Git push не работает из-за проблем с правами доступа к репозиторию.

## ✅ Решение - Ручная загрузка через веб-интерфейс

### Шаг 1: Откройте ваш репозиторий
https://github.com/belix888/savosbot-club

### Шаг 2: Загрузите файлы через веб-интерфейс

1. **Нажмите кнопку "Add file"** → **"Upload files"**

2. **Перетащите ВСЕ файлы** из папки `H:\savosbot\` в окно загрузки

3. **Или выберите файлы** через "choose your files"

4. **Добавьте commit message**: "Add SavosBot Club project files - Complete Telegram Bot with Mini App"

5. **Нажмите "Commit changes"**

## 📁 Список файлов для загрузки

### Основные файлы:
- ✅ `package.json` - зависимости проекта
- ✅ `package-lock.json` - точные версии зависимостей
- ✅ `vercel.json` - конфигурация для Vercel
- ✅ `.gitignore` - исключения для Git
- ✅ `LICENSE` - MIT лицензия

### Исходный код:
- ✅ `src/index.js` - главный файл сервера
- ✅ `src/routes/` - папка с API маршрутами
  - `auth.js` - аутентификация
  - `users.js` - пользователи
  - `events.js` - мероприятия
  - `drinks.js` - напитки
  - `orders.js` - заказы
  - `contests.js` - конкурсы
  - `admin.js` - админ-панель

### База данных:
- ✅ `database/` - папка с базой данных
  - `init.js` - инициализация БД
  - `setup.js` - настройка БД
  - `demo-data.js` - демо данные
  - `create-super-admin.js` - создание супер-админа

### Frontend:
- ✅ `admin-panel/index.html` - админ-панель
- ✅ `mini-app/index.html` - Mini App
- ✅ `login.html` - страница входа
- ✅ `public/uploads/.gitkeep` - папка для загрузок

### Документация:
- ✅ `README.md` - главная документация
- ✅ `DEPLOY.md` - инструкции по деплою
- ✅ `HOSTING.md` - сравнение хостингов
- ✅ `DEPLOY_LINKS.md` - готовые ссылки
- ✅ `GITHUB_UPLOAD.md` - инструкции по загрузке
- ✅ `FINAL_READY.md` - финальная инструкция
- ✅ `NEW_REPO_INSTRUCTIONS.md` - инструкции для нового репозитория

### Конфигурация:
- ✅ `env.production` - пример переменных окружения
- ✅ `env.example` - пример .env файла

## 🎯 После загрузки

### 1. Проверьте репозиторий
https://github.com/belix888/savosbot-club

### 2. Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите репозиторий `belix888/savosbot-club`
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
4. Выберите "Deploy from GitHub repo"
5. Выберите репозиторий `belix888/savosbot-club`
6. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
   JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
   NODE_ENV=production
   WEBHOOK_URL=https://your-app.vercel.app
   ```
7. Добавьте PostgreSQL базу данных

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

После загрузки и деплоя у вас будет:
- **GitHub**: https://github.com/belix888/savosbot-club
- **Web App**: https://your-app.vercel.app
- **Admin Panel**: https://your-app.vercel.app/admin-panel
- **Mini App**: https://your-app.vercel.app/mini-app
- **Telegram Bot**: Работает через webhook

## 📦 Альтернатива - Архив

Если загрузка файлов по одному сложная, используйте готовый архив:
- ✅ `savosbot-club-complete.zip` - архив со всеми файлами

Распакуйте архив и загрузите файлы через веб-интерфейс GitHub.

---

**🚀 Загрузите файлы и ваш SavosBot Club будет работать в продакшене!**
