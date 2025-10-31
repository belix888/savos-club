const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

// Определяем, используем ли мы Turso или локальный SQLite
// Поддерживаем все варианты имен переменных:
// - TURSO_URL или TURSO_DATABASE_URL (стандартные)
// - turso_TURSO_URL или turso_TURSO_DATABASE_URL (с префиксом turso_)
const tursoUrl = process.env.TURSO_URL || 
                 process.env.TURSO_DATABASE_URL || 
                 process.env.turso_TURSO_URL || 
                 process.env.turso_TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN || 
                   process.env.turso_TURSO_AUTH_TOKEN;
const isTurso = tursoUrl && tursoToken;
let db;

if (isTurso) {
  // Используем Turso (libSQL)
  const { createClient } = require('@libsql/client');
  
  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });
  
  console.log('✅ Using Turso database (libSQL)');
  
  // Создаем адаптер для совместимости с sqlite3 API
  // Turso возвращает rows как массив объектов, нужно конвертировать в формат sqlite3
  db = {
    run: (sql, params = [], callback) => {
      const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
      
      tursoClient.execute(sql, params || [])
        .then(async (result) => {
          let lastID = 0;
          let changes = result.rowsAffected || 0;
          
          // Для INSERT запросов получаем lastID
          if (isInsert && changes > 0) {
            try {
              // В Turso/libSQL используем last_insert_rowid() сразу после INSERT
              const idResult = await tursoClient.execute('SELECT last_insert_rowid() as id');
              if (idResult.rows && idResult.rows.length > 0 && idResult.rows[0].id) {
                lastID = Number(idResult.rows[0].id) || 0;
              }
            } catch (e) {
              // Если не получилось, пытаемся получить через changes
              console.warn('⚠️ Could not get last_insert_rowid, trying alternative method');
              // В некоторых случаях Turso может вернуть lastID в результате
              if (result.lastInsertRowid !== undefined) {
                lastID = Number(result.lastInsertRowid) || 0;
              }
            }
          }
          
          if (callback) {
            // Создаем контекст, похожий на sqlite3 Statement
            const ctx = {
              lastID: lastID,
              changes: changes
            };
            // Вызываем callback с контекстом как this
            callback.call(ctx, null);
          }
        })
        .catch((err) => {
          if (callback) {
            const ctx = {
              lastID: 0,
              changes: 0
            };
            callback.call(ctx, err);
          } else {
            console.error('❌ Database error:', err);
          }
        });
    },
    get: (sql, params = [], callback) => {
      tursoClient.execute(sql, params || [])
        .then((result) => {
          if (result.rows && result.rows.length > 0) {
            // Конвертируем row object в формат, совместимый с sqlite3
            const row = result.rows[0];
            // Turso возвращает объекты с ключами как имена колонок
            if (callback) callback(null, row);
          } else {
            if (callback) callback(null, undefined);
          }
        })
        .catch((err) => {
          if (callback) callback(err);
          else console.error('❌ Database error:', err);
        });
    },
    all: (sql, params = [], callback) => {
      tursoClient.execute(sql, params || [])
        .then((result) => {
          // Turso возвращает rows как массив объектов
          if (callback) callback(null, result.rows || []);
        })
        .catch((err) => {
          if (callback) callback(err);
          else console.error('❌ Database error:', err);
        });
    },
    serialize: (callback) => {
      // Для Turso просто выполняем callback синхронно
      // Таблицы уже инициализированы в async функции initializeTablesTurso
      if (callback) {
        try {
          callback();
        } catch (err) {
          console.error('Error in serialize callback:', err);
        }
      }
    },
    close: (callback) => {
      // Для Turso не закрываем соединение явно - оно управляется автоматически
      // Turso клиент использует HTTP соединения, которые не требуют явного закрытия
      // Просто вызываем callback успешно
      if (callback) {
        try {
          callback(null);
        } catch (err) {
          console.warn('Error in close callback:', err);
        }
      }
    }
  };
  
  // Для Turso используем async/await для инициализации
  (async () => {
    try {
      await initializeTablesTurso(tursoClient);
      console.log('✅ Turso database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Turso database:', error);
    }
  })();
  
} else {
  // Используем локальный SQLite
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
  
  // Создаем базу данных
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Error opening database:', err);
      throw err;
    }
    console.log(`✅ Database opened at: ${dbPath}`);
    
    // Включаем WAL mode
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
  
  // Инициализация таблиц для локального SQLite
  initializeTablesSQLite();
}

