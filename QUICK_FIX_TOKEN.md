# 🚨 БЫСТРОЕ ИСПРАВЛЕНИЕ: InvalidToken

## ❌ **Ошибка:**
```
telegram.error.InvalidToken: You must pass the token you received from https://t.me/Botfather!
```

## ⚡ **БЫСТРОЕ РЕШЕНИЕ:**

### **1. Создайте файл .env:**
```bash
cat > .env << 'EOF'
BOT_TOKEN=8498015879:AAEemLqn9Hv9NWC_hcqvx4goKlVwNCFsT_c
WEBSITE_URL=https://savos-club-two.vercel.app
API_KEY=savosbot2024
NODE_ENV=production
PORT=3000
DB_TYPE=file
DB_PATH=./data
LOG_LEVEL=INFO
LOG_FILE=./logs/bot.log
EOF
```

### **2. Создайте папки:**
```bash
mkdir -p data logs
```

### **3. Запустите бота:**
```bash
python3 telegram_bot_standalone.py
```

## ✅ **ИЛИ используйте автоматическую настройку:**

```bash
# Сделайте скрипт исполняемым:
chmod +x setup.sh

# Запустите настройку:
./setup.sh

# Запустите бота:
python3 telegram_bot_standalone.py
```

## 🔍 **Проверка:**

```bash
# Проверьте, что токен загружается:
python3 test_token.py
```

---

**🎯 Главное: Файл `.env` должен существовать и содержать правильный токен!**
