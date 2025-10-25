const db = require('./init');

console.log('🚀 Инициализация базы данных SavosBot Club...');

// Запускаем инициализацию
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
    
    console.log('\n🍸 Добавлены тестовые напитки:');
    console.log('   - Коктейль "Савос" - 450 ₽');
    console.log('   - Пиво "Клубное" - 200 ₽');
    console.log('   - Вино красное - 350 ₽');
    console.log('   - Водка премиум - 500 ₽');
    console.log('   - Кофе - 150 ₽');
    
    console.log('\n⚙️ Настройки системы:');
    console.log('   - Название клуба: SavosBot Club');
    console.log('   - Приветственное сообщение настроено');
    console.log('   - Преимущества резидентов описаны');
    
    console.log('\n🎉 Готово! Теперь можно запускать бота командой: npm start');
    
    // Закрываем соединение
    db.close((err) => {
        if (err) {
            console.error('Ошибка закрытия базы данных:', err);
        } else {
            console.log('🔒 Соединение с базой данных закрыто');
        }
    });
});