// Инициализация таблиц для Turso (async)
async function initializeTablesTurso(client) {
  // Включаем foreign keys (WAL mode не нужен для Turso)
  await client.execute('PRAGMA foreign_keys = ON;');
  
  // Создаем все таблицы
  await client.execute(`
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
      is_bartender BOOLEAN DEFAULT 0,
      chips DECIMAL(10,2) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_username_unique ON users(username) WHERE username IS NOT NULL');
  
  // Миграции для users
  try {
    await client.execute('ALTER TABLE users ADD COLUMN profile_link TEXT');
  } catch (e) {}
  try {
    await client.execute('ALTER TABLE users ADD COLUMN photo_url TEXT');
  } catch (e) {}
  try {
    await client.execute('ALTER TABLE users ADD COLUMN is_bartender BOOLEAN DEFAULT 0');
  } catch (e) {}
  try {
    await client.execute('ALTER TABLE users ADD COLUMN chips DECIMAL(10,2) DEFAULT 0');
  } catch (e) {}
  
  await client.execute(`
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
  
  try {
    await client.execute('ALTER TABLE events ADD COLUMN ticket_url TEXT');
  } catch (e) {}
  
  await client.execute(`
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
  
  await client.execute(`
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
  
  await client.execute(`
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
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      prize TEXT,
      image_url TEXT,
      link TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await client.execute(`
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
  
  await client.execute(`
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
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS waiter_shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waiter_id INTEGER NOT NULL,
      status TEXT DEFAULT 'working',
      start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      FOREIGN KEY (waiter_id) REFERENCES users (id)
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS chips_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bartender_id INTEGER NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (bartender_id) REFERENCES users (id)
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS order_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      items_count INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS waiter_actions_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      waiter_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      order_id INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (waiter_id) REFERENCES users (id),
      FOREIGN KEY (order_id) REFERENCES orders (id)
    )
  `);
  
  await client.execute(`
    CREATE TABLE IF NOT EXISTS role_change_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      admin_id INTEGER NOT NULL,
      old_role TEXT,
      new_role TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (admin_id) REFERENCES users (id)
    )
  `);
  
  // Вставка начальных данных
  try {
    await client.execute(`
      INSERT OR IGNORE INTO settings (key, value, description) VALUES 
      ('club_name', 'SavosBot Club', 'Название клуба'),
      ('welcome_message', 'Добро пожаловать в SavosBot Club!', 'Приветственное сообщение')
    `);
  } catch (e) {}
}

// Инициализация таблиц для локального SQLite (callback-based)
function initializeTablesSQLite() {
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
        is_bartender BOOLEAN DEFAULT 0,
        chips DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_username_unique ON users(username) WHERE username IS NOT NULL', (err) => {
      if (err && !String(err.message).includes('duplicate') && !String(err.message).includes('already exists')) {
        console.warn('Migration: username unique index warning:', err.message);
      }
    });

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
    
    db.run('ALTER TABLE users ADD COLUMN is_bartender BOOLEAN DEFAULT 0', (err) => {
      if (err && !String(err.message).includes('duplicate column name')) {
        console.warn('Migration: is_bartender add column warning:', err.message);
      }
    });
    db.run('ALTER TABLE users ADD COLUMN chips DECIMAL(10,2) DEFAULT 0', (err) => {
      if (err && !String(err.message).includes('duplicate column name')) {
        console.warn('Migration: chips add column warning:', err.message);
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
        link TEXT,
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

    // Таблица логов начислений фишек
    db.run(`
      CREATE TABLE IF NOT EXISTS chips_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        bartender_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (bartender_id) REFERENCES users (id)
      )
    `);

    // Таблица логов заказов (с данными о покупателе и покупке)
    db.run(`
      CREATE TABLE IF NOT EXISTS order_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        items_count INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Таблица логов действий официантов
    db.run(`
      CREATE TABLE IF NOT EXISTS waiter_actions_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        waiter_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        order_id INTEGER,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (waiter_id) REFERENCES users (id),
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )
    `);

    // Таблица логов изменений ролей пользователей
    db.run(`
      CREATE TABLE IF NOT EXISTS role_change_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        admin_id INTEGER NOT NULL,
        old_role TEXT,
        new_role TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (admin_id) REFERENCES users (id)
      )
    `);

    // Вставка начальных данных
    db.run(`
      INSERT OR IGNORE INTO settings (key, value, description) VALUES 
      ('club_name', 'SavosBot Club', 'Название клуба'),
      ('welcome_message', 'Добро пожаловать в SavosBot Club!', 'Приветственное сообщение')
    `);

    // Вставка тестовых данных (закомментировано, можно включить для разработки)
    // db.run(`
    //   INSERT OR IGNORE INTO drinks (name, description, price, category) VALUES 
    //   ('Мохито', 'Классический мохито с мятой и лаймом', 250.00, 'Коктейли'),
    //   ('Маргарита', 'Текила, трипл сек и лайм', 300.00, 'Коктейли'),
    //   ('Космополитен', 'Водка, клюквенный сок, лайм', 280.00, 'Коктейли'),
    //   ('Пиво разливное', 'Свежее пиво из кег', 150.00, 'Пиво'),
    //   ('Вино красное', 'Домашнее вино', 350.00, 'Вино'),
    //   ('Водка премиум', 'Премиальная водка', 500.00, 'Крепкие напитки'),
    //   ('Кофе', 'Свежесваренный кофе', 150.00, 'Горячие напитки')
    // `);

    console.log('✅ Database initialized successfully!');
  });
}

module.exports = db;
