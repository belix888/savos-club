const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Получение всех напитков
router.get('/', async (req, res) => {
  try {
    const drinks = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM drinks WHERE is_available = 1 ORDER BY category, name', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(drinks);
  } catch (error) {
    console.error('Ошибка получения напитков:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение напитка по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const drink = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM drinks WHERE id = ? AND is_available = 1', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!drink) {
      return res.status(404).json({ error: 'Напиток не найден' });
    }

    res.json(drink);
  } catch (error) {
    console.error('Ошибка получения напитка:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание напитка (только для админов)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Название и цена обязательны' });
    }

    const drinkId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO drinks (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, category, image_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ 
      message: 'Напиток добавлен успешно',
      drink_id: drinkId 
    });
  } catch (error) {
    console.error('Ошибка создания напитка:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление напитка (только для админов)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, is_available } = req.body;

    const changes = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE drinks SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, description, price, category, image_url, is_available !== undefined ? is_available : 1, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Напиток не найден' });
    }

    res.json({ message: 'Напиток обновлен успешно' });
  } catch (error) {
    console.error('Ошибка обновления напитка:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление напитка (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const changes = await new Promise((resolve, reject) => {
      db.run('UPDATE drinks SET is_available = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Напиток не найден' });
    }

    res.json({ message: 'Напиток удален успешно' });
  } catch (error) {
    console.error('Ошибка удаления напитка:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение напитков по категории
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const drinks = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM drinks WHERE category = ? AND is_available = 1 ORDER BY name', [category], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(drinks);
  } catch (error) {
    console.error('Ошибка получения напитков по категории:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
