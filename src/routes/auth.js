const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../../database/init');

const router = express.Router();

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки прав администратора
const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin && !req.user.is_super_admin) {
    return res.status(403).json({ error: 'Недостаточно прав доступа' });
  }
  next();
};

// Middleware для проверки прав супер-администратора
const requireSuperAdmin = (req, res, next) => {
  if (!req.user.is_super_admin) {
    return res.status(403).json({ error: 'Недостаточно прав доступа' });
  }
  next();
};

// Авторизация через Telegram
router.post('/telegram', async (req, res) => {
  try {
    const { telegram_id, username, first_name, last_name } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'Telegram ID обязателен' });
    }

    // Проверяем или создаем пользователя
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE telegram_id = ?', [telegram_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      // Создаем нового пользователя
      const newUser = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
          [telegram_id, username, first_name, last_name],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, telegram_id, username, first_name, last_name });
          }
        );
      });

      const token = jwt.sign(
        { 
          id: newUser.id, 
          telegram_id: newUser.telegram_id,
          is_admin: false,
          is_super_admin: false,
          is_waiter: false,
          is_resident: false
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: newUser.id,
          telegram_id: newUser.telegram_id,
          username: newUser.username,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          is_resident: false,
          is_waiter: false,
          is_admin: false,
          is_super_admin: false
        }
      });
    }

    // Генерируем токен для существующего пользователя
    const token = jwt.sign(
      { 
        id: user.id, 
        telegram_id: user.telegram_id,
        is_admin: user.is_admin,
        is_super_admin: user.is_super_admin,
        is_waiter: user.is_waiter,
        is_resident: user.is_resident
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        email: user.email,
        is_resident: user.is_resident,
        is_waiter: user.is_waiter,
        is_admin: user.is_admin,
        is_super_admin: user.is_super_admin,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение информации о текущем пользователе
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      email: user.email,
      is_resident: user.is_resident,
      is_waiter: user.is_waiter,
      is_admin: user.is_admin,
      is_super_admin: user.is_super_admin,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление профиля пользователя
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { phone, email } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [phone, email, req.user.id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: 'Профиль успешно обновлен' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = { router, authenticateToken, requireAdmin, requireSuperAdmin };
