const express = require('express');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Получение статистики системы
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Общее количество пользователей
    const totalUsers = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Количество резидентов
    const residents = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE is_resident = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Количество официантов
    const waiters = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users WHERE is_waiter = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Общее количество заказов
    const totalOrders = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Общая выручка
    const totalRevenue = await new Promise((resolve, reject) => {
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"', (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      });
    });

    // Активные заказы
    const activeOrders = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders WHERE status IN ("new", "taken")', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Количество мероприятий
    const totalEvents = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM events WHERE is_active = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Количество конкурсов
    const totalContests = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM contests WHERE is_active = 1', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    res.json({
      users: {
        total: totalUsers,
        residents: residents,
        waiters: waiters
      },
      orders: {
        total: totalOrders,
        active: activeOrders,
        revenue: totalRevenue
      },
      content: {
        events: totalEvents,
        contests: totalContests
      }
    });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение настроек системы
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM settings', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description
      };
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление настроек системы
router.put('/settings', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
          [value, key],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({ message: 'Настройки обновлены успешно' });
  } catch (error) {
    console.error('Ошибка обновления настроек:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Управление сменами официантов
router.get('/waiter-shifts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const shifts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT ws.*, u.first_name, u.last_name, u.username
        FROM waiter_shifts ws
        LEFT JOIN users u ON ws.waiter_id = u.id
        ORDER BY ws.start_time DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(shifts);
  } catch (error) {
    console.error('Ошибка получения смен:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Завершение смены официанта
router.post('/waiter-shifts/:id/end', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что это смена текущего пользователя
    const shift = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM waiter_shifts WHERE id = ? AND waiter_id = ? AND status = "working"', [id, req.user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!shift) {
      return res.status(400).json({ error: 'Смена не найдена или уже завершена' });
    }

    // Проверяем, есть ли активные заказы
    const activeOrders = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM orders WHERE waiter_id = ? AND status IN ("new", "taken")', [req.user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    if (activeOrders > 0) {
      return res.status(400).json({ error: 'Нельзя завершить смену с активными заказами' });
    }

    // Завершаем смену
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE waiter_shifts SET status = "ended", end_time = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: 'Смена завершена успешно' });
  } catch (error) {
    console.error('Ошибка завершения смены:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение логов системы
router.get('/logs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Здесь можно добавить логирование действий
    res.json({ message: 'Система логирования будет реализована' });
  } catch (error) {
    console.error('Ошибка получения логов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Резервное копирование данных
router.post('/backup', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Здесь можно добавить функционал резервного копирования
    res.json({ message: 'Система резервного копирования будет реализована' });
  } catch (error) {
    console.error('Ошибка резервного копирования:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
