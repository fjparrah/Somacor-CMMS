@echo off
echo 🚀 Iniciando Bot Omnicanal Somacor-CMMS
echo ========================================

REM Verificar que estamos en el directorio correcto
if not exist "api_gateway.py" (
    echo ❌ Error: Ejecuta este script desde el directorio somacor_omnibot
    pause
    exit /b 1
)

REM Activar entorno virtual
echo 📦 Activando entorno virtual...
call venv\Scripts\activate

REM Verificar Redis
echo 🔍 Verificando Redis...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Redis no está ejecutándose. Iniciando Redis...
    start "Redis Server" redis-server
    timeout /t 3 >nul
)

REM Crear directorio de logs
if not exist "logs" mkdir logs

echo 🚀 Iniciando API Gateway...
start "API Gateway" cmd /k "venv\Scripts\activate && python api_gateway.py"

echo ⏳ Esperando que el API Gateway inicie...
timeout /t 5 >nul

echo 🤖 Iniciando Bot de Telegram...
start "Telegram Bot" cmd /k "venv\Scripts\activate && python telegram_bot.py"

echo ✅ Sistema iniciado!
echo.
echo 📊 URLs de acceso:
echo    • API Gateway: http://localhost:5001
echo    • Health Check: http://localhost:5001/health
echo.
echo 📱 Para usar el bot:
echo    • Buscar @Somacorbot en Telegram
echo    • Enviar /start para comenzar
echo.
echo 🛑 Para detener: Ejecutar stop_bot_windows.bat
echo.
pause
