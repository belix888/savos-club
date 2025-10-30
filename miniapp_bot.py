import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes


MINI_APP_URL = os.getenv("MINI_APP_URL", "https://savos-club-two.vercel.app/mini-app")
BOT_TOKEN = os.getenv("BOT_TOKEN")  # установите переменную окружения или вставьте строкой


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("📱 Открыть мини‑приложение", web_app=WebAppInfo(url=MINI_APP_URL))]]
    await update.message.reply_text(
        "👋 Добро пожаловать в SavosBot Club!\n\nНажмите кнопку ниже, чтобы открыть мини‑приложение.",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


def main():
    token = BOT_TOKEN or os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit("Set BOT_TOKEN or TELEGRAM_BOT_TOKEN env var with your Telegram bot token")

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("start", start))

    # На всякий случай снимем возможный webhook перед запуском polling
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()


