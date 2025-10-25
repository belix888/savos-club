// Simplified server for Render deployment
require('dotenv').config({ path: '.env.production' });
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files
app.use('/admin-panel', express.static(path.join(__dirname, '../admin-panel')));
app.use('/mini-app', express.static(path.join(__dirname, '../mini-app')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-panel/index.html'));
});

app.get('/mini-app', (req, res) => {
  res.sendFile(path.join(__dirname, '../mini-app/index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SavosBot Club is running',
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
          { text: '📱 Открыть приложение', web_app: { url: process.env.WEBHOOK_URL || 'https://your-app.vercel.app' } }
        ],
        [
          { text: '🔧 Админ-панель', web_app: { url: `${process.env.WEBHOOK_URL || 'https://your-app.vercel.app'}/admin-panel` } }
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
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 SavosBot Club запущен на порту ${PORT}`);
  console.log(`📱 Mini App доступен по адресу: ${process.env.WEBHOOK_URL || 'https://your-app.vercel.app'}/mini-app`);
  console.log(`🔧 Админ-панель доступна по адресу: ${process.env.WEBHOOK_URL || 'https://your-app.vercel.app'}/admin-panel`);
  console.log(`🌐 Webhook URL: ${process.env.WEBHOOK_URL || 'https://your-app.vercel.app'}/webhook`);
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
