# 🤖 TypeCat Telegram Bot

Telegram бот для управления обновлениями TypeCat и глобального лидерборда.

## 🚀 Быстрый старт

### Локальный запуск

```bash
cd telegram-bot
npm install
npm start
```

### Деплой на Render.com

1. Загрузи код на GitHub: `upload-to-github.bat`
2. Следуй инструкции: [HOSTING.md](./HOSTING.md)
3. **ВАЖНО:** Настрой MongoDB: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

## ⚠️ КРИТИЧНО: MongoDB обязателен!

**Render.com бесплатный план НЕ сохраняет файлы!**

Без MongoDB лидерборд будет очищаться при каждом перезапуске.

📖 **Быстрое решение (5 минут):** [QUICK_FIX.md](./QUICK_FIX.md)

## 📋 Возможности

### Команды бота
- `/start` - Список команд
- `/version` - Текущая версия
- `/update` - Опубликовать обновление
- `/changelog` - Список изменений
- `/test` - Тестовое уведомление
- `/reset` - Сбросить версию

### Лидерборд
- `/leaderboard` - Топ-10 игроков
- `/stats` - Статистика
- `/clearleaderboard` - Очистить

### Тех. работы
- `/maintenance` - Включить/выключить

### API Endpoints
- `GET /version` - Информация о версии
- `GET /leaderboard` - Топ-100 игроков
- `POST /leaderboard/submit` - Отправить результат

## 🔧 Настройка

### Переменные окружения

```env
BOT_TOKEN=ваш_токен_бота
ADMIN_ID=ваш_telegram_id
PORT=3000
MONGODB_URI=mongodb+srv://...
```

### Файлы

- `bot.js` - Основной код бота
- `package.json` - Зависимости
- `version.json` - Текущая версия
- `leaderboard.json` - Локальный лидерборд (fallback)
- `maintenance.json` - Статус тех. работ

## 📚 Документация

- [HOSTING.md](./HOSTING.md) - Как захостить бота
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Настройка MongoDB Atlas
- [QUICK_FIX.md](./QUICK_FIX.md) - Быстрое решение проблемы с лидербордом
- [LEADERBOARD.md](./LEADERBOARD.md) - Как работает лидерборд

## 🔗 Ссылки

- Telegram канал: https://t.me/typecatoff
- GitHub: https://github.com/f37571964-pixel/Telegram-bot
- Render: https://telegram-bot-zw0g.onrender.com

## 📦 Зависимости

```json
{
  "node-telegram-bot-api": "^0.64.0",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "mongodb": "^6.3.0"
}
```

## 🐛 Проблемы?

1. Проверь логи на Render
2. Убедись что MongoDB настроен
3. Проверь переменные окружения
4. Протестируй локально

## 📝 Changelog

### v1.0.3
- ✅ MongoDB интеграция для постоянного хранения
- ✅ Лидерборд с топ-100
- ✅ Режим тех. работ
- ✅ API для приложения
- ✅ Автоматический деплой

## 👨‍💻 Автор

KO6TIK - https://t.me/typecatoff

## 📄 Лицензия

MIT License
