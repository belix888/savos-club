const db = require('./init');

console.log('🚀 Инициализация базы данных SavosBot Club...');

// Для Turso таблицы инициализируются автоматически при подключении
// Для локального SQLite используем serialize
const isTurso = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL || process.env.turso_TURSO_URL || process.env.turso_TURSO_DATABASE_URL;

if (isTurso) {
    console.log('✅ База данных Turso уже инициализирована!');
    console.log('📊 Таблицы созданы автоматически при подключении:');
    console.log('   - users (пользователи)');
    console.log('   - events (мероприятия)');
    console.log('   - drinks (напитки)');
    console.log('   - orders (заказы)');
    console.log('   - order_items (позиции заказов)');
    console.log('   - contests (конкурсы)');
    console.log('   - contest_participants (участники конкурсов)');
    console.log('   - waiter_shifts (смены официантов)');
    console.log('   - settings (настройки системы)');
    console.log('\n🎉 Готово! База данных Turso настроена.');
    
    // Для Turso не нужно закрывать соединение в setup скрипте
    // Просто выходим успешно
    setTimeout(() => {
        process.exit(0);
    }, 100);
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
        
        // Закрываем соединение
        db.close((err) => {
            if (err) {
                console.error('Ошибка закрытия базы данных:', err);
                process.exit(1);
            } else {
                console.log('🔒 Соединение с базой данных закрыто');
                process.exit(0);
            }
        });
    });
}
