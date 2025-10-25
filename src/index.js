// Load environment variables
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config();
}
const { Telegraf } = require('telegraf');
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../database/init');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Импорт маршрутов
const { router: authRoutes } = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const drinkRoutes = require('./routes/drinks');
const orderRoutes = require('./routes/orders');
const contestRoutes = require('./routes/contests');
const adminRoutes = require('./routes/admin');

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/drinks', drinkRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);

// Основные команды бота
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  
  try {
    // Проверяем, есть ли пользователь в базе
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      // Регистрируем нового пользователя
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
          [userId, ctx.from.username, ctx.from.first_name, ctx.from.last_name],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      await ctx.reply(
        `🎉 Добро пожаловать в SavosBot Club, ${username}!\n\n` +
        `Вы успешно зарегистрированы в системе клуба. ` +
        `Используйте кнопку "Открыть приложение" для доступа ко всем функциям!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
              [{ text: '📋 Мой профиль', callback_data: 'profile' }]
            ]
          }
        }
      );
    } else {
      await ctx.reply(
        `👋 С возвращением, ${username}!\n\n` +
        `Добро пожаловать обратно в SavosBot Club. ` +
        `Что бы вы хотели сделать?`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
              [{ text: '📋 Мой профиль', callback_data: 'profile' }],
              [{ text: '📅 Афиша', callback_data: 'events' }],
              [{ text: '🍸 Бар', callback_data: 'bar' }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Ошибка при обработке команды /start:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка callback-запросов
bot.action('profile', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (user) {
      const status = user.is_resident ? '🏆 Резидент' : '👤 Гость';
      const waiterStatus = user.is_waiter ? ' | 🍽️ Официант' : '';
      
      await ctx.editMessageText(
        `👤 Ваш профиль:\n\n` +
        `Имя: ${user.first_name} ${user.last_name || ''}\n` +
        `Username: @${user.username || 'не указан'}\n` +
        `Статус: ${status}${waiterStatus}\n` +
        `Дата регистрации: ${new Date(user.created_at).toLocaleDateString('ru-RU')}\n\n` +
        `Используйте приложение для полного доступа к функциям!`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
              [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    await ctx.answerCbQuery('Ошибка при загрузке профиля');
  }
});

bot.action('events', async (ctx) => {
  await ctx.editMessageText(
    '📅 Афиша мероприятий\n\n' +
    'Здесь вы можете посмотреть предстоящие события клуба. ' +
    'Для полного доступа используйте приложение!',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
});

bot.action('bar', async (ctx) => {
  await ctx.editMessageText(
    '🍸 Бар клуба\n\n' +
    'Закажите напитки прямо из Telegram! ' +
    'Для полного меню используйте приложение.',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
          [{ text: '🔙 Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
  );
});

bot.action('back_to_main', async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;
  
  await ctx.editMessageText(
    `👋 Главное меню SavosBot Club\n\n` +
    `Добро пожаловать, ${username}! ` +
    `Выберите нужный раздел:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
          [{ text: '📋 Мой профиль', callback_data: 'profile' }],
          [{ text: '📅 Афиша', callback_data: 'events' }],
          [{ text: '🍸 Бар', callback_data: 'bar' }]
        ]
      }
    }
  );
});

// Команда помощи
bot.help(async (ctx) => {
  await ctx.reply(
    '🆘 Помощь по SavosBot Club\n\n' +
    'Основные команды:\n' +
    '/start - Начать работу с ботом\n' +
    '/help - Показать это сообщение\n' +
    '/menu - Главное меню\n\n' +
    'Для полного доступа ко всем функциям используйте кнопку "Открыть приложение"!',
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }]
        ]
      }
    }
  );
});

// Команда меню
bot.command('menu', async (ctx) => {
  const username = ctx.from.username || ctx.from.first_name;
  
  await ctx.reply(
    `🍽️ Главное меню SavosBot Club\n\n` +
    `Добро пожаловать, ${username}! ` +
    `Выберите нужный раздел:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
          [{ text: '📋 Мой профиль', callback_data: 'profile' }],
          [{ text: '📅 Афиша', callback_data: 'events' }],
          [{ text: '🍸 Бар', callback_data: 'bar' }]
        ]
      }
    }
  );
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка бота:', err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

// Webhook для Telegram (только для продакшена с HTTPS)
if (process.env.BOT_TOKEN && process.env.BOT_TOKEN !== 'demo_bot_token_for_testing' && process.env.WEBHOOK_URL.startsWith('https://')) {
    app.use(bot.webhookCallback('/webhook'));
    bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/webhook`);
    console.log('🔗 Webhook установлен для продакшена');
} else {
    console.log('⚠️  Локальная разработка: используйте polling вместо webhook');
    // Для локальной разработки можно использовать polling
    // bot.launch(); // Раскомментируйте для polling режима
}

// Главная страница - страница для пользователей
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Страница входа для админов
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// Страница админ-панели
app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin-panel', 'index.html'));
});

// Страница Mini App
app.get('/mini-app', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'mini-app', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SavosBot Club запущен на порту ${PORT}`);
  console.log(`📱 Mini App доступен по адресу: ${process.env.WEBHOOK_URL}/mini-app`);
  console.log(`🔧 Админ-панель доступна по адресу: ${process.env.WEBHOOK_URL}`);
});

module.exports = { bot, app };
