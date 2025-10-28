const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'club.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Удаление всех пользователей из базы данных...');

db.run('DELETE FROM users', (err) => {
  if (err) {
    console.error('❌ Ошибка:', err);
  } else {
    console.log('✅ Все пользователи удалены!');
    console.log('Теперь при /start пользователь пройдет регистрацию с запросом телефона и фото.');
  }
  
  db.close();
});

