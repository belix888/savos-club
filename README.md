# 🏛️ SavosBot Club

**Telegram Bot с Mini App для управления клубом**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/belix888/savos-club)
[![Deploy with Railway](https://railway.app/button.svg)](https://railway.app/template/deploy?template=https://github.com/belix888/savos-club)

## 🚀 Быстрый старт

### Локальная разработка
```bash
# Клонируйте репозиторий
git clone https://github.com/belix888/savos-club.git
cd savos-club

# Установите зависимости
npm install

# Настройте базу данных
npm run setup
npm run demo
npm run create-super-admin

# Запустите проект
npm run dev
```

### Деплой на Vercel
1. Нажмите кнопку "Deploy with Vercel" выше
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения
4. Деплой автоматически запустится

### Деплой на Railway
1. Нажмите кнопку "Deploy with Railway" выше
2. Подключите GitHub репозиторий
3. Добавьте переменные окружения
4. Деплой автоматически запустится

## 📱 Возможности

### 🤖 Telegram Bot
- Автоматическая регистрация пользователей
- Управление статусами (гость, резидент, официант)
- Уведомления о заказах и мероприятиях
- Интеграция с Mini App

### 📱 Mini App
- **Афиша**: Просмотр мероприятий и регистрация
- **Бар**: Заказ напитков и еды
- **Конкурсы**: Участие в конкурсах клуба
- **Профиль**: Управление статусом и заказами

### 🔧 Админ-панель
- **Дашборд**: Статистика и аналитика
- **Пользователи**: Управление пользователями
- **Мероприятия**: Создание и редактирование событий
- **Напитки**: Управление меню бара
- **Заказы**: Отслеживание заказов
- **Конкурсы**: Управление конкурсами
- **Официанты**: Управление персоналом
- **Супер-админ**: Расширенные функции

### 🔐 Супер-админ
- Настройки системы
- Управление доступом к разделам
- Системные операции
- Расширенная статистика

## 🛠️ Технологии

- **Backend**: Node.js, Express.js
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Bot**: Telegraf.js
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: JWT
- **File Upload**: Multer
- **Deployment**: Vercel, Railway

## 🔑 Доступ к системе

### Админ-панель
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

### Telegram Bot
1. Найдите бота в Telegram
2. Отправьте `/start`
3. Используйте кнопку "Открыть приложение"

## 📁 Структура проекта

```
savosbot-club/
├── src/                    # Исходный код сервера
│   ├── index.js           # Главный файл сервера
│   └── routes/            # API маршруты
├── database/              # База данных
│   ├── init.js           # Инициализация БД
│   ├── setup.js          # Настройка БД
│   └── demo-data.js      # Демо данные
├── admin-panel/          # Админ-панель
│   └── index.html        # Интерфейс админки
├── mini-app/             # Mini App
│   └── index.html        # Интерфейс приложения
├── public/                # Статические файлы
├── login.html            # Страница входа
├── package.json          # Зависимости
├── vercel.json           # Конфигурация Vercel
└── README.md             # Документация
```

## 🌐 Деплой

### Vercel (Рекомендуется)
- ✅ Бесплатно
- ✅ Автодеплой из GitHub
- ✅ HTTPS из коробки
- ✅ CDN

### Railway
- ✅ Бесплатно (500ч/мес)
- ✅ База данных PostgreSQL
- ✅ Автодеплой
- ✅ Простой интерфейс

### Render
- ✅ Бесплатно (750ч/мес)
- ✅ База данных PostgreSQL
- ✅ Автодеплой
- ✅ Надежный хостинг

## 🔧 Переменные окружения

```env
# Telegram Bot
BOT_TOKEN=your_telegram_bot_token
WEBHOOK_URL=https://your-app.vercel.app

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=3000
NODE_ENV=production

# Database (для продакшена)
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📊 Мониторинг

- **Vercel Analytics**: Встроенная аналитика
- **Railway Metrics**: Мониторинг производительности
- **Telegram Bot API**: Статистика бота

## 🔒 Безопасность

- JWT аутентификация
- CORS настройки
- Валидация входных данных
- Защита от SQL инъекций
- Безопасное хранение паролей

## 📈 Roadmap

- [ ] Интеграция с платежными системами
- [ ] Мобильное приложение
- [ ] Система лояльности
- [ ] Аналитика и отчеты
- [ ] Многоязычность
- [ ] API для партнеров

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

## 📞 Поддержка

- **GitHub Issues**: [Создать issue](https://github.com/yourusername/savosbot-club/issues)
- **Telegram**: [@savosbot_support](https://t.me/savosbot_support)
- **Email**: support@savosbot.club

---

**🎉 SavosBot Club - Современное решение для управления клубом!**