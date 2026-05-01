// Telegram бот для управления обновлениями TypeCat
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Токен бота
const BOT_TOKEN = '8750155710:AAHWlSwjhx8untE64D9sJeLZTSpfTcJ1a3U';
// ID администратора (ваш Telegram ID)
const ADMIN_ID = '6691530373';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const versionFile = path.join(__dirname, 'version.json');
const leaderboardFile = path.join(__dirname, 'leaderboard.json');

// Загрузить лидерборд
function loadLeaderboard() {
    try {
        return JSON.parse(fs.readFileSync(leaderboardFile, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Сохранить лидерборд
function saveLeaderboard(data) {
    fs.writeFileSync(leaderboardFile, JSON.stringify(data, null, 2));
}

// Загрузить текущую версию
function loadVersion() {
    try {
        return JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    } catch (e) {
        return {
            version: '1.0.2',
            description: 'Текущая версия TypeCat',
            downloadUrl: 'https://www.mediafire.com/file/d7exoguu77bujxf/TypeCat-Setup-1.0.2.exe/file',
            changelog: [],
            releaseDate: new Date().toISOString().split('T')[0]
        };
    }
}

// Сохранить версию
function saveVersion(data) {
    fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));
}

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    bot.sendMessage(chatId, 
        '🐱 *TypeCat Update Manager*\n\n' +
        'Команды:\n' +
        '/version - Показать текущую версию\n' +
        '/update - Опубликовать новое обновление\n' +
        '/changelog - Показать список изменений\n' +
        '/test - Создать тестовое обновление\n' +
        '/reset - Сбросить на версию 1.0.2\n\n' +
        '🏆 *Лидерборд:*\n' +
        '/leaderboard - Топ-10 игроков\n' +
        '/stats - Статистика\n' +
        '/clearleaderboard - Очистить лидерборд',
        { parse_mode: 'Markdown' }
    );
});

