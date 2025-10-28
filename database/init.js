const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'club.db');
const db = new sqlite3.Database(dbPath);

// Создание таблиц
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      phone TEXT,
      profile_link TEXT,
      photo_url TEXT,
      email TEXT,
      is_resident BOOLEAN DEFAULT 0,
      is_waiter BOOLEAN DEFAULT 0,
      is_admin BOOLEAN DEFAULT 0,
      is_super_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Миграции для существующей таблицы users: добавляем недостающие столбцы
  // Примечание: SQLite не поддерживает IF NOT EXISTS для столбцов, поэтому игнорируем ошибку, если столбец уже существует
  db.run('ALTER TABLE users ADD COLUMN profile_link TEXT', (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('Migration: profile_link add column warning:', err.message);
    }
  });
  db.run('ALTER TABLE users ADD COLUMN photo_url TEXT', (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('Migration: photo_url add column warning:', err.message);
    }
  });

  // Таблица мероприятий (афиша)
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date DATETIME NOT NULL,
      price DECIMAL(10,2),
      image_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица напитков (бар)
  db.run(`
    CREATE TABLE IF NOT EXISTS drinks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category TEXT,
      image_url TEXT,
      is_available BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица заказов
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      waiter_id INTEGER,
      status TEXT DEFAULT 'new',
      total_amount DECIMAL(10,2) NOT NULL,
      confirmation_code TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (waiter_id) REFERENCES users (id)
    )
  `);

  // Таблица позиций заказа
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      drink_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (drink_id) REFERENCES drinks (id)
    )
  `);

  // Таблица конкурсов
  db.run(`
    CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      prize TEXT,
      image_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица участников конкурсов
  db.run(`
    CREATE TABLE IF NOT EXISTS contest_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contest_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      submission TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (contest_id) REFERENCES contests (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Таблица смен официантов
  db.run(`
    CREATE TABLE IF NOT EXISTS waiter_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waiter_id INTEGER NOT NULL,
      status TEXT DEFAULT 'working',
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      FOREIGN KEY (waiter_id) REFERENCES users (id)
    )
  `);

  // Таблица настроек системы
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Вставка начальных данных
  db.run(`
    INSERT OR IGNORE INTO settings (key, value, description) VALUES 
    ('club_name', 'SavosBot Club', 'Название клуба'),
    ('welcome_message', 'Добро пожаловать в SavosBot Club!', 'Приветственное сообщение'),
    ('resident_benefits', 'Скидки на напитки, приоритетный доступ к мероприятиям', 'Преимущества резидентов'),
    ('blocked_message', 'Скоро вы узнаете, что будет', 'Сообщение о блокировке разделов'),
    ('bar_enabled', '1', 'Доступность раздела Бар'),
    ('events_enabled', '1', 'Доступность раздела Афиша'),
    ('contests_enabled', '1', 'Доступность раздела Конкурсы'),
    ('maintenance_mode', '0', 'Режим технического обслуживания'),
    ('max_order_amount', '10000', 'Максимальная сумма заказа'),
    ('waiter_notification_enabled', '1', 'Уведомления для официантов')
  `);

  // Добавляем тестовые напитки
  db.run(`
    INSERT OR IGNORE INTO drinks (name, description, price, category) VALUES 
    ('Коктейль "Савос"', 'Фирменный коктейль клуба', 450.00, 'Коктейли'),
    ('Пиво "Клубное"', 'Разливное пиво', 200.00, 'Пиво'),
    ('Вино красное', 'Домашнее вино', 350.00, 'Вино'),
    ('Водка премиум', 'Премиальная водка', 500.00, 'Крепкие напитки'),
    ('Кофе', 'Свежесваренный кофе', 150.00, 'Горячие напитки')
  `);

  console.log('База данных инициализирована успешно!');
});

module.exports = db;
