const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, requireAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Создание заказа
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // [{ drink_id, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Заказ не может быть пустым' });
    }

    // Проверяем доступность напитков и рассчитываем общую сумму
    let totalAmount = 0;
    for (const item of items) {
      const drink = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM drinks WHERE id = ? AND is_available = 1', [item.drink_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!drink) {
        return res.status(400).json({ error: `Напиток с ID ${item.drink_id} недоступен` });
      }

      totalAmount += drink.price * item.quantity;
    }

    // Создаем заказ
    const orderId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [req.user.id, totalAmount, 'new'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Добавляем позиции заказа
    for (const item of items) {
      const drink = await new Promise((resolve, reject) => {
        db.get('SELECT price FROM drinks WHERE id = ?', [item.drink_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO order_items (order_id, drink_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.drink_id, item.quantity, drink.price],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.status(201).json({ 
      message: 'Заказ создан успешно',
      order_id: orderId,
      total_amount: totalAmount
    });
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение заказов пользователя
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, 
               GROUP_CONCAT(d.name || ' x' || oi.quantity) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN drinks d ON oi.drink_id = d.id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [req.user.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение всех заказов (только для админов)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, 
               u.first_name, u.last_name, u.username,
               w.first_name as waiter_first_name, w.last_name as waiter_last_name,
               GROUP_CONCAT(d.name || ' x' || oi.quantity) as items
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users w ON o.waiter_id = w.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN drinks d ON oi.drink_id = d.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения всех заказов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение заказа по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await new Promise((resolve, reject) => {
      db.get(`
        SELECT o.*, 
               u.first_name, u.last_name, u.username,
               w.first_name as waiter_first_name, w.last_name as waiter_last_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users w ON o.waiter_id = w.id
        WHERE o.id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Проверяем права доступа
    if (!req.user.is_admin && !req.user.is_super_admin && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    // Получаем позиции заказа
    const items = await new Promise((resolve, reject) => {
      db.all(`
        SELECT oi.*, d.name, d.description
        FROM order_items oi
        LEFT JOIN drinks d ON oi.drink_id = d.id
        WHERE oi.order_id = ?
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({ ...order, items });
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Взять заказ (для официантов)
router.post('/:id/take', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user.is_waiter) {
      return res.status(403).json({ error: 'Только официанты могут брать заказы' });
    }

    const changes = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET waiter_id = ?, status = "taken", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "new"',
        [req.user.id, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(400).json({ error: 'Заказ не найден или уже взят' });
    }

    res.json({ message: 'Заказ взят в работу' });
  } catch (error) {
    console.error('Ошибка взятия заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Завершить заказ (для официантов)
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmation_code } = req.body;

    if (!req.user.is_waiter) {
      return res.status(403).json({ error: 'Только официанты могут завершать заказы' });
    }

    if (!confirmation_code) {
      return res.status(400).json({ error: 'Код подтверждения обязателен' });
    }

    // Проверяем, что заказ взят этим официантом
    const order = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ? AND waiter_id = ? AND status = "taken"', [id, req.user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!order) {
      return res.status(400).json({ error: 'Заказ не найден или не взят вами' });
    }

    // Генерируем код подтверждения и завершаем заказ
    const code = uuidv4().substring(0, 6).toUpperCase();
    
    const changes = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET status = "completed", confirmation_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [code, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    res.json({ 
      message: 'Заказ завершен успешно',
      confirmation_code: code
    });
  } catch (error) {
    console.error('Ошибка завершения заказа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение активных заказов официанта
router.get('/waiter/active', authenticateToken, async (req, res) => {
  try {
    if (!req.user.is_waiter) {
      return res.status(403).json({ error: 'Только официанты могут просматривать свои заказы' });
    }

    const orders = await new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, 
               u.first_name, u.last_name, u.username,
               GROUP_CONCAT(d.name || ' x' || oi.quantity) as items
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN drinks d ON oi.drink_id = d.id
        WHERE o.waiter_id = ? AND o.status IN ('taken', 'new')
        GROUP BY o.id
        ORDER BY o.created_at ASC
      `, [req.user.id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка получения активных заказов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
