# 🔧 Настройка GitHub репозитория для автоматической загрузки

## 🎯 Цель
Настроить репозиторий так, чтобы можно было легко загружать файлы через командную строку.

## 📋 Пошаговая инструкция

### Шаг 1: Создание Personal Access Token

1. **Зайдите на GitHub**: https://github.com/settings/tokens
2. **Нажмите "Generate new token (classic)"**
3. **Заполните форму**:
   - **Note**: "SavosBot Club Development"
   - **Expiration**: "No expiration" (или выберите нужный срок)
   - **Scopes**: Отметьте галочками:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
4. **Нажмите "Generate token"**
5. **СКОПИРУЙТЕ ТОКЕН** (он больше не будет показан!)

### Шаг 2: Настройка Git в командной строке

Откройте PowerShell в папке `H:\savosbot\` и выполните команды:

```powershell
# Настройка имени пользователя
git config --global user.name "belix888"

# Настройка email (замените на ваш email)
git config --global user.email "your_email@example.com"

# Настройка сохранения учетных данных
git config --global credential.helper store

# Установка URL с токеном (замените YOUR_TOKEN на ваш токен)
git remote set-url origin https://belix888:YOUR_TOKEN@github.com/belix888/savosbot.git
```

### Шаг 3: Загрузка файлов

```powershell
# Добавление всех файлов
git add .

# Создание коммита
git commit -m "Add SavosBot Club project files"

# Загрузка на GitHub
git push -u origin main
```

## 🔐 Альтернативный способ - SSH ключи

### Создание SSH ключа:

```powershell
# Генерация SSH ключа (замените email на ваш)
ssh-keygen -t ed25519 -C "your_email@example.com"

# При запросе пути нажмите Enter (используйте путь по умолчанию)
# При запросе пароля нажмите Enter (без пароля)

# Копирование публичного ключа
Get-Content ~/.ssh/id_ed25519.pub
```

### Добавление SSH ключа на GitHub:

1. **Скопируйте содержимое файла** `id_ed25519.pub`
2. **Зайдите на**: https://github.com/settings/keys
3. **Нажмите "New SSH key"**
4. **Заполните**:
   - **Title**: "SavosBot Club Development"
   - **Key**: Вставьте скопированный ключ
5. **Нажмите "Add SSH key"**

### Использование SSH:

```powershell
# Изменение URL на SSH
git remote set-url origin git@github.com:belix888/savosbot.git

# Загрузка файлов
git push -u origin main
```

## 🚀 Быстрая загрузка (если токен настроен)

После настройки токена, просто выполните:

```powershell
# Перейдите в папку проекта
cd H:\savosbot

# Добавьте все файлы
git add .

# Создайте коммит
git commit -m "Add SavosBot Club project files"

# Загрузите на GitHub
git push -u origin main
```

## 🔧 Troubleshooting

### Ошибка "Permission denied":
- Проверьте правильность токена
- Убедитесь, что токен имеет права `repo`
- Проверьте правильность URL

### Ошибка "Authentication failed":
- Удалите сохраненные учетные данные:
  ```powershell
  git config --global --unset credential.helper
  git config --global credential.helper store
  ```

### Ошибка "Repository not found":
- Проверьте правильность имени репозитория
- Убедитесь, что репозиторий существует
- Проверьте права доступа

## 📱 После успешной загрузки

### 1. Проверьте репозиторий
https://github.com/belix888/savosbot

### 2. Деплой на Vercel
1. Зайдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savosbot`
5. Добавьте переменные окружения
6. Нажмите "Deploy"

### 3. Деплой на Railway
1. Зайдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите `belix888/savosbot`
5. Добавьте переменные окружения
6. Добавьте PostgreSQL базу данных

## 🔑 Переменные окружения

### Vercel:
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
```

### Railway:
```
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
JWT_SECRET=savosbot_club_super_secret_jwt_key_2024
NODE_ENV=production
WEBHOOK_URL=https://your-app.vercel.app
```

## 🎉 Результат

После выполнения всех шагов:
- ✅ Все файлы загружены на GitHub
- ✅ Репозиторий настроен для автоматической загрузки
- ✅ Готов к деплою на Vercel и Railway
- ✅ SavosBot Club работает в продакшене

---

**🚀 Настройте токен и ваш SavosBot Club будет загружен на GitHub!**
