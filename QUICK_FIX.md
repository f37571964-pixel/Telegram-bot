# ⚡ БЫСТРОЕ РЕШЕНИЕ ПРОБЛЕМЫ С ЛИДЕРБОРДОМ

## 🔴 Проблема
Лидерборд очищается при перезапуске бота на Render.com

## ✅ Решение
Настроить MongoDB Atlas (5 минут, бесплатно навсегда)

---

## 🚀 Быстрая инструкция

### 1️⃣ Создать MongoDB Atlas (2 минуты)

1. Перейди: https://www.mongodb.com/cloud/atlas/register
2. Зарегистрируйся (можно через Google)
3. Выбери **FREE** план
4. Создай кластер

### 2️⃣ Настроить доступ (1 минута)

1. **Database Access** → Add User:
   - Username: `typecat_bot`
   - Password: придумай и сохрани
   - Права: Read and write to any database

2. **Network Access** → Add IP:
   - Allow Access from Anywhere (0.0.0.0/0)

### 3️⃣ Получить строку подключения (1 минута)

1. **Database** → Connect → Drivers
2. Скопируй строку:
   ```
   mongodb+srv://typecat_bot:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Замени `<password>` на свой пароль

### 4️⃣ Добавить на Render (1 минута)

1. Открой: https://dashboard.render.com
2. Твой сервис → **Environment**
3. Add Environment Variable:
   - Key: `MONGODB_URI`
   - Value: твоя строка из шага 3
4. Save Changes

### 5️⃣ Обновить код на GitHub

Код уже обновлён! Просто загрузи изменения:

```bash
cd telegram-bot
git add .
git commit -m "Add MongoDB support"
git push
```

Render автоматически задеплоит обновление!

---

## ✅ Проверка

1. Подожди 2 минуты
2. Открой логи на Render
3. Должно быть:
   ```
   ✅ MongoDB подключен!
   🤖 TypeCat Update Bot запущен!
   ```

4. Отправь результат в лидерборд
5. Перезапусти бот на Render
6. Результат всё ещё там! 🎉

---

## 📖 Подробная инструкция

Если нужны скриншоты и детали: [MONGODB_SETUP.md](./MONGODB_SETUP.md)

---

## ❓ Проблемы?

**Ошибка подключения к MongoDB:**
- Проверь пароль (без `<` и `>`)
- Проверь что IP 0.0.0.0/0 добавлен
- Проверь что пользователь создан

**Бот не запускается:**
- Проверь логи на Render
- Убедись что `MONGODB_URI` добавлен в Environment

**Лидерборд всё равно очищается:**
- Проверь что в логах есть "✅ MongoDB подключен!"
- Если нет - проверь строку подключения

---

## 💡 Что изменилось в коде?

- ✅ Добавлена зависимость `mongodb`
- ✅ Функции `loadLeaderboard()`, `saveLeaderboardEntry()`, `clearLeaderboard()` теперь async
- ✅ Автоматическое подключение к MongoDB при старте
- ✅ Fallback к файлам если MongoDB не настроен

Всё работает автоматически! Просто добавь `MONGODB_URI` и всё! 🚀
