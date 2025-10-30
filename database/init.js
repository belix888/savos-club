const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Для Vercel и других serverless окружений используем /tmp
// Проверяем, доступна ли запись в текущую директорию
function getDbPath() {
  // Проверяем, находимся ли мы на Vercel или подобной платформе
  if (process.env.VERCEL || process.env.NOW || process.env.LAMBDA_TASK_ROOT) {
    const tmpPath = path.join(os.tmpdir(), 'club.db');
    console.log(`📂 Using temporary directory for database: ${tmpPath}`);
    return tmpPath;
  }
  
  // Проверяем доступность записи в текущую директорию
  const defaultPath = path.join(__dirname, 'club.db');
  try {
    // Пробуем создать тестовый файл
    const testFile = path.join(__dirname, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return defaultPath;
  } catch (error) {
    // Если не можем писать в текущую директорию, используем /tmp
    const tmpPath = path.join(os.tmpdir(), 'club.db');
    console.log(`⚠️ Cannot write to ${__dirname}, using temporary directory: ${tmpPath}`);
    console.log(`   Error: ${error.message}`);
    return tmpPath;
  }
}

const dbPath = getDbPath();

// Создаем базу данных с режимом открытия, который поддерживает WAL mode для лучшей производительности
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    throw err;
  }
  console.log(`✅ Database opened at: ${dbPath}`);
  
  // Включаем WAL mode для лучшей производительности и поддержки конкурентного доступа
  db.run('PRAGMA journal_mode = WAL;', (err) => {
    if (err) {
      console.warn('⚠️ Could not enable WAL mode:', err);
    } else {
      console.log('✅ WAL mode enabled');
    }
  });
  
  // Включаем foreign keys
  db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
      console.warn('⚠️ Could not enable foreign keys:', err);
    }
  });
});

// Создание таблиц
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id INTEGER UNIQUE,
      username TEXT UNIQUE,
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
  
  // Миграция: создаем уникальный индекс для username
  // SQLite не поддерживает изменение UNIQUE напрямую для существующих таблиц,
  // поэтому создаем уникальный индекс
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_username_unique ON users(username) WHERE username IS NOT NULL', (err) => {
    if (err && !String(err.message).includes('duplicate') && !String(err.message).includes('already exists')) {
      console.warn('Migration: username unique index warning:', err.message);
    }
  });

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
      ticket_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Миграция: добавляем ticket_url при необходимости
  db.run('ALTER TABLE events ADD COLUMN ticket_url TEXT', (err) => {
    if (err && !String(err.message).includes('duplicate column name')) {
      console.warn('Migration: ticket_url add column warning:', err.message);
    }
  });

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

  // Таблица бронирований мероприятий
  db.run(`
    CREATE TABLE IF NOT EXISTS event_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      status TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events (id),
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
