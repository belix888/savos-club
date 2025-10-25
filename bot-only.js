// Telegram Bot for your hosting
require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SavosBot is running',
    timestamp: new Date().toISOString(),
    bot: bot ? 'Connected' : 'Not connected'
  });
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('Webhook received:', req.body);
  
  try {
    // Process the update
    bot.handleUpdate(req.body);
    res.json({ status: 'OK' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Bot commands
bot.start((ctx) => {
  console.log('Start command received from:', ctx.from.id);
  ctx.reply('🎉 Добро пожаловать в SavosBot Club!\n\nИспользуйте кнопки ниже для навигации:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📱 Открыть приложение', web_app: { url: 'https://your-app.vercel.app' } }
        ],
        [
          { text: '🔧 Админ-панель', web_app: { url: 'https://your-app.vercel.app/admin-panel' } }
        ]
      ]
    }
  });
});

bot.help((ctx) => {
  ctx.reply('🤖 SavosBot Club - Помощь\n\nКоманды:\n/start - Начать работу\n/help - Показать помощь');
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 SavosBot запущен на порту ${PORT}`);
  console.log(`🌐 Webhook URL: https://ваш-домен.com/webhook`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
