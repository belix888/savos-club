#!/bin/bash

# Скрипт для запуска бота БЕЗ прокси

echo "🔧 Отключение прокси для этого сеанса..."

# Отключаем все переменные прокси
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset FTP_PROXY
unset ftp_proxy
unset ALL_PROXY
unset all_proxy

# Устанавливаем NO_PROXY для всех хостов
export NO_PROXY="*"
export no_proxy="*"

echo "✅ Прокси отключен"
echo "🚀 Запуск бота..."

# Запускаем бота
python3 bot_working.py


