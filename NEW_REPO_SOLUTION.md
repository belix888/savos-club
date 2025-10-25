# 🚀 SavosBot Club - Создание нового репозитория и загрузка

## ❌ Проблема с токеном
Текущий токен не работает для загрузки файлов.

## ✅ Решение - Создать новый репозиторий

### Шаг 1: Создайте новый репозиторий на GitHub

1. **Зайдите на GitHub**: https://github.com/new
2. **Заполните форму**:
   - **Repository name**: `savosbot-club-project`
   - **Description**: `Telegram Bot with Mini App for club management`
   - **Visibility**: Public
   - **Initialize**: НЕ отмечайте галочки (не создавайте README, .gitignore, license)
3. **Нажмите "Create repository"**

### Шаг 2: Загрузите файлы через веб-интерфейс

1. **Откройте новый репозиторий**: https://github.com/belix888/savosbot-club-project
2. **Нажмите "Add file"** → **"Upload files"**
3. **Перетащите ВСЕ файлы** из папки `H:\savosbot\` в окно загрузки
4. **Добавьте commit message**: "Add SavosBot Club project files - Complete Telegram Bot with Mini App"
5. **Нажмите "Commit changes"**

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
4. Выберите `belix888/savosbot-club-project`
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
4. Выберите `belix888/savosbot-club-project`
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
- **GitHub**: https://github.com/belix888/savosbot-club-project
- **Web App**: https://your-app.vercel.app
- **Admin Panel**: https://your-app.vercel.app/admin-panel
- **Mini App**: https://your-app.vercel.app/mini-app

---

**🚀 Создайте новый репозиторий и загрузите файлы через веб-интерфейс!**
