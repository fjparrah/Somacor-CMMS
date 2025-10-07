_gateway.py`
"""
API Gateway para el Bot Omnicanal de Somacor-CMMS

Este gateway recibe los mensajes de los usuarios, gestiona las sesiones de conversación
con Redis y decide si manejar la petición directamente (para interacciones simples)
o disparar un DAG de Airflow (para flujos de trabajo complejos).
"""

from flask import Flask, request, jsonify
from datetime import datetime
import uuid
from airflow.api.client.local_client import Client
from session_manager import RedisSessionManager

app = Flask(__name__)

# Cliente de Airflow y gestor de sesiones
airflow_client = Client(None, None)
session_manager = RedisSessionManager()

@app.route('/api/bot/message', methods=['POST'])
def handle_message():
    data = request.get_json()
    user_id = data.get('user_id', f'web_user_{uuid.uuid4()}')
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'Mensaje vacío'}), 400

    # Obtener la sesión del usuario
    session = session_manager.get_session(user_id) or {'state': 'idle', 'data': {}}

    # Lógica del enfoque híbrido
    intent = analyze_intent(message, session)

    if intent in ['send_greeting', 'send_help_message', 'unknown']:
        # Manejar interacciones simples directamente
        response_text = handle_simple_interaction(intent)
        return jsonify({'response': response_text, 'timestamp': datetime.now().isoformat()})
    else:
        # Disparar un DAG para flujos complejos
        dag_id = get_dag_id_for_intent(intent)
        run_id = f'manual__{uuid.uuid4()}'
        
        airflow_client.trigger_dag(
            dag_id=dag_id,
            run_id=run_id,
            conf={'user_id': user_id, 'message': message, 'session': session}
        )
        
        # Respuesta inmediata al usuario mientras se procesa el flujo
        response_text = get_processing_message(intent)
        return jsonify({'response': response_text, 'timestamp': datetime.now().isoformat()})

def analyze_intent(message, session):
    message_lower = message.lower().strip()
    state = session.get('state', 'idle')

    if state != 'idle':
        return state

    if 'reportar' in message_lower and 'falla' in message_lower:
        return 'reporting_fault'
    elif 'estado' in message_lower or 'consultar' in message_lower:
        return 'querying_ot'
    elif 'equipos' in message_lower or 'listar' in message_lower:
        return 'list_equipments'
    elif 'ayuda' in message_lower or 'help' in message_lower or '?' in message_lower:
        return 'send_help_message'
    elif 'hola' in message_lower or 'buenos' in message_lower or 'buenas' in message_lower:
        return 'send_greeting'
    else:
        return 'unknown'

def handle_simple_interaction(intent):
    if intent == 'send_greeting':
        return '¡Hola! 👋 Soy el asistente virtual de Somacor-CMMS. ¿En qué puedo ayudarte?'
    elif intent == 'send_help_message':
        return 'Puedes pedirme: \n- Reportar una falla\n- Consultar el estado de una OT\n- Listar los equipos'
    else:
        return 'No he entendido tu petición. Escribe "ayuda" para ver las opciones.'

def get_dag_id_for_intent(intent):
    if intent == 'reporting_fault':
        return 'report_fault_workflow'
    elif intent == 'querying_ot':
        return 'query_ot_status_workflow'
    elif intent == 'list_equipments':
        return 'list_equipments_workflow'
    else:
        return 'process_user_message' # DAG por defecto

def get_processing_message(intent):
    if intent == 'reporting_fault':
        return 'Iniciando el proceso de reporte de falla...'
    elif intent == 'querying_ot':
        return 'Consultando la orden de trabajo...'
    elif intent == 'list_equipments':
        return 'Obteniendo la lista de equipos...'
    else:
        return 'Procesando tu solicitud...'

@app.route('/api/bot/webhook', methods=['POST'])
def handle_webhook():
    data = request.get_json()
    user_id = data.get('user_id')
    response_message = data.get('message')

    # Aquí iría la lógica para enviar el mensaje de vuelta al usuario
    # a través del canal apropiado (e.g., WebSockets)
    print(f"Respuesta para {user_id}: {response_message}")

    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)



from notification_services.factory import get_notification_service
import asyncio

@app.route('/api/notify', methods=['POST'])
async def notify_user():
    data = request.get_json()
    service_name = data.get('service_name')
    user_id = data.get('user_id')
    message = data.get('message')

    if not all([service_name, user_id, message]):
        return jsonify({'error': 'Faltan parámetros: service_name, user_id, message'}), 400

    try:
        service = get_notification_service(service_name)
        await service.send_message(user_id, message)
        return jsonify({'status': 'ok', 'message': f'Notificación enviada a {user_id} a través de {service_name}.'})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Error al enviar la notificación: {str(e)}'}), 500

