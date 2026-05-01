// Локальный тест системы обновлений
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const versionFile = path.join(__dirname, 'version.json');

// Создать тестовый version.json если не существует
if (!fs.existsSync(versionFile)) {
    const testVersion = {
        version: '1.0.3',
        description: 'Тестовое обновление',
        downloadUrl: 'https://t.me/typecatoff',
        changelog: [
            '✅ Это тестовое уведомление',
            '🔔 Проверка системы обновлений',
            '🎉 Всё работает!'
        ],
        releaseDate: new Date().toISOString().split('T')[0]
    };
    fs.writeFileSync(versionFile, JSON.stringify(testVersion, null, 2));
}

// Простой HTTP сервер
const server = http.createServer((req, res) => {
    if (req.url === '/version' || req.url === '/version.json') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        const data = fs.readFileSync(versionFile, 'utf8');
        res.end(data);
        
        console.log('✅ Запрос на проверку обновлений получен');
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log('🚀 Тестовый сервер запущен!');
    console.log(`📡 URL: http://localhost:${PORT}/version`);
    console.log('');
    console.log('Инструкция:');
    console.log('1. Откройте update-checker.js');
    console.log('2. Замените URL на: http://localhost:3000/version');
    console.log('3. Запустите TypeCat');
    console.log('4. Должно появиться уведомление об обновлении!');
    console.log('');
    console.log('Нажмите Ctrl+C для остановки');
});