// Команда /version
bot.onText(/\/version/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const versionData = loadVersion();
    bot.sendMessage(chatId,
        `📦 *Текущая версия:* ${versionData.version}\n` +
        `📝 ${versionData.description}\n` +
        `📅 Дата: ${versionData.releaseDate}\n` +
        `🔗 [Скачать](${versionData.downloadUrl})`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /update
bot.onText(/\/update/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    bot.sendMessage(chatId,
        '📝 Отправьте данные обновления в формате:\n\n' +
        '```\n' +
        '1.0.3\n' +
        'Краткое описание обновления\n' +
        'https://ссылка-на-скачивание.exe\n' +
        '- Изменение 1\n' +
        '- Изменение 2\n' +
        '- Изменение 3\n' +
        '```',
        { parse_mode: 'Markdown' }
    );
    
    // Ожидание ответа
    bot.once('message', (response) => {
        if (response.chat.id.toString() !== ADMIN_ID) return;
        
        const lines = response.text.split('\n').filter(l => l.trim());
        
        if (lines.length < 3) {
            bot.sendMessage(chatId, '❌ Неверный формат. Попробуйте снова.');
            return;
        }
        
        const version = lines[0].trim();
        const description = lines[1].trim();
        const downloadUrl = lines[2].trim();
        const changelog = lines.slice(3).map(l => l.trim());
        
        const versionData = {
            version,
            description,
            downloadUrl,
            changelog,
            releaseDate: new Date().toISOString().split('T')[0]
        };
        
        saveVersion(versionData);
        
        bot.sendMessage(chatId,
            `✅ *Обновление опубликовано!*\n\n` +
            `📦 Версия: ${version}\n` +
            `📝 ${description}\n` +
            `📅 ${versionData.releaseDate}\n\n` +
            `Пользователи получат уведомление при следующем запуске приложения.`,
            { parse_mode: 'Markdown' }
        );
    });
});

// Команда /changelog
bot.onText(/\/changelog/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const versionData = loadVersion();
    
    if (versionData.changelog.length === 0) {
        bot.sendMessage(chatId, '📝 Список изменений пуст.');
        return;
    }
    
    const changelogText = versionData.changelog.map(c => `• ${c}`).join('\n');
    
    bot.sendMessage(chatId,
        `📋 *Список изменений v${versionData.version}:*\n\n${changelogText}`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /test - тестовое уведомление
bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const testVersion = {
        version: '1.0.3',
        description: 'Тестовое обновление для проверки',
        downloadUrl: 'https://t.me/typecatoff',
        changelog: [
            '✅ Это тестовое уведомление',
            '🔔 Проверка системы обновлений',
            '🎉 Всё работает!'
        ],
        releaseDate: new Date().toISOString().split('T')[0]
    };
    
    saveVersion(testVersion);
    
    bot.sendMessage(chatId,
        `🧪 *Тестовое обновление создано!*\n\n` +
        `📦 Версия: ${testVersion.version}\n` +
        `📝 ${testVersion.description}\n\n` +
        `Теперь запустите TypeCat и проверьте уведомление.\n` +
        `После теста используйте /reset чтобы вернуть версию 1.0.2`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /reset - вернуть версию 1.0.2
bot.onText(/\/reset/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const defaultVersion = {
        version: '1.0.2',
        description: 'Текущая версия TypeCat',
        downloadUrl: 'https://www.mediafire.com/file/d7exoguu77bujxf/TypeCat-Setup-1.0.2.exe/file',
        changelog: [
            '🐱 Анимация мяуканья кота',
            '🔊 Настройка звука',
            '⚙️ Красивые окна настроек'
        ],
        releaseDate: '2026-04-30'
    };
    
    saveVersion(defaultVersion);
    
    bot.sendMessage(chatId,
        `🔄 *Версия сброшена на 1.0.2*\n\n` +
        `Тестовое обновление удалено.`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /leaderboard - показать топ игроков
bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const leaderboard = loadLeaderboard();
    
    if (leaderboard.length === 0) {
        bot.sendMessage(chatId, '📊 Лидерборд пуст');
        return;
    }
    
    const top10 = leaderboard.slice(0, 10);
    const text = '🏆 *Топ-10 игроков:*\n\n' + 
        top10.map((player, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            return `${medal} *${player.name}*\n   💰 ${player.clicks.toLocaleString()} кликов | 🎩 ${player.hats}/20`;
        }).join('\n\n');
    
    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// Команда /clearleaderboard - очистить лидерборд
bot.onText(/\/clearleaderboard/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    saveLeaderboard([]);
    bot.sendMessage(chatId, '🗑️ *Лидерборд очищен!*', { parse_mode: 'Markdown' });
});

// Команда /stats - статистика лидерборда
bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const leaderboard = loadLeaderboard();
    
    if (leaderboard.length === 0) {
        bot.sendMessage(chatId, '📊 Нет данных');
        return;
    }
    
    const totalPlayers = leaderboard.length;
    const totalClicks = leaderboard.reduce((sum, p) => sum + p.clicks, 0);
    const avgClicks = Math.floor(totalClicks / totalPlayers);
    const topPlayer = leaderboard[0];
    
    const text = `📊 *Статистика лидерборда:*\n\n` +
        `👥 Всего игроков: ${totalPlayers}\n` +
        `💰 Всего кликов: ${totalClicks.toLocaleString()}\n` +
        `📈 Средний результат: ${avgClicks.toLocaleString()}\n\n` +
        `🥇 Лидер: *${topPlayer.name}*\n` +
        `   ${topPlayer.clicks.toLocaleString()} кликов`;
    
    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

console.log('🤖 TypeCat Update Bot запущен!');

// Веб-сервер для API
const app = express();
app.use(cors());
app.use(express.json()); // Для парсинга JSON

// API endpoint для проверки обновлений
app.get('/version', (req, res) => {
    const versionData = loadVersion();
    res.json(versionData);
    console.log('✅ Запрос на проверку обновлений');
});

app.get('/version.json', (req, res) => {
    const versionData = loadVersion();
    res.json(versionData);
});

// API endpoint для получения лидерборда
app.get('/leaderboard', (req, res) => {
    const leaderboard = loadLeaderboard();
    // Вернуть топ 100
    const top = leaderboard.slice(0, 100);
    res.json(top);
    console.log('✅ Запрос лидерборда');
});

// API endpoint для отправки результата
app.post('/leaderboard/submit', (req, res) => {
    const { name, clicks, hats } = req.body;
    
    if (!name || !clicks) {
        return res.status(400).json({ error: 'Неверные данные' });
    }
    
    const leaderboard = loadLeaderboard();
    
    // Добавить новый результат
    leaderboard.push({
        name: name.substring(0, 20), // Ограничить длину имени
        clicks: parseInt(clicks),
        hats: parseInt(hats) || 0,
        date: new Date().toISOString()
    });
    
    // Сортировать по кликам
    leaderboard.sort((a, b) => b.clicks - a.clicks);
    
    // Оставить топ 1000
    if (leaderboard.length > 1000) {
        leaderboard.splice(1000);
    }
    
    saveLeaderboard(leaderboard);
    
    // Найти позицию игрока
    const rank = leaderboard.findIndex(p => p.name === name && p.clicks === parseInt(clicks)) + 1;
    
    res.json({ 
        success: true, 
        rank: rank,
        message: `Вы на ${rank} месте!`
    });
    
    console.log(`✅ Новый результат: ${name} - ${clicks} кликов (место: ${rank})`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 API сервер запущен на порту ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/version`);
});
