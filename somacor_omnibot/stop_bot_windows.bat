@echo off
echo 🛑 Deteniendo Bot Omnicanal Somacor-CMMS
echo =========================================

echo 🛑 Deteniendo procesos de Python...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im python3.exe >nul 2>&1

echo 🛑 Deteniendo Redis...
taskkill /f /im redis-server.exe >nul 2>&1

echo 🧹 Cerrando ventanas de comandos...
taskkill /f /fi "WindowTitle eq API Gateway*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Telegram Bot*" >nul 2>&1
taskkill /f /fi "WindowTitle eq Redis Server*" >nul 2>&1

echo ✅ Todos los servicios han sido detenidos
echo.
echo 🚀 Para reiniciar: Ejecutar start_bot_windows.bat
echo.
pause
