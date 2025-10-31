const db = require('./init');

console.log('🚀 Инициализация базы данных SavosBot Club...');

// Проверяем наличие Turso переменных более надежно
const hasTursoUrl = !!(
  process.env.TURSO_URL || 
  process.env.TURSO_DATABASE_URL || 
  process.env.turso_TURSO_URL || 
  process.env.turso_TURSO_DATABASE_URL
);
const hasTursoToken = !!(
  process.env.TURSO_AUTH_TOKEN || 
  process.env.turso_TURSO_AUTH_TOKEN
);
const isTurso = hasTursoUrl && hasTursoToken;

if (isTurso) {
    console.log('✅ База данных Turso обнаружена!');
    console.log('📊 Таблицы будут созданы автоматически при первом подключении.');
    console.log('🎉 Setup завершен для Turso.');
    // НЕ вызываем db.close() для Turso!
    process.exit(0);
} else {
    // Для локального SQLite используем serialize
    db.serialize(() => {
        console.log('✅ База данных успешно инициализирована!');
        console.log('📊 Созданы таблицы:');
        console.log('   - users (пользователи)');
        console.log('   - events (мероприятия)');
        console.log('   - drinks (напитки)');
        console.log('   - orders (заказы)');
        console.log('   - order_items (позиции заказов)');
        console.log('   - contests (конкурсы)');
        console.log('   - contest_participants (участники конкурсов)');
        console.log('   - waiter_shifts (смены официантов)');
        console.log('   - settings (настройки системы)');
        
        console.log('\n🎉 Готово! Теперь можно запускать бота командой: npm start');
        
        // Закрываем соединение только для SQLite
        if (typeof db.close === 'function') {
            db.close((err) => {
                if (err) {
                    console.error('Ошибка закрытия базы данных:', err);
                    process.exit(1);
                } else {
                    console.log('🔒 Соединение с базой данных закрыто');
                    process.exit(0);
                }
            });
        } else {
            process.exit(0);
        }
    });
}
