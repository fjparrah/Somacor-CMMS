#!/bin/bash

echo "🛑 Deteniendo Bot Omnicanal Somacor-CMMS"
echo "========================================="

# Detener API Gateway
if [ -f "api_gateway.pid" ]; then
    API_PID=$(cat api_gateway.pid)
    echo "🛑 Deteniendo API Gateway (PID: $API_PID)..."
    kill $API_PID 2>/dev/null
    rm -f api_gateway.pid
else
    echo "🛑 Deteniendo procesos de API Gateway..."
    pkill -f "python.*api_gateway.py" 2>/dev/null
fi

# Detener Bot de Telegram
if [ -f "telegram_bot.pid" ]; then
    BOT_PID=$(cat telegram_bot.pid)
    echo "🛑 Deteniendo Bot de Telegram (PID: $BOT_PID)..."
    kill $BOT_PID 2>/dev/null
    rm -f telegram_bot.pid
else
    echo "🛑 Deteniendo procesos del Bot de Telegram..."
    pkill -f "python.*telegram_bot.py" 2>/dev/null
fi

# Esperar un momento para que los procesos terminen
sleep 2

# Verificar que los procesos se hayan detenido
if pgrep -f "api_gateway.py" >/dev/null; then
    echo "⚠️ Forzando cierre del API Gateway..."
    pkill -9 -f "api_gateway.py"
fi

if pgrep -f "telegram_bot.py" >/dev/null; then
    echo "⚠️ Forzando cierre del Bot de Telegram..."
    pkill -9 -f "telegram_bot.py"
fi

echo ""
echo "✅ Todos los servicios han sido detenidos"
echo ""
echo "📝 Los logs se mantienen en el directorio logs/"
echo "🚀 Para reiniciar: ./start_bot_mac_linux.sh"
echo ""

# Opcional: Detener Redis si fue iniciado por el script
read -p "¿Quieres detener Redis también? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Deteniendo Redis..."
    if command -v brew >/dev/null 2>&1; then
        # Mac con Homebrew
        brew services stop redis
    else
        # Linux
        sudo systemctl stop redis-server 2>/dev/null || pkill redis-server
    fi
    echo "✅ Redis detenido"
fi
