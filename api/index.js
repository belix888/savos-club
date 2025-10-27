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

    // Mock user authentication for Vercel
    // In production, you should connect to your database
    const mockUser = {
      id: parseInt(telegram_id),
      telegram_id: telegram_id,
      username: username || 'user_' + telegram_id,
      first_name: first_name || 'User',
      last_name: last_name || '',
      is_resident: false,
      is_waiter: false,
      is_admin: false,
      is_super_admin: false,
      created_at: new Date().toISOString()
    };

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
    
    // Log user data (in production, save to database)
    console.log('✅ User data received from bot:', {
      id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      source: userData.source,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      status: 'success',
      message: 'User data received',
      user_id: userData.id,
      timestamp: new Date().toISOString()
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
    const authHeader = req.headers.authorization;
    
    // Check API key
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const apiKey = authHeader.substring(7);
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Return mock statistics (in production, fetch from database)
    res.json({
      total_users: 150,
      active_users: 120,
      today_users: 5,
      last_update: new Date().toISOString(),
      source: 'website'
    });
    
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
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