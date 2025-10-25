const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Получение всех мероприятий
router.get('/', async (req, res) => {
  try {
    const events = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM events WHERE is_active = 1 ORDER BY date ASC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(events);
  } catch (error) {
    console.error('Ошибка получения мероприятий:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение мероприятия по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM events WHERE id = ? AND is_active = 1', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!event) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.json(event);
  } catch (error) {
    console.error('Ошибка получения мероприятия:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание мероприятия (только для админов)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, price, image_url } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Название и дата обязательны' });
    }

    const eventId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO events (title, description, date, price, image_url) VALUES (?, ?, ?, ?, ?)',
        [title, description, date, price || 0, image_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ 
      message: 'Мероприятие создано успешно',
      event_id: eventId 
    });
  } catch (error) {
    console.error('Ошибка создания мероприятия:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление мероприятия (только для админов)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, price, image_url, is_active } = req.body;

    const changes = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE events SET title = ?, description = ?, date = ?, price = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, date, price, image_url, is_active !== undefined ? is_active : 1, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.json({ message: 'Мероприятие обновлено успешно' });
  } catch (error) {
    console.error('Ошибка обновления мероприятия:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление мероприятия (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const changes = await new Promise((resolve, reject) => {
      db.run('UPDATE events SET is_active = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Мероприятие не найдено' });
    }

    res.json({ message: 'Мероприятие удалено успешно' });
  } catch (error) {
    console.error('Ошибка удаления мероприятия:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
