# 🔧 Настройка Turso Database для Vercel

## ✅ Что сделано:

1. **Добавлена зависимость** `@libsql/client` в `package.json`
2. **Обновлен `database/init.js`** для поддержки Turso с автоматическим fallback на SQLite
3. **Создан адаптер** для совместимости API Turso с sqlite3

## 📝 Инструкция по настройке:

### 1. Добавьте переменные окружения в Vercel:

Зайдите в Vercel Dashboard:
- Проект → Settings → Environment Variables
- Добавьте следующие переменные:

```
TURSO_DATABASE_URL=libsql://database-purple-flower-vercel-icfg-ihebhpwvlvjhg5nmjrw99a4o.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NjE5MDIyNjEsImlkIjoiZDI0YzlmYjgtZDY4OC00MDY4LThjMTItMTEwOWQzN2FmNTNjIiwicmlkIjoiNTI4NjNkNzItMjQ0Mi00MDJjLThmZDItZWQ1MzM3YjQ1OTBhIn0.91A4W-uIsVhaO8CX2CHdmxBwTLLbJKjdk7Az6T5AVnNFzdUrJb84A6Ne2h50AWdguM4Kl7F0FBVZ0WEOiYuhCA
```

### 2. Установите зависимости:

После пуша в GitHub, Vercel автоматически установит зависимости, включая `@libsql/client`.

### 3. Проверка работы:

После добавления переменных окружения и деплоя:
- ✅ Система автоматически определит наличие Turso
- ✅ База данных будет инициализирована при первом запуске
- ✅ Все таблицы будут созданы автоматически

## 🔄 Как это работает:

1. **Автоматическое определение**: Код проверяет наличие `TURSO_DATABASE_URL` и `TURSO_AUTH_TOKEN`
2. **Turso режим**: Если переменные есть → используется Turso (libSQL)
3. **SQLite режим**: Если переменных нет → используется локальный SQLite
4. **Совместимость API**: Адаптер обеспечивает совместимость с существующим кодом

## ⚠️ Важно:

- **На Vercel**: Используйте только Turso (локальный SQLite не работает)
- **Локально**: Можете использовать SQLite для разработки
- **Миграция данных**: Если у вас есть данные в локальной БД, нужно будет их экспортировать и импортировать в Turso

## 🚀 После настройки:

1. Vercel автоматически перезапустит деплой
2. Проверьте логи в Vercel Dashboard → Functions → Logs
3. Убедитесь, что видите сообщение: `✅ Using Turso database (libSQL)`

