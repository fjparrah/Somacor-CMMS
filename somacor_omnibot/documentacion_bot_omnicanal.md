# Documentación Técnica y Guía de Implementación del Bot Omnicanal para Somacor-CMMS

## 1. Introducción

Este documento proporciona una guía detallada para la implementación, configuración y mantenimiento del bot omnicanal desarrollado para Somacor-CMMS. El bot está diseñado para actuar como una interfaz inteligente entre los usuarios y el sistema CMMS, facilitando la gestión de tareas de mantenimiento a través de canales de mensajería como WhatsApp.

## 2. Arquitectura del Sistema

La arquitectura del bot se basa en un diseño modular que separa la lógica de negocio, la interfaz de usuario y la inteligencia artificial. Para una descripción detallada de la arquitectura, consulte el documento `arquitectura_bot_omnicanal.md`.

## 3. Guía de Implementación

### 3.1. Prerrequisitos

- Python 3.11+
- Cuenta de Twilio con la Sandbox de WhatsApp activada
- Repositorio de Somacor-CMMS clonado y configurado (Etapa 1)

### 3.2. Configuración del Entorno

1.  **Crear el directorio del proyecto**:

    ```bash
    mkdir somacor_omnibot
    cd somacor_omnibot
    ```

2.  **Crear y activar un entorno virtual de Python**:

    ```bash
    python3.11 -m venv venv
    source venv/bin/activate
    ```

3.  **Instalar las dependencias**:

    ```bash
    pip install Flask twilio requests
    ```

### 3.3. Código de la Aplicación

El núcleo del bot es una aplicación Flask que maneja las solicitudes entrantes de Twilio. El siguiente código (`app.py`) proporciona la funcionalidad básica del bot:

```python
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import os
import requests

app = Flask(__name__)

# Configuración de la API del CMMS
CMMS_API_BASE_URL = os.environ.get('CMMS_API_BASE_URL', 'http://localhost:8000/api/')

@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    incoming_msg = request.values.get('Body', '').lower()
    resp = MessagingResponse()
    msg = resp.message()

    # Lógica simple para el bot
    if 'hola' in incoming_msg:
        msg.body('¡Hola! Soy el bot de Somacor-CMMS. ¿En qué puedo ayudarte hoy?')
    elif 'estado' in incoming_msg:
        # Aquí se debería integrar con la API del CMMS para obtener el estado
        msg.body('Consultando el estado de tus tareas de mantenimiento...')
        # Ejemplo de llamada a la API (esto es un placeholder, se necesita implementar la lógica real)
        try:
            response = requests.get(f'{CMMS_API_BASE_URL}tasks/')
            if response.status_code == 200:
                tasks = response.json()
                if tasks:
                    msg.body(f'Tienes {len(tasks)} tareas pendientes. La primera es: {tasks[0].get("description")}')
                else:
                    msg.body('No se encontraron tareas pendientes.')
            else:
                msg.body(f'Error al conectar con el CMMS: {response.status_code}')
        except requests.exceptions.ConnectionError:
            msg.body('No se pudo conectar con el servicio CMMS. Por favor, inténtalo más tarde.')

    elif 'reportar falla' in incoming_msg:
        msg.body('Por favor, describe la falla detalladamente, incluyendo el equipo y la naturaleza del problema.')
    else:
        msg.body('No entendí tu mensaje. Puedes decir "hola", "estado" o "reportar falla".')

    return str(resp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

```

### 3.4. Ejecución y Exposición del Bot

1.  **Ejecutar la aplicación Flask**:

    ```bash
    source venv/bin/activate
    python app.py
    ```

2.  **Exponer el puerto local a Internet**:

    Para que Twilio pueda enviar webhooks a su aplicación local, necesita exponer el puerto 5000 a una URL pública. Esto se puede hacer utilizando una herramienta como `ngrok` o, en este caso, la herramienta `expose_port`.

    La URL generada será similar a `https://5000-xxxxxxxx.manus.computer`.

### 3.5. Configuración de Twilio

1.  **Acceda a su cuenta de Twilio** y navegue a la sección "Messaging" > "Try it out" > "Send a WhatsApp message".
2.  En la pestaña "Sandbox settings", pegue la URL pública generada en el campo "WHEN A MESSAGE COMES IN".
3.  Asegúrese de que el método esté configurado en `HTTP POST`.
4.  Guarde la configuración.

### 3.6. Prueba del Bot

Envíe un mensaje de WhatsApp al número de la Sandbox de Twilio. Puede probar los siguientes comandos:

-   `hola`
-   `estado`
-   `reportar falla`

El bot debería responder con los mensajes correspondientes.

## 4. Futuras Mejoras

-   **Integración completa con la API del CMMS**: Implementar la lógica para crear, actualizar y consultar datos reales en el sistema CMMS.
-   **Procesamiento de Lenguaje Natural (PLN)**: Integrar un motor de PLN como Rasa o una API de LLM para comprender una gama más amplia de entradas de usuario y gestionar diálogos más complejos.
-   **Autenticación de Usuarios**: Implementar un sistema para verificar la identidad de los usuarios y asegurar que solo puedan acceder a la información y realizar las acciones permitidas por sus roles.
-   **Soporte para Múltiples Canales**: Extender el bot para que funcione en otras plataformas de mensajería como Telegram o Slack.

## 5. Referencias

-   [Documento de Arquitectura del Bot Omnicanal](arquitectura_bot_omnicanal.md)
-   [Repositorio de Somacor-CMMS en GitHub](https://github.com/fjparrah/Somacor-CMMS)
-   [Documentación de Twilio para WhatsApp](https://www.twilio.com/docs/whatsapp)
-   [Documentación de Flask](https://flask.palletsprojects.com/)

