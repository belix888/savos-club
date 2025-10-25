const db = require('./init');

console.log('🎭 Добавление демонстрационных данных в SavosBot Club...');

// Добавляем демонстрационные мероприятия
const demoEvents = [
    {
        title: 'DJ Night с Resident DJ',
        description: 'Вечер электронной музыки с лучшими треками сезона. Специальные гости и сюрпризы!',
        date: '2024-11-15 22:00:00',
        price: 800,
        image_url: 'https://example.com/dj-night.jpg'
    },
    {
        title: 'Wine Tasting Evening',
        description: 'Дегустация премиальных вин с сомелье. Узнайте секреты винного искусства.',
        date: '2024-11-20 19:00:00',
        price: 1200,
        image_url: 'https://example.com/wine-tasting.jpg'
    },
    {
        title: 'Караоке-вечеринка',
        description: 'Пойте любимые песни в компании друзей! Призы за лучшие выступления.',
        date: '2024-11-25 20:00:00',
        price: 0,
        image_url: 'https://example.com/karaoke.jpg'
    }
];

// Добавляем демонстрационные конкурсы
const demoContests = [
    {
        title: 'Лучший костюм месяца',
        description: 'Покажите свой стиль! Самый креативный костюм получит приз.',
        start_date: '2024-11-01 00:00:00',
        end_date: '2024-11-30 23:59:59',
        prize: 'Бесплатные напитки на месяц',
        image_url: 'https://example.com/costume-contest.jpg'
    },
    {
        title: 'Фотоконкурс "Моменты клуба"',
        description: 'Запечатлейте лучшие моменты вечера. Победитель получит профессиональную фотосессию.',
        start_date: '2024-11-10 00:00:00',
        end_date: '2024-12-10 23:59:59',
        prize: 'Профессиональная фотосессия',
        image_url: 'https://example.com/photo-contest.jpg'
    }
];

// Добавляем дополнительные напитки
const additionalDrinks = [
    {
        name: 'Мартини классический',
        description: 'Классический мартини с оливкой',
        price: 380,
        category: 'Коктейли'
    },
    {
        name: 'Мохито',
        description: 'Освежающий коктейль с мятой и лаймом',
        price: 320,
        category: 'Коктейли'
    },
    {
        name: 'Виски премиум',
        description: 'Премиальный виски 18 лет выдержки',
        price: 800,
        category: 'Крепкие напитки'
    },
    {
        name: 'Шампанское',
        description: 'Игристое вино для особых моментов',
        price: 1200,
        category: 'Вино'
    },
    {
        name: 'Сок свежевыжатый',
        description: 'Ассорти из свежих фруктов',
        price: 180,
        category: 'Безалкогольные'
    }
];

db.serialize(() => {
    // Добавляем мероприятия
    console.log('📅 Добавляем демонстрационные мероприятия...');
    demoEvents.forEach(event => {
        db.run(
            'INSERT INTO events (title, description, date, price, image_url) VALUES (?, ?, ?, ?, ?)',
            [event.title, event.description, event.date, event.price, event.image_url],
            function(err) {
                if (err) {
                    console.error('Ошибка добавления мероприятия:', err);
                } else {
                    console.log(`✅ Добавлено мероприятие: ${event.title}`);
                }
            }
        );
    });

    // Добавляем конкурсы
    console.log('🏆 Добавляем демонстрационные конкурсы...');
    demoContests.forEach(contest => {
        db.run(
            'INSERT INTO contests (title, description, start_date, end_date, prize, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [contest.title, contest.description, contest.start_date, contest.end_date, contest.prize, contest.image_url],
            function(err) {
                if (err) {
                    console.error('Ошибка добавления конкурса:', err);
                } else {
                    console.log(`✅ Добавлен конкурс: ${contest.title}`);
                }
            }
        );
    });

    // Добавляем дополнительные напитки
    console.log('🍸 Добавляем дополнительные напитки...');
    additionalDrinks.forEach(drink => {
        db.run(
            'INSERT INTO drinks (name, description, price, category) VALUES (?, ?, ?, ?)',
            [drink.name, drink.description, drink.price, drink.category],
            function(err) {
                if (err) {
                    console.error('Ошибка добавления напитка:', err);
                } else {
                    console.log(`✅ Добавлен напиток: ${drink.name}`);
                }
            }
        );
    });

    // Обновляем настройки клуба
    console.log('⚙️ Обновляем настройки клуба...');
    db.run(
        'UPDATE settings SET value = ? WHERE key = ?',
        ['Добро пожаловать в SavosBot Club! Здесь вас ждут незабываемые вечера, премиальные напитки и атмосфера настоящего клуба.', 'welcome_message'],
        function(err) {
            if (err) {
                console.error('Ошибка обновления настроек:', err);
            } else {
                console.log('✅ Настройки клуба обновлены');
            }
        }
    );

    db.run(
        'UPDATE settings SET value = ? WHERE key = ?',
        ['Скидки 20% на все напитки, приоритетный доступ к мероприятиям, персональный менеджер, эксклюзивные предложения', 'resident_benefits'],
        function(err) {
            if (err) {
                console.error('Ошибка обновления настроек:', err);
            } else {
                console.log('✅ Преимущества резидентов обновлены');
            }
        }
    );

    setTimeout(() => {
        console.log('\n🎉 Демонстрационные данные успешно добавлены!');
        console.log('\n📊 Теперь в системе есть:');
        console.log('   - 3 демонстрационных мероприятия');
        console.log('   - 2 активных конкурса');
        console.log('   - 10 различных напитков');
        console.log('   - Обновленные настройки клуба');
        console.log('\n🚀 Система готова к использованию!');
        
        db.close();
    }, 2000);
});
