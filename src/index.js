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

// Endpoints для официантов (waiters)
// ==========================================
// Проверка статуса официанта и смены
app.get('/api/waiters', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.substring(7);
    const jwt = require('jsonwebtoken');
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024');
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const waiter = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND is_waiter = 1', [payload.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!waiter) {
      return res.status(403).json({ error: 'Not a waiter' });
    }
    const shift = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM waiter_shifts WHERE waiter_id = ? AND (end_time IS NULL OR status = "working") ORDER BY start_time DESC LIMIT 1', [payload.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    res.json({
      waiter: {
        id: waiter.id,
        first_name: waiter.first_name,
        last_name: waiter.last_name,
        username: waiter.username
      },
      shift: shift || null,
      is_on_shift: !!shift && !shift.end_time && shift.status === 'working'
    });
  } catch (error) {
    console.error('Error fetching waiter info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получение доступных заказов для официанта
app.get('/api/waiters/orders', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.substring(7);
    const jwt = require('jsonwebtoken');
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024');
      userId = payload.id;
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Проверяем, что пользователь является официантом и на смене
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND is_waiter = 1', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!user) return res.status(403).json({ error: 'Только официанты могут просматривать заказы' });
    
    const shift = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM waiter_shifts WHERE waiter_id = ? AND (end_time IS NULL OR status = "working") ORDER BY start_time DESC LIMIT 1', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!shift) {
      return res.status(400).json({ error: 'Вы не на смене. Начните смену, чтобы получать заказы.' });
    }
    if (shift.end_time || shift.status !== 'working') {
      return res.status(400).json({ error: 'Ваша смена завершена. Начните новую смену, чтобы получать заказы.' });
    }
    
    // Получаем все заказы со статусом 'new', которые еще не взяты
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          o.id, o.user_id, o.waiter_id, o.status, o.total_amount, o.created_at, o.updated_at,
          u.first_name as user_first_name, u.last_name as user_last_name,
          u.username as user_username, u.phone as user_phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.status = ? AND (o.waiter_id IS NULL OR o.waiter_id = 0)
        ORDER BY o.created_at ASC
      `, ['new'], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (!orders || orders.length === 0) {
      return res.json([]);
    }
    
    // Получаем позиции для всех заказов
    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT oi.order_id, oi.drink_id, oi.quantity, oi.price, d.name as drink_name
        FROM order_items oi
        LEFT JOIN drinks d ON oi.drink_id = d.id
        WHERE oi.order_id IN (${placeholders})
      `, orderIds, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    // Группируем позиции по заказам
    const itemsByOrder = {};
    (items || []).forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    });
    
    // Формируем финальный ответ
    const ordersWithItems = orders.map(order => {
      const orderItems = itemsByOrder[order.id] || [];
      const itemsText = orderItems
        .map(item => `${item.drink_name || 'Напиток #' + item.drink_id} (x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} фиш.)`)
        .join(', ');
      return {
        ...order,
        items_text: itemsText,
        items_count: orderItems.length
      };
    });
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching waiter orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получение активных заказов официанта
app.get('/api/waiters/orders/active', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = auth.substring(7);
    const jwt = require('jsonwebtoken');
    let userId;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024');
      userId = payload.id;
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND is_waiter = 1', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!user) return res.status(403).json({ error: 'Только официанты могут просматривать свои заказы' });
    
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, u.first_name, u.last_name, u.username
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.waiter_id = ? AND o.status IN ('taken', 'new')
        ORDER BY o.created_at ASC
      `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    res.json(orders || []);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      // Шаг 1: запрос имени (если first_name пуст)
      if (!ctx.from.first_name) {
        await ctx.reply('👋 Добро пожаловать! Напишите, пожалуйста, ваше имя.');
        return;
      }

      // Шаг 2: запрос телефона через кнопку запроса контакта
      await ctx.reply('📞 Отправьте, пожалуйста, ваш номер телефона для регистрации', {
        reply_markup: {
          keyboard: [
            [{ text: '📲 Отправить номер телефона', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

      // Сохраняем предварительно пользователя с базовыми данными; номер телефона и фото добавим после
      const internalId = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
          [userId, ctx.from.username, ctx.from.first_name, ctx.from.last_name],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Получаем ссылку на профиль и фото
      const profile_link = ctx.from.username ? `https://t.me/${ctx.from.username}` : undefined;
      let photo_url = null;
      try {
        const photos = await ctx.telegram.getUserProfilePhotos(userId, 0, 1);
        if (photos.total_count > 0) {
          const fileId = photos.photos[0][0].file_id;
          const file = await ctx.telegram.getFile(fileId);
          photo_url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
        }
      } catch (e) {
        console.warn('Не удалось получить фото профиля:', e.message);
      }

      // Сохраняем ссылку и фото (телефон добавим при получении контакта)
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET profile_link = COALESCE(?, profile_link), photo_url = COALESCE(?, photo_url) WHERE id = ?',
          [profile_link || null, photo_url || null, internalId],
          function(err) { if (err) reject(err); else resolve(); }
        );
      });

      await ctx.reply('Спасибо! Теперь нажмите кнопку, чтобы отправить ваш номер телефона.');
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

// Обработка контакта с номером телефона
bot.on('contact', async (ctx) => {
  try {
    const tgId = ctx.from.id;
    const phone = ctx.message.contact.phone_number;

    // Обновляем телефон и updated_at
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
        [phone, tgId],
        function(err) { if (err) reject(err); else resolve(); }
      );
    });

    // Получаем пользователя, чтобы показать его внутренний ID
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [tgId], (err, row) => {
        if (err) reject(err); else resolve(row);
      });
    });

    await ctx.reply(
      `✅ Регистрация завершена!\n\n` +
      `Ваше имя: ${ctx.from.first_name} ${ctx.from.last_name || ''}\n` +
      `Номер: +${phone.replace(/[^\d]/g, '')}\n` +
      `ID в системе: ${user.id}\n` +
      `${ctx.from.username ? `Профиль: https://t.me/${ctx.from.username}` : ''}`,
      {
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [{ text: '🚀 Открыть приложение', web_app: { url: `${process.env.WEBHOOK_URL}/mini-app` } }],
            [{ text: '📋 Мой профиль', callback_data: 'profile' }]
          ]
        }
      }
    );
  } catch (error) {
    console.error('Ошибка при обработке контакта:', error);
    await ctx.reply('Не удалось сохранить номер телефона. Попробуйте еще раз командой /start');
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
