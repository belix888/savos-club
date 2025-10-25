const db = require('./init');

console.log('🔐 Создание супер-администратора...');

// Данные супер-администратора
const superAdminData = {
    telegram_id: 123456789, // Замените на ваш Telegram ID
    username: 'superadmin',
    first_name: 'Супер',
    last_name: 'Администратор',
    is_resident: 1,
    is_waiter: 0,
    is_admin: 1,
    is_super_admin: 1
};

db.serialize(() => {
    // Проверяем, есть ли уже супер-админ
    db.get('SELECT * FROM users WHERE is_super_admin = 1', (err, row) => {
        if (err) {
            console.error('Ошибка проверки супер-администратора:', err);
            return;
        }

        if (row) {
            console.log('✅ Супер-администратор уже существует:');
            console.log(`   ID: ${row.id}`);
            console.log(`   Имя: ${row.first_name} ${row.last_name}`);
            console.log(`   Username: @${row.username}`);
            console.log(`   Telegram ID: ${row.telegram_id}`);
        } else {
            // Создаем супер-администратора
            db.run(
                'INSERT INTO users (telegram_id, username, first_name, last_name, is_resident, is_waiter, is_admin, is_super_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [superAdminData.telegram_id, superAdminData.username, superAdminData.first_name, superAdminData.last_name, superAdminData.is_resident, superAdminData.is_waiter, superAdminData.is_admin, superAdminData.is_super_admin],
                function(err) {
                    if (err) {
                        console.error('Ошибка создания супер-администратора:', err);
                    } else {
                        console.log('✅ Супер-администратор создан успешно!');
                        console.log(`   ID: ${this.lastID}`);
                        console.log(`   Имя: ${superAdminData.first_name} ${superAdminData.last_name}`);
                        console.log(`   Username: @${superAdminData.username}`);
                        console.log(`   Telegram ID: ${superAdminData.telegram_id}`);
                        console.log('\n📝 ВАЖНО:');
                        console.log('1. Замените telegram_id в этом файле на ваш реальный Telegram ID');
                        console.log('2. Перезапустите скрипт для обновления данных');
                        console.log('3. Используйте этого пользователя для доступа к супер-админке');
                    }
                }
            );
        }
    });

    // Показываем всех администраторов
    setTimeout(() => {
        console.log('\n👥 Все администраторы в системе:');
        db.all('SELECT id, first_name, last_name, username, is_admin, is_super_admin FROM users WHERE is_admin = 1 OR is_super_admin = 1', (err, rows) => {
            if (err) {
                console.error('Ошибка получения списка администраторов:', err);
            } else {
                rows.forEach(admin => {
                    const role = admin.is_super_admin ? 'Супер-админ' : 'Админ';
                    console.log(`   ${role}: ${admin.first_name} ${admin.last_name} (@${admin.username}) - ID: ${admin.id}`);
                });
            }
            
            db.close();
        });
    }, 1000);
});
