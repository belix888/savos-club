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

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../register.html'));
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
    
    // Try to get user from database by telegram_id
    let user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    // If not found by telegram_id, try to find by username (user registered via website)
    if (!user && username) {
      user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
      
      // If found by username, link telegram_id
      if (user && !user.telegram_id) {
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE users SET telegram_id = ?, first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
            [telegram_id, first_name, last_name || null, username],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        // Reload user data
        user = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      }
    }
    
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
      // Return 404 with registration flag
      return res.status(404).json({ 
        error: 'User not registered',
        message: 'Please register first',
        needs_registration: true,
        telegram_data: {
          telegram_id: telegram_id,
          username: username,
          first_name: first_name,
          last_name: last_name
        }
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

// Public registration endpoint (no API key required)
app.post('/api/register', (req, res) => {
  try {
    const { username, first_name, last_name, phone } = req.body;
    
    // Validate required fields
    if (!username || !first_name || !phone) {
      return res.status(400).json({ error: 'Username, имя и телефон обязательны для заполнения' });
    }
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{5,32}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username должен содержать только буквы, цифры и подчеркивание (5-32 символа)' });
    }
    
    // Validate phone format
    const phoneRegex = /^\+?7\d{10}$/;
    let normalizedPhone = phone.replace(/[\s\-()]/g, '');
    if (normalizedPhone.startsWith('8')) {
      normalizedPhone = '+7' + normalizedPhone.substring(1);
    }
    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Номер телефона должен быть в формате +79991234567 или 89991234567' });
    }
    
    // Connect to database
    const db = require('../database/init');
    
    // Check if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, existingUser) => {
      if (err) {
        console.error('❌ Error checking username:', err);
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      
      if (existingUser) {
        return res.status(409).json({ error: 'Пользователь с таким Telegram username уже зарегистрирован' });
      }
      
      // Check if phone already exists
      db.get('SELECT * FROM users WHERE phone = ?', [normalizedPhone], (err, existingPhone) => {
        if (err) {
          console.error('❌ Error checking phone:', err);
          return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        
        if (existingPhone) {
          return res.status(409).json({ error: 'Пользователь с таким номером телефона уже зарегистрирован' });
        }
        
        // Create new user (without telegram_id for website registration)
        db.run(
          'INSERT INTO users (username, first_name, last_name, phone, profile_link) VALUES (?, ?, ?, ?, ?)',
          [
            username, 
            first_name, 
            last_name || null, 
            normalizedPhone,
            `https://t.me/${username}` // Create profile link from username
          ],
          function(err) {
            if (err) {
              console.error('❌ Error creating user:', err);
              // Check if it's a unique constraint violation
              if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Пользователь с такими данными уже существует' });
              }
              return res.status(500).json({ error: 'Ошибка при создании пользователя' });
            }
            
            console.log('✅ User registered via website:', username, 'Internal ID:', this.lastID);
            res.json({
              status: 'success',
              message: 'Регистрация успешна! Теперь вы можете войти в систему.',
              user_id: this.lastID,
              internal_id: this.lastID,
              username: username,
              timestamp: new Date().toISOString()
            });
          }
        );
      });
    });
    
  } catch (error) {
    console.error('❌ Error processing registration:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Public login endpoint (username + phone) – independent from Telegram
app.post('/api/login', (req, res) => {
  try {
    let { username, phone } = req.body || {};
    if (!username) {
      return res.status(400).json({ error: 'Укажите Telegram username' });
    }

    // Нормализуем телефон (если передан): допускаем +7XXXXXXXXXX или 8XXXXXXXXXX
    const normalizePhone = (p) => {
      if (!p) return null;
      let n = String(p).replace(/[\s\-()]/g, '');
      if (n.startsWith('8') && n.length === 11) n = '+7' + n.substring(1);
      if (n.startsWith('+7') && n.length === 12) return n;
      // Пробуем также если длина 10 (без +7 или 8)
      if (n.length === 10 && /^\d+$/.test(n)) return '+7' + n;
      return null;
    };
    const normalizedPhone = normalizePhone(phone);

    // Trim username
    username = String(username || '').trim();

    const db = require('../database/init');
    // Username — без учета регистра
    console.log('🔍 Login attempt:', { username, phone, normalizedPhone });
    db.get('SELECT * FROM users WHERE LOWER(username) = LOWER(?)', [username], (err, user) => {
      if (err) {
        console.error('❌ Error during login:', err);
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }
      if (!user) {
        console.log('⚠️ User not found for username:', username);
        return res.status(401).json({ error: 'Пользователь не найден. Зарегистрируйтесь.' });
      }
      console.log('✅ User found:', { id: user.id, username: user.username, phone: user.phone });

      const userPhone = user.phone;
      const ok = (() => {
        // Если телефона в БД нет — пускаем по одному username (можно без телефона или с любым валидным)
        if (!userPhone) {
          console.log('✅ No phone in DB, allowing login by username');
          return true;
        }
        // Если в БД есть телефон — он должен совпасть с нормализованным введенным
        if (normalizedPhone) {
          const dbNorm = normalizePhone(userPhone);
          const match = dbNorm === normalizedPhone;
          console.log('🔍 Phone check:', { userPhone, dbNorm, normalizedPhone, match });
          return match;
        }
        // Если в БД есть телефон, а введенного нет — не пускаем
        console.log('⚠️ Phone required in DB but not provided');
        return false;
      })();

      if (!ok) {
        console.log('❌ Login failed: phone mismatch or missing');
        return res.status(401).json({ error: 'Неверные данные для входа' });
      }
      console.log('✅ Login successful for user:', user.id);

      const bindPhoneIfMissing = () => new Promise((resolve) => {
        if (!userPhone && normalizedPhone) {
          db.run('UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [normalizedPhone, user.id], function () {
            resolve();
          });
        } else {
          resolve();
        }
      });

      bindPhoneIfMissing().then(() => {
        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            is_admin: !!user.is_admin,
            is_super_admin: !!user.is_super_admin
          },
          process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024',
          { expiresIn: '7d' }
        );

        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: normalizedPhone || user.phone || null
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Error processing login:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Session check endpoint: returns current user by JWT
app.get('/api/session', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    if (!auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }
    const token = auth.substring(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'savosbot_club_super_secret_jwt_key_2024');
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const db = require('../database/init');
    db.get('SELECT * FROM users WHERE id = ?', [payload.id], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          is_admin: !!user.is_admin,
          is_super_admin: !!user.is_super_admin
        }
      });
    });
  } catch (error) {
    console.error('❌ Error checking session:', error);
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
    
    // Check if user exists by telegram_id
    db.get('SELECT * FROM users WHERE telegram_id = ?', [userData.id], (err, existingUserByTelegramId) => {
      if (err) {
        console.error('❌ Error checking user:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingUserByTelegramId) {
        // Update existing user by telegram_id
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
              user_id: existingUserByTelegramId.id,
              internal_id: existingUserByTelegramId.id,
              timestamp: new Date().toISOString()
            });
          }
        );
      } else if (userData.username) {
        // Check if user exists by username (registered via website)
        db.get('SELECT * FROM users WHERE username = ?', [userData.username], (err, existingUserByUsername) => {
          if (err) {
            console.error('❌ Error checking user by username:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          if (existingUserByUsername) {
            // User registered via website - link Telegram account
            console.log('🔗 Linking Telegram account to existing website user:', userData.username);
            db.run(
              'UPDATE users SET telegram_id = ?, first_name = ?, last_name = ?, phone = COALESCE(?, phone), profile_link = COALESCE(?, profile_link), photo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
              [userData.id, userData.first_name, userData.last_name, userData.phone, userData.profile_link, userData.photo_url, userData.username],
              function(err) {
                if (err) {
                  console.error('❌ Error linking Telegram account:', err);
                  return res.status(500).json({ error: 'Database error' });
                }
                console.log('✅ Telegram account linked to user:', existingUserByUsername.id);
                res.json({
                  status: 'success',
                  message: 'Telegram account linked to existing user',
                  user_id: existingUserByUsername.id,
                  internal_id: existingUserByUsername.id,
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
      } else {
        // No telegram_id match and no username - create new user
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
    const db = require('../database/init');

    const queries = {
      total_users: 'SELECT COUNT(*) as c FROM users',
      active_users: "SELECT COUNT(*) as c FROM users WHERE is_resident = 1 OR is_waiter = 1 OR is_admin = 1 OR is_super_admin = 1",
      today_users: "SELECT COUNT(*) as c FROM users WHERE DATE(created_at) = DATE('now')",
      total_orders: 'SELECT COUNT(*) as c FROM orders'
    };

    const result = {};

    db.get(queries.total_users, [], (e1, r1) => {
      result.total_users = r1 ? r1.c : 0;
      db.get(queries.active_users, [], (e2, r2) => {
        result.active_users = r2 ? r2.c : 0;
        db.get(queries.today_users, [], (e3, r3) => {
          result.today_users = r3 ? r3.c : 0;
          db.get(queries.total_orders, [], (e4, r4) => {
            result.total_orders = r4 ? r4.c : 0;
            res.json({
              ...result,
              last_update: new Date().toISOString(),
              source: 'database'
            });
          });
        });
      });
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

// Sync bot users endpoint - accepts JSON array of users from bot
app.post('/api/sync-bot-users', (req, res) => {
  try {
    const users = req.body.users || req.body; // Accept both {users: [...]} and [...]
    const usersArray = Array.isArray(users) ? users : [users];
    
    if (!usersArray || usersArray.length === 0) {
      return res.status(400).json({ error: 'No users provided' });
    }
    
    const db = require('../database/init');
    let synced = 0;
    let updated = 0;
    let errors = 0;
    
    const syncPromises = usersArray.map(user => {
      return new Promise((resolve) => {
        // Check if user exists by telegram_id
        db.get('SELECT * FROM users WHERE telegram_id = ?', [user.id || user.telegram_id], (err, existing) => {
          if (err) {
            console.error('❌ Error checking user:', err);
            errors++;
            resolve();
            return;
          }
          
          if (existing) {
            // Update existing user
            db.run(
              'UPDATE users SET username = ?, first_name = ?, last_name = ?, phone = COALESCE(?, phone), profile_link = COALESCE(?, profile_link), photo_url = COALESCE(?, photo_url), updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
              [
                user.username || existing.username,
                user.first_name || existing.first_name,
                user.last_name || existing.last_name || null,
                user.phone || null,
                user.profile_link || existing.profile_link || null,
                user.photo_url || existing.photo_url || null,
                user.id || user.telegram_id
              ],
              function(updateErr) {
                if (updateErr) {
                  console.error('❌ Error updating user:', updateErr);
                  errors++;
                } else {
                  updated++;
                  console.log(`✅ User updated: ${user.id || user.telegram_id}`);
                }
                resolve();
              }
            );
          } else {
            // Create new user
            db.run(
              'INSERT INTO users (telegram_id, username, first_name, last_name, phone, profile_link, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                user.id || user.telegram_id,
                user.username || null,
                user.first_name || null,
                user.last_name || null,
                user.phone || null,
                user.profile_link || (user.username ? `https://t.me/${user.username}` : null),
                user.photo_url || null
              ],
              function(insertErr) {
                if (insertErr) {
                  console.error('❌ Error creating user:', insertErr);
                  errors++;
                } else {
                  synced++;
                  console.log(`✅ User created: ${user.id || user.telegram_id}, Internal ID: ${this.lastID}`);
                }
                resolve();
              }
            );
          }
        });
      });
    });
    
    Promise.all(syncPromises).then(() => {
      res.json({
        status: 'success',
        message: 'Users synchronized',
        synced: synced,
        updated: updated,
        errors: errors,
        total: usersArray.length,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Sync completed: ${synced} created, ${updated} updated, ${errors} errors`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing bot users:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Upload bot users JSON file endpoint
app.post('/api/upload-bot-users', (req, res) => {
  try {
    const usersData = req.body;
    
    // Handle both direct array and wrapped format
    let usersArray = [];
    if (Array.isArray(usersData)) {
      usersArray = usersData;
    } else if (usersData.users && Array.isArray(usersData.users)) {
      usersArray = usersData.users;
    } else if (usersData.data && Array.isArray(usersData.data)) {
      usersArray = usersData.data;
    } else {
      return res.status(400).json({ error: 'Invalid format. Expected array of users or {users: [...]}' });
    }
    
    if (usersArray.length === 0) {
      return res.status(400).json({ error: 'No users in data' });
    }
    
    // Forward to sync endpoint
    req.body.users = usersArray;
    // Use the sync-bot-users logic
    const db = require('../database/init');
    let synced = 0;
    let updated = 0;
    let errors = 0;
    
    const syncPromises = usersArray.map(user => {
      return new Promise((resolve) => {
        const telegramId = user.id || user.telegram_id;
        if (!telegramId) {
          errors++;
          resolve();
          return;
        }
        
        db.get('SELECT * FROM users WHERE telegram_id = ?', [telegramId], (err, existing) => {
          if (err) {
            console.error('❌ Error checking user:', err);
            errors++;
            resolve();
            return;
          }
          
          if (existing) {
            db.run(
              'UPDATE users SET username = ?, first_name = ?, last_name = ?, phone = COALESCE(?, phone), profile_link = COALESCE(?, profile_link), photo_url = COALESCE(?, photo_url), updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?',
              [
                user.username || existing.username,
                user.first_name || existing.first_name,
                user.last_name || existing.last_name || null,
                user.phone || null,
                user.profile_link || existing.profile_link || null,
                user.photo_url || existing.photo_url || null,
                telegramId
              ],
              function(updateErr) {
                if (updateErr) {
                  console.error('❌ Error updating user:', updateErr);
                  errors++;
                } else {
                  updated++;
                }
                resolve();
              }
            );
          } else {
            db.run(
              'INSERT INTO users (telegram_id, username, first_name, last_name, phone, profile_link, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                telegramId,
                user.username || null,
                user.first_name || null,
                user.last_name || null,
                user.phone || null,
                user.profile_link || (user.username ? `https://t.me/${user.username}` : null),
                user.photo_url || null
              ],
              function(insertErr) {
                if (insertErr) {
                  console.error('❌ Error creating user:', insertErr);
                  errors++;
                } else {
                  synced++;
                }
                resolve();
              }
            );
          }
        });
      });
    });
    
    Promise.all(syncPromises).then(() => {
      res.json({
        status: 'success',
        message: 'Users uploaded and synchronized',
        synced: synced,
        updated: updated,
        errors: errors,
        total: usersArray.length,
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('❌ Error uploading bot users:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Events endpoint
app.get('/api/events', (req, res) => {
  try {
    const db = require('../database/init');
    db.all('SELECT * FROM events ORDER BY date DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Single event
app.get('/api/events/:id', (req, res) => {
  try {
    const db = require('../database/init');
    db.get('SELECT * FROM events WHERE id = ?', [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    });
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const { title, description, date, price, image_url, ticket_url, is_active } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });
    const db = require('../database/init');
    db.run(
      'INSERT INTO events (title, description, date, price, image_url, ticket_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, date, price || 0, image_url || null, ticket_url || null, is_active ? 1 : 1],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, title, description, date, price, image_url, ticket_url, is_active: is_active ? 1 : 1 });
      }
    );
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, price, image_url, ticket_url, is_active } = req.body;
    const db = require('../database/init');
    db.run(
      'UPDATE events SET title = ?, description = ?, date = ?, price = ?, image_url = ?, ticket_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description || null, date, price || 0, image_url || null, ticket_url || null, is_active ? 1 : 0, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ status: 'success' });
      }
    );
  } catch (error) {
    console.error('❌ Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/init');
    db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ status: 'success' });
    });
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Drinks endpoint
app.get('/api/drinks', (req, res) => {
  try {
    const db = require('../database/init');
    db.all('SELECT * FROM drinks ORDER BY id DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error fetching drinks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/drinks', (req, res) => {
  try {
    const { name, description, price, category, image_url, is_available } = req.body;
    if (!name || price === undefined) return res.status(400).json({ error: 'Name and price are required' });
    const db = require('../database/init');
    db.run(
      'INSERT INTO drinks (name, description, price, category, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, price, category || null, image_url || null, is_available ? 1 : 1],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, name, description, price, category, image_url, is_available: is_available ? 1 : 1 });
      }
    );
  } catch (error) {
    console.error('❌ Error creating drink:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/drinks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;
    const db = require('../database/init');
    db.run(
      'UPDATE drinks SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || null, price, category || null, image_url || null, is_available ? 1 : 0, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ status: 'success' });
      }
    );
  } catch (error) {
    console.error('❌ Error updating drink:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/drinks/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/init');
    db.get('SELECT is_available FROM drinks WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!row) return res.status(404).json({ error: 'Not found' });
      const next = row.is_available ? 0 : 1;
      db.run('UPDATE drinks SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [next, id], function(e2){
        if (e2) return res.status(500).json({ error: 'Database error' });
        res.json({ status: 'success', is_available: next });
      });
    });
  } catch (error) {
    console.error('❌ Error toggling drink:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orders endpoint
app.get('/api/orders', (req, res) => {
  try {
    const db = require('../database/init');
    const sql = `
      SELECT o.*, 
        (
          SELECT json_group_array(json_object(
            'drink_id', oi.drink_id,
            'quantity', oi.quantity,
            'price', oi.price
          ))
          FROM order_items oi WHERE oi.order_id = o.id
        ) as items
      FROM orders o ORDER BY o.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      const orders = (rows || []).map(r => ({
        id: r.id,
        total_amount: r.total_amount,
        status: r.status,
        confirmation_code: r.confirmation_code,
        created_at: r.created_at,
        items: r.items ? JSON.parse(r.items) : []
      }));
      res.json(orders);
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contests endpoints
app.get('/api/contests', (req, res) => {
  try {
    const db = require('../database/init');
    db.all('SELECT * FROM contests ORDER BY start_date DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows || []);
    });
  } catch (error) {
    console.error('❌ Error fetching contests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contests', (req, res) => {
  try {
    const { title, description, start_date, end_date, prize, image_url, is_active, link } = req.body;
    if (!title || !start_date || !end_date) return res.status(400).json({ error: 'Title and dates are required' });
    const db = require('../database/init');
    db.run(
      'INSERT INTO contests (title, description, start_date, end_date, prize, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, start_date, end_date, prize || null, image_url || link || null, is_active ? 1 : 1],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ id: this.lastID, title, description, start_date, end_date, prize, image_url: image_url || link || null, is_active: is_active ? 1 : 1 });
      }
    );
  } catch (error) {
    console.error('❌ Error creating contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/contests/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, prize, image_url, is_active } = req.body;
    const db = require('../database/init');
    db.run(
      'UPDATE contests SET title = ?, description = ?, start_date = ?, end_date = ?, prize = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description || null, start_date, end_date, prize || null, image_url || null, is_active ? 1 : 0, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json({ status: 'success' });
      }
    );
  } catch (error) {
    console.error('❌ Error updating contest:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Waiters endpoints
app.get('/api/waiters', (req, res) => {
  try {
    const db = require('../database/init');
    const sql = `
      SELECT u.*, (
        SELECT ws.status FROM waiter_shifts ws 
        WHERE ws.waiter_id = u.id 
        ORDER BY ws.start_time DESC LIMIT 1
      ) as current_status,
      (
        SELECT ws.start_time FROM waiter_shifts ws 
        WHERE ws.waiter_id = u.id AND (ws.end_time IS NULL OR ws.status = 'working')
        ORDER BY ws.start_time DESC LIMIT 1
      ) as shift_start
      FROM users u WHERE u.is_waiter = 1 ORDER BY u.id ASC`;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      const result = (rows || []).map(r => ({
        id: r.id,
        username: r.username,
        first_name: r.first_name,
        last_name: r.last_name,
        phone: r.phone,
        photo_url: r.photo_url,
        is_waiter: !!r.is_waiter,
        status: r.current_status || 'off',
        shift_start: r.shift_start || null
      }));
      res.json(result);
    });
  } catch (error) {
    console.error('❌ Error fetching waiters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/waiters/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/init');
    db.get('SELECT * FROM users WHERE id = ? AND is_waiter = 1', [id], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(404).json({ error: 'Not found' });
      db.all('SELECT * FROM waiter_shifts WHERE waiter_id = ? ORDER BY start_time DESC LIMIT 20', [id], (e2, shifts) => {
        if (e2) return res.status(500).json({ error: 'Database error' });
        res.json({ user, shifts: shifts || [] });
      });
    });
  } catch (error) {
    console.error('❌ Error fetching waiter details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/waiters/:id/start-shift', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/init');
    db.run('INSERT INTO waiter_shifts (waiter_id, status) VALUES (?, ?)', [id, 'working'], function(err){
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ status: 'success', shift_id: this.lastID });
    });
  } catch (error) {
    console.error('❌ Error starting shift:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/waiters/:id/end-shift', (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/init');
    db.run("UPDATE waiter_shifts SET status = 'off', end_time = CURRENT_TIMESTAMP WHERE waiter_id = ? AND (end_time IS NULL OR status = 'working')", [id], function(err){
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ status: 'success' });
    });
  } catch (error) {
    console.error('❌ Error ending shift:', error);
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
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body || {};
    console.log('📡 Webhook received:', { timestamp: new Date().toISOString() });

    // Минимальная обработка /start
    const token = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || process.env.TG_BOT_TOKEN;
    if (token && update.message && update.message.text) {
      const text = String(update.message.text || '').trim();
      const chatId = update.message.chat && update.message.chat.id;
      if (text === '/start' && chatId) {
        const replyMarkup = {
          inline_keyboard: [[{
            text: '📱 Открыть мини‑приложение',
            web_app: { url: `${process.env.WEBSITE_URL || 'https://savos-club-two.vercel.app'}/mini-app` }
          }]]
        };
        try {
          await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '👋 Добро пожаловать в SavosBot Club!'
                + '\n\nНажмите кнопку ниже, чтобы открыть мини‑приложение.',
              reply_markup: replyMarkup
            })
          });
        } catch (e) {
          console.error('❌ Error sending Telegram message:', e);
        }
      }
    }

    res.json({ status: 'OK' });
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