#!/usr/bin/env python
"""
Script para cargar datos de prueba en el sistema CMMS Somacor
Ejecutar con: python manage.py shell < load_sample_data.py
"""

from django.contrib.auth.models import User
from cmms_api.models import *
from datetime import datetime, timedelta

def load_sample_data():
    print('=== CARGANDO DATOS DE PRUEBA CMMS SOMACOR ===')
    
    # Crear usuario sistema para eventos si no existe
    usuario_sistema, created = User.objects.get_or_create(
        username='sistema_agenda',
        defaults={
            'email': 'sistema@somacor.com',
            'first_name': 'Sistema',
            'last_name': 'Agenda'
        }
    )
    if created:
        print('✅ Usuario sistema_agenda creado')
    
    # Obtener usuarios existentes
    try:
        admin_user = User.objects.get(username='admin')
        operador_user = User.objects.get(username='operador_reportes')
        tecnico_user = User.objects.get(username='Tecnico1')
    except User.DoesNotExist:
        print('❌ Error: Usuarios requeridos no encontrados')
        return
    
    # Obtener equipos, tipos y estados
    equipos = list(Equipos.objects.all()[:5])
    if not equipos:
        print('❌ Error: No hay equipos disponibles')
        return
        
    tipo_preventivo = TiposMantenimientoOT.objects.get(idtipomantenimientoot=1)
    tipo_correctivo = TiposMantenimientoOT.objects.get(idtipomantenimientoot=2)
    
    estado_abierta = EstadosOrdenTrabajo.objects.get(nombreestadoot='Abierta')
    estado_proceso = EstadosOrdenTrabajo.objects.get(nombreestadoot='En Progreso')
    estado_completada = EstadosOrdenTrabajo.objects.get(nombreestadoot='Completada')
    
    # Datos de órdenes de trabajo de prueba
    ordenes_data = [
        {
            'equipo': equipos[0],
            'descripcion': 'Mantenimiento preventivo 10,000 km - Cambio de aceite y filtros',
            'prioridad': 'Media',
            'dias': 3,
            'solicitante': admin_user,
            'tipo': tipo_preventivo,
            'estado': estado_abierta
        },
        {
            'equipo': equipos[1] if len(equipos) > 1 else equipos[0],
            'descripcion': 'Inspección de frenos y sistema de dirección',
            'prioridad': 'Alta',
            'dias': 1,
            'solicitante': tecnico_user,
            'tipo': tipo_preventivo,
            'estado': estado_abierta
        },
        {
            'equipo': equipos[2] if len(equipos) > 2 else equipos[0],
            'descripcion': 'Reparación de falla en sistema hidráulico - Pérdida de presión',
            'prioridad': 'Alta',
            'dias': 1,
            'solicitante': operador_user,
            'tipo': tipo_correctivo,
            'estado': estado_proceso
        },
        {
            'equipo': equipos[3] if len(equipos) > 3 else equipos[0],
            'descripcion': 'Cambio de neumático delantero derecho - Pinchazo',
            'prioridad': 'Media',
            'dias': 2,
            'solicitante': operador_user,
            'tipo': tipo_correctivo,
            'estado': estado_completada
        },
        {
            'equipo': equipos[4] if len(equipos) > 4 else equipos[0],
            'descripcion': 'Mantenimiento de motor y revisión general',
            'prioridad': 'Media',
            'dias': 7,
            'solicitante': admin_user,
            'tipo': tipo_preventivo,
            'estado': estado_abierta
        }
    ]
    
    # Crear órdenes de trabajo
    ordenes_creadas = []
    for i, data in enumerate(ordenes_data):
        fecha_ejecucion = datetime.now().date() + timedelta(days=data['dias'])
        codigo_equipo = data['equipo'].codigointerno or f'EQ{data["equipo"].idequipo:03d}'
        numero_ot = f'OT-{data["tipo"].descripcion[:4].upper()}-{codigo_equipo}-{datetime.now().strftime("%Y%m%d")}-{i+1:03d}'
        
        # Verificar si ya existe
        if not OrdenesTrabajo.objects.filter(numeroot=numero_ot).exists():
            ot = OrdenesTrabajo.objects.create(
                numeroot=numero_ot,
                idequipo=data['equipo'],
                idtipomantenimientoot=data['tipo'],
                idestadoot=data['estado'],
                fechaemision=datetime.now().date(),
                fechaejecucion=fecha_ejecucion,
                idsolicitante=data['solicitante'],
                prioridad=data['prioridad'],
                descripcionproblemareportado=data['descripcion']
            )
            ordenes_creadas.append(ot)
            print(f'✅ OT creada: {ot.numeroot}')
        else:
            print(f'⚠️  OT ya existe: {numero_ot}')
    
    # Crear eventos de agenda para las órdenes
    for ot in ordenes_creadas:
        if not Agendas.objects.filter(idordentrabajo=ot).exists():
            fecha_inicio = datetime.combine(ot.fechaejecucion, datetime.min.time())
            fecha_fin = fecha_inicio + timedelta(hours=4)
            
            tipo_mant = ot.idtipomantenimientoot.descripcion
            if 'planificado' in tipo_mant.lower():
                tipo_titulo = 'Mantenimiento Preventivo'
            elif 'falla' in tipo_mant.lower():
                tipo_titulo = 'Mantenimiento Correctivo'
            else:
                tipo_titulo = 'Mantenimiento'
            
            evento = Agendas.objects.create(
                tituloevento=f'{tipo_titulo} - {ot.idequipo.nombreequipo}',
                descripcionevento=f'OT: {ot.numeroot}\n{ot.descripcionproblemareportado}',
                fechahorainicio=fecha_inicio,
                fechahorafin=fecha_fin,
                idusuariocreador=usuario_sistema,
                idordentrabajo=ot
            )
            print(f'✅ Evento creado: {evento.tituloevento}')
    
    print(f'\n🎯 Datos de prueba cargados exitosamente')
    print(f'📊 Órdenes de trabajo: {OrdenesTrabajo.objects.count()}')
    print(f'📅 Eventos de agenda: {Agendas.objects.count()}')

if __name__ == '__main__':
    load_sample_data()
