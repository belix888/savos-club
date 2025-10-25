const express = require('express');
const { authenticateToken, requireAdmin } = require('./auth');
const db = require('../../database/init');

const router = express.Router();

// Получение всех активных конкурсов
router.get('/', async (req, res) => {
  try {
    const contests = await new Promise((resolve, reject) => {
      db.all(`
        SELECT c.*, 
               COUNT(cp.id) as participants_count
        FROM contests c
        LEFT JOIN contest_participants cp ON c.id = cp.contest_id
        WHERE c.is_active = 1 AND c.end_date > datetime('now')
        GROUP BY c.id
        ORDER BY c.start_date ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(contests);
  } catch (error) {
    console.error('Ошибка получения конкурсов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение конкурса по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const contest = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM contests WHERE id = ? AND is_active = 1', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    res.json(contest);
  } catch (error) {
    console.error('Ошибка получения конкурса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Участие в конкурсе
router.post('/:id/participate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { submission } = req.body;

    if (!submission) {
      return res.status(400).json({ error: 'Заявка на участие обязательна' });
    }

    // Проверяем, что конкурс активен
    const contest = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM contests WHERE id = ? AND is_active = 1 AND end_date > datetime("now")', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!contest) {
      return res.status(400).json({ error: 'Конкурс не активен или завершен' });
    }

    // Проверяем, не участвует ли уже пользователь
    const existingParticipation = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM contest_participants WHERE contest_id = ? AND user_id = ?', [id, req.user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingParticipation) {
      return res.status(400).json({ error: 'Вы уже участвуете в этом конкурсе' });
    }

    // Добавляем участника
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO contest_participants (contest_id, user_id, submission) VALUES (?, ?, ?)',
        [id, req.user.id, submission],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ message: 'Вы успешно подали заявку на участие в конкурсе!' });
  } catch (error) {
    console.error('Ошибка участия в конкурсе:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение участников конкурса
router.get('/:id/participants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const participants = await new Promise((resolve, reject) => {
      db.all(`
        SELECT cp.*, u.first_name, u.last_name, u.username
        FROM contest_participants cp
        LEFT JOIN users u ON cp.user_id = u.id
        WHERE cp.contest_id = ?
        ORDER BY cp.created_at ASC
      `, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(participants);
  } catch (error) {
    console.error('Ошибка получения участников:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание конкурса (только для админов)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, start_date, end_date, prize, image_url } = req.body;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ error: 'Название, дата начала и окончания обязательны' });
    }

    const contestId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO contests (title, description, start_date, end_date, prize, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [title, description, start_date, end_date, prize, image_url],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.status(201).json({ 
      message: 'Конкурс создан успешно',
      contest_id: contestId 
    });
  } catch (error) {
    console.error('Ошибка создания конкурса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновление конкурса (только для админов)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, prize, image_url, is_active } = req.body;

    const changes = await new Promise((resolve, reject) => {
      db.run(
        'UPDATE contests SET title = ?, description = ?, start_date = ?, end_date = ?, prize = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, description, start_date, end_date, prize, image_url, is_active !== undefined ? is_active : 1, id],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    res.json({ message: 'Конкурс обновлен успешно' });
  } catch (error) {
    console.error('Ошибка обновления конкурса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление конкурса (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const changes = await new Promise((resolve, reject) => {
      db.run('UPDATE contests SET is_active = 0 WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });

    if (changes === 0) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    res.json({ message: 'Конкурс удален успешно' });
  } catch (error) {
    console.error('Ошибка удаления конкурса:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
