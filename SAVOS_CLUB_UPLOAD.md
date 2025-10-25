# 🚀 SavosBot Club - Загрузка в новый репозиторий

## ✅ Репозиторий готов
https://github.com/belix888/savos-club

## ❌ Проблема с автоматической загрузкой
Git push не работает из-за проблем с правами доступа.

## ✅ Решение - Ручная загрузка через веб-интерфейс

### Шаг 1: Откройте ваш репозиторий
https://github.com/belix888/savos-club

### Шаг 2: Загрузите файлы
1. **Нажмите кнопку "Add file"** → **"Upload files"**
2. **Перетащите ВСЕ файлы** из папки `H:\savosbot\` в окно загрузки
3. **Добавьте commit message**: "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
4. **Нажмите "Commit changes"**

## 📁 Что загружать

### Основные файлы:
- `package.json`
- `package-lock.json`
- `vercel.json`
- `.gitignore`
- `LICENSE`

### Папки:
- `src/` (весь исходный код)
- `database/` (база данных)
- `admin-panel/` (админ-панель)
- `mini-app/` (Mini App)
- `public/` (статические файлы)

### HTML файлы:
- `login.html`
- `README.md`
- Все `.md` файлы документации

## 🎯 После загрузки

### 1. Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savos-club`
5. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
   JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
   NODE_ENV=production
   ```
6. Нажмите "Deploy"

### 2. Деплой на Railway
1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savos-club`
5. Добавьте переменные окружения:
   ```
   BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
   JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
   NODE_ENV=production
   WEBHOOK_URL=https://your-app.vercel.app
   ```
6. Добавьте PostgreSQL базу данных

## 🔑 Данные для входа
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 🌐 Результат
- **GitHub**: https://github.com/belix888/savos-club
- **Web App**: https://your-app.vercel.app
- **Admin Panel**: https://your-app.vercel.app/admin-panel
- **Mini App**: https://your-app.vercel.app/mini-app

---

**🚀 Загрузите файлы через веб-интерфейс и ваш SavosBot Club будет работать!**
