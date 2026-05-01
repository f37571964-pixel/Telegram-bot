// Telegram бот для управления обновлениями TypeCat
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Токен бота
const BOT_TOKEN = process.env.BOT_TOKEN || '8750155710:AAHWlSwjhx8untE64D9sJeLZTSpfTcJ1a3U';
// ID администратора (ваш Telegram ID)
const ADMIN_ID = process.env.ADMIN_ID || '6691530373';
// MongoDB URI (если не задан, используем файлы)
const MONGODB_URI = process.env.MONGODB_URI;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const versionFile = path.join(__dirname, 'version.json');
const leaderboardFile = path.join(__dirname, 'leaderboard.json');
const maintenanceFile = path.join(__dirname, 'maintenance.json');
const installerFile = path.join(__dirname, 'installer.exe'); // Путь к установщику

// MongoDB клиент
let mongoClient = null;
let db = null;

// Подключение к MongoDB
async function connectMongoDB() {
    if (!MONGODB_URI) {
        console.log('⚠️ MongoDB не настроен, используем файлы (данные НЕ сохранятся при перезапуске!)');
        return false;
    }
    
    try {
        mongoClient = new MongoClient(MONGODB_URI);
        await mongoClient.connect();
        db = mongoClient.db('typecat');
        console.log('✅ MongoDB подключен!');
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        return false;
    }
}

// Загрузить статус тех. работ
function loadMaintenance() {
    try {
        return JSON.parse(fs.readFileSync(maintenanceFile, 'utf8'));
    } catch (e) {
        return { enabled: false, message: 'Технические работы' };
    }
}

// Сохранить статус тех. работ
function saveMaintenance(data) {
    fs.writeFileSync(maintenanceFile, JSON.stringify(data, null, 2));
}

// Загрузить лидерборд
async function loadLeaderboard() {
    if (db) {
        try {
            const leaderboard = await db.collection('leaderboard').find().sort({ clicks: -1 }).toArray();
            return leaderboard;
        } catch (error) {
            console.error('Ошибка загрузки из MongoDB:', error);
        }
    }
    
    // Fallback к файлу
    try {
        return JSON.parse(fs.readFileSync(leaderboardFile, 'utf8'));
    } catch (e) {
        return [];
    }
}

// Сохранить результат в лидерборд
async function saveLeaderboardEntry(entry) {
    if (db) {
        try {
            await db.collection('leaderboard').insertOne({
                ...entry,
                _id: undefined,
                timestamp: new Date()
            });
            return true;
        } catch (error) {
            console.error('Ошибка сохранения в MongoDB:', error);
        }
    }
    
    // Fallback к файлу
    const leaderboard = await loadLeaderboard();
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.clicks - a.clicks);
    if (leaderboard.length > 1000) {
        leaderboard.splice(1000);
    }
    fs.writeFileSync(leaderboardFile, JSON.stringify(leaderboard, null, 2));
    return true;
}

// Очистить лидерборд
async function clearLeaderboard() {
    if (db) {
        try {
            await db.collection('leaderboard').deleteMany({});
            return true;
        } catch (error) {
            console.error('Ошибка очистки MongoDB:', error);
        }
    }
    
    // Fallback к файлу
    fs.writeFileSync(leaderboardFile, JSON.stringify([], null, 2));
    return true;
}

