@echo off
echo ========================================
echo TypeCat Bot - Upload to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Инициализация Git...
git init

echo [2/6] Добавление удаленного репозитория...
git remote add origin https://github.com/f37571964-pixel/Telegram-bot.git

echo [3/6] Добавление файлов...
git add .

echo [4/6] Создание коммита...
git commit -m "Add TypeCat bot files - ready for deploy"

echo [5/6] Установка ветки main...
git branch -M main

echo [6/6] Отправка на GitHub...
git push -u origin main

echo.
echo ========================================
echo Готово! Файлы загружены на GitHub!
echo ========================================
echo.
echo Теперь можете деплоить на Render.com
echo.
pause
