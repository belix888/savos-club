const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Получение всех пользователей (только для админов)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение пользователя по ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Назначение статуса резидента
router.post('/:id/resident', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_resident } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_resident = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [is_resident ? 1 : 0, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ message: `Статус резидента ${is_resident ? 'назначен' : 'отозван'}` });
  } catch (error) {
    console.error('Ошибка изменения статуса резидента:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Назначение статуса официанта
router.post('/:id/waiter', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_waiter } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET is_waiter = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [is_waiter ? 1 : 0, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    // Если назначаем официанта, создаем запись о начале смены
    if (is_waiter) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO waiter_shifts (waiter_id, status) VALUES (?, ?)',
          [id, 'working'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    res.json({ message: `Статус официанта ${is_waiter ? 'назначен' : 'отозван'}` });
  } catch (error) {
    console.error('Ошибка изменения статуса официанта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение статистики пользователя
router.get('/:id/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Получаем количество заказов пользователя
    const orderCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Получаем общую сумму заказов
    const totalSpent = await new Promise((resolve, reject) => {
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE user_id = ? AND status = "completed"', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    // Если пользователь официант, получаем статистику работы
    let waiterStats = null;
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT is_waiter FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (user && user.is_waiter) {
      const waiterOrderCount = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM orders WHERE waiter_id = ?', [id], (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });

      waiterStats = {
        orders_served: waiterOrderCount
      };
    }

    res.json({
      order_count: orderCount,
      total_spent: totalSpent,
      waiter_stats: waiterStats
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
