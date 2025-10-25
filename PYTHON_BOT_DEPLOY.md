# 🚀 Деплой Telegram бота на Python на ваш хостинг

## ✅ **Файлы готовы для загрузки на ваш хостинг:**

### 📁 **Основные файлы Python:**
- ✅ **`telegram_bot.py`** - основной файл бота на Python
- ✅ **`database_init.py`** - инициализация базы данных на Python
- ✅ **`website_connection.py`** - связь с сайтом на Python
- ✅ **`requirements.txt`** - зависимости Python
- ✅ **`env-python.txt`** - переменные окружения (переименуйте в `.env`)

### 📁 **Скрипты запуска:**
- ✅ **`start_bot.py`** - основной скрипт запуска
- ✅ **`start_bot.sh`** - скрипт для Linux/Mac
- ✅ **`start_bot.bat`** - скрипт для Windows

## 🔧 **Настройка на вашем хостинге:**

### **Шаг 1: Загрузите файлы**
1. **Загрузите** все файлы на ваш хостинг
2. **Переименуйте** `env-python.txt` в `.env`
3. **Отредактируйте** `.env` файл с вашими настройками

### **Шаг 2: Установите Python**
```bash
# Для Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Для CentOS/RHEL
sudo yum install python3 python3-pip

# Для Windows
# Скачайте с https://python.org
```

### **Шаг 3: Создайте виртуальное окружение**
```bash
# Создание виртуального окружения
python3 -m venv savosbot_env

# Активация (Linux/Mac)
source savosbot_env/bin/activate

# Активация (Windows)
savosbot_env\Scripts\activate
```

### **Шаг 4: Установите зависимости**
```bash
pip install -r requirements.txt
```

### **Шаг 5: Настройте переменные окружения**
Отредактируйте файл `.env`:
```env
# Telegram Bot Configuration
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c

# Website Configuration
WEBSITE_URL=https://your-app.vercel.app
API_KEY=savosbot2024

# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_TYPE=file
DB_PATH=./data

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=./logs/bot.log
```

### **Шаг 6: Запустите бота**

#### **Для Linux/Mac:**
```bash
chmod +x start_bot.sh
./start_bot.sh
```

#### **Для Windows:**
```cmd
start_bot.bat
```

#### **Или напрямую:**
```bash
python3 start_bot.py
```

### **Шаг 7: Настройте webhook**
Замените `ваш-домен.com` на ваш реальный домен:
```bash
curl -X POST "https://api.telegram.org/bot8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://ваш-домен.com/webhook"}'
```

## 🌐 **Архитектура:**

```
Telegram Bot (Python) → Webhook → Ваш хостинг (ваш-домен.com)
                                    ↓
                              Локальная БД (data/)
                                    ↓
                              Vercel (your-app.vercel.app)
                                    ↓
                              Синхронизация данных
```

## 🔗 **Связь с сайтом:**

### **Автоматическая синхронизация:**
- ✅ Пользователи сохраняются локально и на сайте
- ✅ Статистика обновляется в реальном времени
- ✅ Настройки синхронизируются между ботом и сайтом
- ✅ Уведомления отправляются на сайт

### **API Endpoints для сайта:**
- `POST /api/users` - добавление пользователя
- `GET /api/users/:id` - получение пользователя
- `PUT /api/users/:id` - обновление пользователя
- `POST /api/statistics` - отправка статистики
- `GET /api/health` - проверка здоровья

## 📊 **База данных:**

### **Структура файлов:**
```
data/
├── users.json          # Пользователи
├── settings.json       # Настройки
└── statistics.json     # Статистика
```

### **Автоматическая инициализация:**
- ✅ Создание директорий
- ✅ Инициализация файлов БД
- ✅ Настройка по умолчанию

## 🐍 **Преимущества Python:**

### ✅ **Производительность:**
- Асинхронная обработка
- Быстрая работа с API
- Эффективное управление памятью

### ✅ **Гибкость:**
- Легкая интеграция с сайтом
- Простое добавление функций
- Модульная архитектура

### ✅ **Надежность:**
- Обработка ошибок
- Логирование
- Автоматическое восстановление

## 🔧 **Настройка переменных окружения:**

### **Обязательные:**
```env
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
WEBSITE_URL=https://your-app.vercel.app
API_KEY=savosbot2024
```

### **Опциональные:**
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=INFO
DB_PATH=./data
SYNC_INTERVAL=300
AUTO_SYNC=true
```

## 🎯 **Преимущества:**

### ✅ **Полный контроль:**
- Собственные логи
- Собственные настройки
- Собственная база данных
- Собственный домен

### ✅ **Надежность:**
- Нет ограничений бесплатных планов
- Стабильная работа
- Быстрый отклик
- Автоматическая синхронизация

### ✅ **Интеграция:**
- Связь с сайтом
- Синхронизация данных
- API для взаимодействия
- Уведомления

## 🔑 **Данные для входа:**
- **Обычный админ**: `admin:admin123`
- **Супер-админ**: `superadmin:savos2024`

## 📱 **Тестирование:**

### **1. Проверка бота:**
- Найдите бота в Telegram
- Отправьте `/start`
- Проверьте кнопки

### **2. Проверка сайта:**
- Откройте https://your-app.vercel.app
- Войдите в админ-панель
- Проверьте статистику

### **3. Проверка связи:**
- Отправьте `/stats` боту
- Проверьте логи на хостинге
- Проверьте синхронизацию

## 🔧 **Troubleshooting:**

### **Если бот не отвечает:**
1. Проверьте логи на вашем хостинге
2. Убедитесь, что сервер запущен
3. Проверьте webhook URL
4. Проверьте переменные окружения

### **Если webhook не работает:**
1. Проверьте SSL сертификат
2. Убедитесь, что порт открыт
3. Проверьте файрвол
4. Проверьте URL webhook

### **Если связь с сайтом не работает:**
1. Проверьте WEBSITE_URL в .env
2. Проверьте API_KEY
3. Проверьте доступность сайта
4. Проверьте логи

## 📝 **Логи:**

### **Проверка логов:**
```bash
# Просмотр логов в реальном времени
tail -f logs/bot.log

# Просмотр последних 100 строк
tail -n 100 logs/bot.log
```

## 🚀 **Автозапуск (systemd):**

### **Создайте файл сервиса:**
```bash
sudo nano /etc/systemd/system/savosbot.service
```

### **Содержимое файла:**
```ini
[Unit]
Description=SavosBot Telegram Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/savosbot
Environment=PATH=/path/to/savosbot/savosbot_env/bin
ExecStart=/path/to/savosbot/savosbot_env/bin/python start_bot.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### **Активация сервиса:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable savosbot
sudo systemctl start savosbot
sudo systemctl status savosbot
```

---

**🚀 Загрузите файлы на ваш хостинг и настройте webhook!**

**📞 Поддержка:** Если возникнут проблемы, проверьте логи и переменные окружения.
