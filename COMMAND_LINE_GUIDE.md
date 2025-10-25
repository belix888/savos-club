# 🔑 Создание Personal Access Token для командной строки

## 🎯 Цель
Настроить командную строку для загрузки файлов на GitHub.

## ✅ Пошаговая инструкция

### Шаг 1: Создайте новый Personal Access Token

1. **Зайдите на**: https://github.com/settings/tokens
2. **Нажмите "Generate new token (classic)"**
3. **Заполните форму**:
   - **Note**: `SavosBot Club Command Line Access`
   - **Expiration**: `No expiration` (или выберите нужный срок)
   - **Scopes**: Отметьте галочками:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
     - ✅ `delete_repo` (Delete repositories)
4. **Нажмите "Generate token"**
5. **СКОПИРУЙТЕ ТОКЕН** (он больше не будет показан!)

### Шаг 2: Используйте готовый скрипт

```powershell
# Запустите готовый скрипт
.\upload-command-line.ps1
```

### Шаг 3: Введите токен
Когда Git запросит пароль, введите ваш Personal Access Token.

## 🔧 Альтернативные команды

### Команды вручную:
```powershell
# Настройка Git
git config --global user.name "belix888"
git config --global user.email "belix888@example.com"
git config --global credential.helper manager-core

# Настройка репозитория
git remote set-url origin https://github.com/belix888/savos-club.git

# Загрузка файлов
git add .
git commit -m "Add SavosBot Club project files"
git push -u origin main
```

### С токеном в URL:
```powershell
# Замените YOUR_TOKEN на ваш токен
git remote set-url origin https://belix888:YOUR_TOKEN@github.com/belix888/savos-club.git
git push -u origin main
```

## 🎯 После успешной загрузки

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

**🚀 Создайте токен и загрузите файлы через командную строку!**
