const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve static files
app.use('/mini-app', express.static(path.join(__dirname, '../mini-app')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/admin-panel', (req, res) => {
  // Проверяем localStorage токен или отправляем на страницу логина
  // Если это запрос напрямую к admin-panel, нужно проверить аутентификацию через cookie/session
  // Для простоты, просто отправляем HTML файл - проверка на стороне клиента
  res.sendFile(path.join(__dirname, '../admin-panel/index.html'));
});

app.get('/mini-app', (req, res) => {
  res.sendFile(path.join(__dirname, '../mini-app/index.html'));
});

// API routes for bot integration
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SavosBot Club API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auth API endpoint for Telegram Mini App
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID обязателен' });
    }

    // Connect to database to get real user data
    const db = require('../database/init');
    
    // Try to get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    let mockUser;
    
    if (user) {
      // User exists - return database data with internal ID
      mockUser = {
        id: user.id,  // Internal ID from database
        internal_id: user.id,  // Also set internal_id for clarity
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name || '',
        phone: user.phone,
        profile_link: user.profile_link,
        photo_url: user.photo_url,
        is_resident: user.is_resident || false,
        is_waiter: user.is_waiter || false,
        is_admin: user.is_admin || false,
        is_super_admin: user.is_super_admin || false,
        created_at: user.created_at || new Date().toISOString()
      };
    } else {
      // User not registered in database
      // They need to register via /start command in bot first
      // This ensures they get a proper internal ID (1, 2, 3...) from AUTOINCREMENT
      return res.status(404).json({ 
        error: 'User not registered',
        message: 'Please register via Telegram bot using /start command first'
      });
    }

    const token = jwt.sign(
      { 
        id: mockUser.id, 
        telegram_id: mockUser.telegram_id,
        is_admin: false,
        is_super_admin: false,
        is_waiter: false,
        is_resident: false
      },
      process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: mockUser
    });

  } catch (error) {
    console.error('❌ Error in Telegram auth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users API endpoints
app.post('/api/users', (req, res) => {
  try {
    const userData = req.body;
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Validate user data
    if (!userData.id || !userData.source) {
      return res.status(400).json({ error: 'Invalid user data' });
    }
    
    // Connect to database
    const db = require('../database/init');
    
    // Check if user exists
    db.get('SELECT * FROM users WHERE telegram_id = ?', [userData.id], (err, existingUser) => {
      if (err) {
        console.error('❌ Error checking user:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingUser) {
        // Update existing user
        db.run(
          'UPDATE users SET username = ?, first_name = ?, last_name = ?, phone = ?, profile_link = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
          [userData.username, userData.first_name, userData.last_name, userData.phone, userData.profile_link, userData.photo_url, userData.id],
          function(err) {
            if (err) {
              console.error('❌ Error updating user:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ User updated:', userData.id);
            res.json({
              status: 'success',
              message: 'User updated',
              user_id: existingUser.id,
              internal_id: existingUser.id,
              timestamp: new Date().toISOString()
            });
          }
        );
      } else {
        // Create new user (will get AUTOINCREMENT ID)
        db.run(
          'INSERT INTO users (telegram_id, username, first_name, last_name, phone, profile_link, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [userData.id, userData.username, userData.first_name, userData.last_name, userData.phone, userData.profile_link, userData.photo_url],
          function(err) {
            if (err) {
              console.error('❌ Error creating user:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ User created:', userData.id, 'Internal ID:', this.lastID);
            res.json({
              status: 'success',
              message: 'User created',
              user_id: userData.id,
              internal_id: this.lastID,
              timestamp: new Date().toISOString()
            });
          }
        );
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // In production, fetch from database
    // For now, return mock data
    res.json({
      id: parseInt(userId),
      username: 'user_' + userId,
      first_name: 'User',
      last_name: 'Name',
      is_active: true,
      last_seen: new Date().toISOString(),
      source: 'website'
    });
    
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Log update (in production, update database)
    console.log('✅ User update received:', {
      user_id: userId,
      update_data: updateData,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: 'User updated',
      user_id: userId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistics API endpoints
app.post('/api/statistics', (req, res) => {
  try {
    const statsData = req.body;
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Log statistics (in production, save to database)
    console.log('✅ Statistics received from bot:', {
      total_users: statsData.total_users,
      active_users: statsData.active_users,
      today_users: statsData.today_users,
      source: statsData.source,
      timestamp: statsData.timestamp || new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: 'Statistics received',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error processing statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics', (req, res) => {
  try {
    // Return mock statistics (in production, fetch from database)
    res.json({
      total_users: 150,
      active_users: 120,
      today_users: 5,
      total_orders: 234,
      last_update: new Date().toISOString(),
      source: 'website'
    });
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users list endpoint
app.get('/api/users', (req, res) => {
  try {
    // Load users from database
    const db = require('../database/init');
    
    db.all('SELECT * FROM users ORDER BY id ASC', [], (err, rows) => {
      if (err) {
        console.error('❌ Error fetching users:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // If no users, return empty array
      if (!rows || rows.length === 0) {
        return res.json([]);
      }
      
      // Return real users from database
      const users = rows.map(user => ({
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        profile_link: user.profile_link,
        photo_url: user.photo_url,
        is_resident: user.is_resident || false,
        is_waiter: user.is_waiter || false,
        is_admin: user.is_admin || false,
        is_super_admin: user.is_super_admin || false,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      
      res.json(users);
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Events endpoint
app.get('/api/events', (req, res) => {
  try {
    res.json([
      { id: 1, title: 'DJ Night с Resident DJ', date: '2024-11-15T22:00:00Z', price: 800, is_active: 1 },
      { id: 2, title: 'Wine Tasting Evening', date: '2024-11-20T19:00:00Z', price: 1200, is_active: 1 },
      { id: 3, title: 'Караоке-вечеринка', date: '2024-11-25T20:00:00Z', price: 0, is_active: 1 }
    ]);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Drinks endpoint
app.get('/api/drinks', (req, res) => {
  try {
    res.json([
      { id: 1, name: 'Коктейль "Савос"', price: 450, category: 'Коктейли', is_available: 1 },
      { id: 2, name: 'Пиво "Клубное"', price: 200, category: 'Пиво', is_available: 1 },
      { id: 3, name: 'Вино красное', price: 350, category: 'Вино', is_available: 1 },
      { id: 4, name: 'Водка премиум', price: 500, category: 'Крепкие напитки', is_available: 1 },
      { id: 5, name: 'Кофе', price: 150, category: 'Горячие напитки', is_available: 1 }
    ]);
  } catch (error) {
    console.error('❌ Error fetching drinks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orders endpoint
app.get('/api/orders', (req, res) => {
  try {
    res.json([
      { id: 1, total_amount: 650, status: 'completed', created_at: '2024-10-25T18:30:00Z' },
      { id: 2, total_amount: 1200, status: 'new', created_at: '2024-10-25T19:15:00Z' },
      { id: 3, total_amount: 450, status: 'taken', created_at: '2024-10-26T20:00:00Z' }
    ]);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings API endpoints
app.get('/api/settings', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Return mock settings (in production, fetch from database)
    res.json({
      bot_name: 'SavosBot Club',
      welcome_message: 'Добро пожаловать в SavosBot Club!',
      website_url: process.env.WEBSITE_URL || 'https://savos-club-two.vercel.app',
      admin_panel_url: `${process.env.WEBSITE_URL || 'https://savos-club-two.vercel.app'}/admin-panel`,
      maintenance_mode: false,
      max_users: 1000,
      last_update: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const settingsData = req.body;
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Log settings update (in production, update database)
    console.log('✅ Settings update received:', {
      settings: settingsData,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: 'Settings updated',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  try {
    const webhookData = req.body;
    
    console.log('📡 Webhook received:', {
      data: webhookData,
      timestamp: new Date().toISOString()
    });
    
    res.json({ 
      status: 'OK', 
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;