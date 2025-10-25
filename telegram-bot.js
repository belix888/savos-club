// Telegram Bot for SavosBot Club
require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import database initialization
const { initDatabase, getUserById, updateUser, getAllUsers, getSettings, updateSettings, updateStats } = require('./database-init');

// Import website connection
const { websiteConnection } = require('./website-connection');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SavosBot is running',
    timestamp: new Date().toISOString(),
    bot: bot ? 'Connected' : 'Not connected',
    database: 'Initialized'
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
  
  // Save user to database
  const userData = {
    id: ctx.from.id,
    username: ctx.from.username,
    first_name: ctx.from.first_name,
    last_name: ctx.from.last_name,
    joined_at: new Date().toISOString(),
    is_active: true
  };
  
  // Save user data to file (simple database)
  saveUserData(userData);
  
  ctx.reply('🎉 Добро пожаловать в SavosBot Club!\n\nИспользуйте кнопки ниже для навигации:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📱 Открыть приложение', web_app: { url: process.env.WEBSITE_URL || 'https://your-app.vercel.app' } }
        ],
        [
          { text: '🔧 Админ-панель', web_app: { url: `${process.env.WEBSITE_URL || 'https://your-app.vercel.app'}/admin-panel` } }
        ],
        [
          { text: '📊 Статистика', callback_data: 'stats' }
        ]
      ]
    }
  });
});

bot.help((ctx) => {
  ctx.reply('🤖 SavosBot Club - Помощь\n\nКоманды:\n/start - Начать работу\n/help - Показать помощь\n/stats - Показать статистику');
});

bot.command('stats', (ctx) => {
  const stats = getStats();
  ctx.reply(`📊 Статистика SavosBot Club:\n\n👥 Всего пользователей: ${stats.totalUsers}\n🟢 Активных: ${stats.activeUsers}\n📅 Зарегистрировано сегодня: ${stats.todayUsers}`);
});

// Callback handlers
bot.action('stats', (ctx) => {
  const stats = getStats();
  ctx.answerCbQuery();
  ctx.reply(`📊 Статистика SavosBot Club:\n\n👥 Всего пользователей: ${stats.totalUsers}\n🟢 Активных: ${stats.activeUsers}\n📅 Зарегистрировано сегодня: ${stats.todayUsers}`);
});

// Function to save user data
async function saveUserData(userData) {
  try {
    // Save to local database
    const usersFile = path.join(__dirname, 'data', 'users.json');
    let users = [];
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.dirname(usersFile))) {
      fs.mkdirSync(path.dirname(usersFile), { recursive: true });
    }
    
    // Read existing users
    if (fs.existsSync(usersFile)) {
      const data = fs.readFileSync(usersFile, 'utf8');
      users = JSON.parse(data);
    }
    
    // Check if user already exists
    const existingUserIndex = users.findIndex(user => user.id === userData.id);
    if (existingUserIndex !== -1) {
      // Update existing user
      users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
    } else {
      // Add new user
      users.push(userData);
    }
    
    // Save users locally
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log('✅ User data saved locally:', userData.id);
    
    // Send to website
    const websiteResult = await websiteConnection.sendUserToWebsite(userData);
    if (websiteResult) {
      console.log('✅ User data synced with website:', userData.id);
    } else {
      console.log('⚠️ Failed to sync user data with website:', userData.id);
    }
    
    // Update statistics
    updateStats({
      total_users: users.length,
      active_users: users.filter(user => user.is_active).length
    });
    
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

// Function to get statistics
function getStats() {
  try {
    const usersFile = path.join(__dirname, 'data', 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      return { totalUsers: 0, activeUsers: 0, todayUsers: 0 };
    }
    
    const data = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(data);
    
    const today = new Date().toDateString();
    const todayUsers = users.filter(user => 
      new Date(user.joined_at).toDateString() === today
    ).length;
    
    return {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.is_active).length,
      todayUsers: todayUsers
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return { totalUsers: 0, activeUsers: 0, todayUsers: 0 };
  }
}

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 SavosBot запущен на порту ${PORT}`);
  console.log(`🌐 Webhook URL: https://ваш-домен.com/webhook`);
  console.log(`🔗 Website URL: ${process.env.WEBSITE_URL || 'https://your-app.vercel.app'}`);
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
