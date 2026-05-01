# 🚀 Как захостить TypeCat бота

## Вариант 1: Render.com (РЕКОМЕНДУЕТСЯ) ⭐

**Бесплатно, просто, надёжно**

### Шаг 1: Подготовка

1. Создайте аккаунт на [render.com](https://render.com)
2. Создайте GitHub репозиторий для бота
3. Загрузите папку `telegram-bot` в репозиторий

### Шаг 2: Создайте Web Service

1. На Render.com нажмите **"New +"** → **"Web Service"**
2. Подключите ваш GitHub репозиторий
3. Настройте:
   - **Name**: `typecat-bot`
   - **Region**: выберите ближайший
   - **Branch**: `main`
   - **Root Directory**: `telegram-bot` (если бот в подпапке)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Добавьте переменные окружения (Environment Variables):
   - `BOT_TOKEN`: `8750155710:AAHWlSwjhx8untE64D9sJeLZTSpfTcJ1a3U`
   - `ADMIN_ID`: `6691530373`
   - `PORT`: `3000`
   - `MONGODB_URI`: ваша строка подключения MongoDB (см. MONGODB_SETUP.md)

5. Нажмите **"Create Web Service"**

### ⚠️ ВАЖНО: Настройте MongoDB!

**Render.com бесплатный план НЕ сохраняет файлы!** Лидерборд будет очищаться при каждом перезапуске.

**Решение:** Используйте MongoDB Atlas (бесплатно навсегда)

📖 **Подробная инструкция:** [MONGODB_SETUP.md](./MONGODB_SETUP.md)

### Шаг 3: Получите URL

После деплоя вы получите URL типа:
```
https://typecat-bot.onrender.com
```

### Шаг 4: Обновите приложение

В `script.js` замените:
```javascript
const LEADERBOARD_API = 'https://typecat-bot.onrender.com/leaderboard';
```

В функции `submitScore()`:
```javascript
fetch('https://typecat-bot.onrender.com/leaderboard/submit', ...)
```

В `update-checker.js`:
```javascript
const UPDATE_CHECK_URL = 'https://typecat-bot.onrender.com/version';
const USE_HTTPS = true;
```

✅ **Готово!** Бот работает 24/7!

---

## Вариант 2: Glitch.com

**Простой, с редактором кода онлайн**

### Шаг 1: Создание проекта

1. Зайдите на [glitch.com](https://glitch.com)
2. Нажмите **"New Project"** → **"Import from GitHub"**
3. Или создайте новый Node.js проект

### Шаг 2: Загрузите файлы

Загрузите все файлы из папки `telegram-bot`:
- `bot.js`
- `package.json`
- `version.json`

### Шаг 3: Настройте .env

Создайте файл `.env`:
```
BOT_TOKEN=8750155710:AAHWlSwjhx8untE64D9sJeLZTSpfTcJ1a3U
ADMIN_ID=6691530373
PORT=3000
```

### Шаг 4: Обновите bot.js

В начале файла добавьте:
```javascript
require('dotenv').config();
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
```

### Шаг 5: URL проекта

Ваш URL будет:
```
https://ваш-проект.glitch.me
```

---

## Вариант 3: Railway.app

**Быстрый деплой из GitHub**

### Шаг 1: Подготовка

1. Создайте аккаунт на [railway.app](https://railway.app)
2. Загрузите код в GitHub

### Шаг 2: Деплой

1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите ваш репозиторий
4. Railway автоматически определит Node.js

### Шаг 3: Переменные

Добавьте в Settings → Variables:
- `BOT_TOKEN`
- `ADMIN_ID`
- `PORT`

### Шаг 4: Получите домен

Settings → Generate Domain

---

## Вариант 4: Heroku

**Классический вариант**

### Шаг 1: Установка

```bash
npm install -g heroku
heroku login
```

### Шаг 2: Создание приложения

```bash
cd telegram-bot
heroku create typecat-bot
```

### Шаг 3: Настройка

```bash
heroku config:set BOT_TOKEN=8750155710:AAHWlSwjhx8untE64D9sJeLZTSpfTcJ1a3U
heroku config:set ADMIN_ID=6691530373
```

### Шаг 4: Деплой

```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

URL: `https://typecat-bot.herokuapp.com`

---

## Вариант 5: VPS (Свой сервер)

**Для продвинутых пользователей**

### Требования

- Ubuntu/Debian сервер
- Node.js установлен
- SSH доступ

### Установка

```bash
# Подключитесь к серверу
ssh user@your-server.com

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установите PM2
sudo npm install -g pm2

# Загрузите файлы бота
cd /home/user
mkdir typecat-bot
cd typecat-bot

# Загрузите файлы (через git или scp)
git clone your-repo.git .

# Установите зависимости
npm install

# Запустите с PM2
pm2 start bot.js --name typecat-bot
pm2 save
pm2 startup
```

### Nginx (опционально)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Важные файлы для хостинга

### package.json
Убедитесь что есть:
```json
{
  "name": "typecat-update-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "dependencies": {
    "node-telegram-bot-api": "^0.64.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "mongodb": "^6.3.0"
  }
}
```

### .gitignore
```
node_modules/
.env
leaderboard.json
version.json
*.log
```

---

## После деплоя

### 1. Обновите URL в приложении

**script.js:**
```javascript
const LEADERBOARD_API = 'https://ваш-домен.com/leaderboard';

// В submitScore():
fetch('https://ваш-домен.com/leaderboard/submit', ...)
```

**update-checker.js:**
```javascript
const UPDATE_CHECK_URL = 'https://ваш-домен.com/version';
const USE_HTTPS = true;
```

### 2. Проверьте работу

Откройте в браузере:
- `https://ваш-домен.com/version` - должен вернуть JSON
- `https://ваш-домен.com/leaderboard` - должен вернуть массив

### 3. Протестируйте бота

В Telegram напишите боту:
- `/start` - должен ответить
- `/leaderboard` - показать топ

---

## Проблемы и решения

### Бот не отвечает
- Проверьте логи на хостинге
- Убедитесь что токен правильный
- Проверьте что порт открыт

### API не работает
- Проверьте CORS настройки
- Убедитесь что сервер запущен
- Проверьте URL в приложении

### Бесплатный план засыпает
На Render.com бесплатные сервисы засыпают после 15 минут неактивности.

**Решение:** Используйте cron-job для пинга:
1. Зарегистрируйтесь на [cron-job.org](https://cron-job.org)
2. Создайте задачу: каждые 10 минут GET запрос на `https://ваш-домен.com/version`

---

## Рекомендации

✅ **Лучший выбор для начинающих:** Render.com
- Бесплатно
- Простая настройка
- Автоматический деплой из GitHub
- SSL сертификат включён

✅ **Для продакшена:** VPS
- Полный контроль
- Не засыпает
- Можно настроить домен

---

## Безопасность

⚠️ **ВАЖНО:**
- Никогда не публикуйте токен бота в открытом коде
- Используйте переменные окружения
- Добавьте `.env` в `.gitignore`
- Регулярно обновляйте зависимости

---

## Поддержка

Если что-то не работает:
1. Проверьте логи на хостинге
2. Убедитесь что все зависимости установлены
3. Проверьте переменные окружения
4. Протестируйте локально сначала

Удачи! 🚀