// Загрузить текущую версию
function loadVersion() {
    try {
        return JSON.parse(fs.readFileSync(versionFile, 'utf8'));
    } catch (e) {
        return {
            version: '1.0.3',
            description: 'Текущая версия TypeCat',
            downloadUrl: 'https://www.mediafire.com/file/i24c5tfyd7zfveo/TypeCat-Setup-1.0.3.exe/file',
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
        '/clearleaderboard - Очистить лидерборд\n\n' +
        '🔧 *Тех. работы:*\n' +
        '/maintenance - Включить/выключить тех. работы',
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
        version: '1.0.3',
        description: 'Текущая версия TypeCat',
        downloadUrl: 'https://www.mediafire.com/file/i24c5tfyd7zfveo/TypeCat-Setup-1.0.3.exe/file',
        changelog: [
            '🏆 Лидерборд',
            '👤 Логин и регистрация',
            '🎩 20 шапок',
            '🔥 Мифические шапки'
        ],
        releaseDate: '2026-05-01'
    };
    
    saveVersion(defaultVersion);
    
    bot.sendMessage(chatId,
        `🔄 *Версия сброшена на 1.0.3*\n\n` +
        `Тестовое обновление удалено.`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /leaderboard - показать топ игроков
bot.onText(/\/leaderboard/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const leaderboard = await loadLeaderboard();
    
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
bot.onText(/\/clearleaderboard/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    await clearLeaderboard();
    bot.sendMessage(chatId, '🗑️ *Лидерборд очищен!*', { parse_mode: 'Markdown' });
});

// Команда /stats - статистика лидерборда
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const leaderboard = await loadLeaderboard();
    
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

// Команда /maintenance - включить/выключить тех. работы
bot.onText(/\/maintenance/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    const maintenance = loadMaintenance();
    const newStatus = !maintenance.enabled;
    
    saveMaintenance({
        enabled: newStatus,
        message: newStatus ? 'Лидерборд временно недоступен. Ведутся технические работы.' : ''
    });
    
    const statusText = newStatus ? '🔧 *ВКЛЮЧЕНЫ*' : '✅ *ВЫКЛЮЧЕНЫ*';
    bot.sendMessage(chatId,
        `🔧 *Технические работы ${statusText}*\n\n` +
        (newStatus ? 'Лидерборд теперь недоступен для пользователей.' : 'Лидерборд снова доступен!'),
        { parse_mode: 'Markdown' }
    );
});

// Команда /upload - загрузить установщик
bot.onText(/\/upload/, (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
        return;
    }
    
    bot.sendMessage(chatId, 
        '📤 *Загрузка установщика*\n\n' +
        'Отправь мне .exe файл TypeCat Setup.\n' +
        'Он будет доступен по ссылке:\n' +
        '`https://telegram-bot-zw0g.onrender.com/download`',
        { parse_mode: 'Markdown' }
    );
});

// Обработка загрузки файла
bot.on('document', async (msg) => {
    const chatId = msg.chat.id;
    
    if (chatId.toString() !== ADMIN_ID) {
        return;
    }
    
    const document = msg.document;
    
    // Проверить что это .exe файл
    if (!document.file_name.endsWith('.exe')) {
        bot.sendMessage(chatId, '❌ Нужен .exe файл!');
        return;
    }
    
    bot.sendMessage(chatId, '⏳ Скачиваю файл...');
    
    try {
        // Получить ссылку на файл
        const fileLink = await bot.getFileLink(document.file_id);
        
        // Скачать файл
        const https = require('https');
        const file = fs.createWriteStream(installerFile);
        
        https.get(fileLink, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                bot.sendMessage(chatId,
                    '✅ *Установщик загружен!*\n\n' +
                    `📦 Файл: ${document.file_name}\n` +
                    `📏 Размер: ${(document.file_size / 1024 / 1024).toFixed(2)} МБ\n\n` +
                    '🔗 Доступен по ссылке:\n' +
                    '`https://telegram-bot-zw0g.onrender.com/download`',
                    { parse_mode: 'Markdown' }
                );
            });
        }).on('error', (err) => {
            bot.sendMessage(chatId, `❌ Ошибка загрузки: ${err.message}`);
        });
    } catch (error) {
        bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
    }
});

// Инициализация при запуске
(async () => {
    await connectMongoDB();
    console.log('🤖 TypeCat Update Bot запущен!');
})();

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

// API endpoint для скачивания установщика
app.get('/download', (req, res) => {
    if (fs.existsSync(installerFile)) {
        res.download(installerFile, 'TypeCat-Setup.exe', (err) => {
            if (err) {
                console.error('Ошибка скачивания:', err);
                res.status(500).json({ error: 'Ошибка скачивания файла' });
            } else {
                console.log('✅ Файл скачан');
            }
        });
    } else {
        res.status(404).json({ error: 'Файл не найден' });
    }
});

// API endpoint для получения лидерборда
app.get('/leaderboard', async (req, res) => {
    // Проверка тех. работ
    const maintenance = loadMaintenance();
    if (maintenance.enabled) {
        return res.status(503).json({ 
            error: 'maintenance', 
            message: maintenance.message 
        });
    }
    
    const leaderboard = await loadLeaderboard();
    // Вернуть топ 100
    const top = leaderboard.slice(0, 100);
    res.json(top);
    console.log('✅ Запрос лидерборда');
});

// API endpoint для отправки результата
app.post('/leaderboard/submit', async (req, res) => {
    // Проверка тех. работ
    const maintenance = loadMaintenance();
    if (maintenance.enabled) {
        return res.status(503).json({ 
            error: 'maintenance', 
            message: maintenance.message 
        });
    }
    
    const { name, clicks, hats } = req.body;
    
    if (!name || !clicks) {
        return res.status(400).json({ error: 'Неверные данные' });
    }
    
    // Сохранить результат
    const entry = {
        name: name.substring(0, 20), // Ограничить длину имени
        clicks: parseInt(clicks),
        hats: parseInt(hats) || 0,
        date: new Date().toISOString()
    };
    
    await saveLeaderboardEntry(entry);
    
    // Получить обновленный лидерборд для определения позиции
    const leaderboard = await loadLeaderboard();
    const rank = leaderboard.findIndex(p => p.name === entry.name && p.clicks === entry.clicks) + 1;
    
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
