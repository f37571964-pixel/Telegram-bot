@echo off
echo ========================================
echo   TypeCat Update Bot
echo ========================================
echo.

REM Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js не установлен!
    echo Скачайте с https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js найден
echo.

REM Установка зависимостей если нужно
if not exist "node_modules" (
    echo [INFO] Установка зависимостей...
    call npm install
    echo.
)

echo [INFO] Запуск бота...
echo.
node bot.js

pause
