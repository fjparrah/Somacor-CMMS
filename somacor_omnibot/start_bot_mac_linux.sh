#!/bin/bash

echo "🚀 Iniciando Bot Omnicanal Somacor-CMMS"
echo "========================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "api_gateway.py" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio somacor_omnibot"
    exit 1
fi

# Activar entorno virtual
echo "📦 Activando entorno virtual..."
source venv/bin/activate

# Verificar Redis
echo "🔍 Verificando Redis..."
if ! redis-cli ping >/dev/null 2>&1; then
    echo "⚠️ Redis no está ejecutándose. Iniciando Redis..."
    if command -v brew >/dev/null 2>&1; then
        # Mac con Homebrew
        brew services start redis
    else
        # Linux
        sudo systemctl start redis-server 2>/dev/null || redis-server --daemonize yes
    fi
    sleep 3
fi

# Crear directorio de logs
mkdir -p logs

echo "🚀 Iniciando API Gateway..."
nohup python api_gateway.py > logs/api_gateway.log 2>&1 &
API_PID=$!
echo $API_PID > api_gateway.pid

echo "⏳ Esperando que el API Gateway inicie..."
sleep 5

# Verificar que el API Gateway esté funcionando
if curl -s http://localhost:5001/health >/dev/null 2>&1; then
    echo "✅ API Gateway iniciado correctamente"
else
    echo "❌ Error: API Gateway no responde"
    exit 1
fi

echo "🤖 Iniciando Bot de Telegram..."
nohup python telegram_bot.py > logs/telegram_bot.log 2>&1 &
BOT_PID=$!
echo $BOT_PID > telegram_bot.pid

echo ""
echo "✅ Sistema iniciado correctamente!"
echo ""
echo "📊 URLs de acceso:"
echo "   • API Gateway: http://localhost:5001"
echo "   • Health Check: http://localhost:5001/health"
echo ""
echo "📱 Para usar el bot:"
echo "   • Buscar @Somacorbot en Telegram"
echo "   • Enviar /start para comenzar"
echo ""
echo "📝 Logs disponibles en:"
echo "   • API Gateway: logs/api_gateway.log"
echo "   • Telegram Bot: logs/telegram_bot.log"
echo ""
echo "🛑 Para detener: ./stop_bot_mac_linux.sh"
echo ""
echo "🔍 Para ver logs en tiempo real:"
echo "   tail -f logs/api_gateway.log"
echo "   tail -f logs/telegram_bot.log"
