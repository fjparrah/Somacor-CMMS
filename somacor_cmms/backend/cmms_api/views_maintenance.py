# cmms_api/views_maintenance.py
# Vistas adicionales para el flujo de mantenimiento

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Count, Avg
from .models import *
from .serializers import *
import datetime

class MantenimientoWorkflowViewSet(viewsets.ViewSet):
    """
    ViewSet para manejar el flujo completo de mantenimiento
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        """
        Retorna información del dashboard de mantenimiento
        """
        # Estadísticas generales
        total_equipos = Equipos.objects.filter(activo=True).count()
        equipos_operativos = Equipos.objects.filter(
            activo=True, 
            idestadoactual__nombreestado='Operativo'
        ).count()
        
        # Órdenes de trabajo
        ots_abiertas = OrdenesTrabajo.objects.filter(
            idestadoot__nombreestadoot__in=['Abierta', 'Asignada']
        ).count()
        
        ots_vencidas = OrdenesTrabajo.objects.filter(
            fechaejecucion__lt=timezone.now().date(),
            idestadoot__nombreestadoot__in=['Abierta', 'Asignada']
        ).count()
        
        # Mantenimientos próximos (próximos 7 días)
        fecha_limite = timezone.now().date() + datetime.timedelta(days=7)
        mantenimientos_proximos = Agendas.objects.filter(
            fechahorainicio__date__lte=fecha_limite,
            fechahorainicio__date__gte=timezone.now().date(),
            tipoevento='Mantenimiento Preventivo'
        ).count()
        
        # Equipos por estado
        equipos_por_estado = EstadosEquipo.objects.annotate(
            cantidad=Count('equipos')
        ).values('nombreestado', 'cantidad')
        
        # OTs por tipo de mantenimiento
        ots_por_tipo = TiposMantenimientoOT.objects.annotate(
            cantidad=Count('ordenestrabajo')
        ).values('nombretipomantenimientoot', 'cantidad')

        return Response({
            'estadisticas_generales': {
                'total_equipos': total_equipos,
                'equipos_operativos': equipos_operativos,
                'ots_abiertas': ots_abiertas,
                'ots_vencidas': ots_vencidas,
                'mantenimientos_proximos': mantenimientos_proximos
            },
            'equipos_por_estado': list(equipos_por_estado),
            'ots_por_tipo': list(ots_por_tipo)
        })

    @action(detail=False, methods=['get'], url_path='equipos-criticos')
    def equipos_criticos(self, request):
        """
        Retorna equipos que requieren atención inmediata
        """
        # Equipos fuera de servicio
        equipos_fuera_servicio = Equipos.objects.filter(
            activo=True,
            idestadoactual__nombreestado__in=['Fuera de Servicio', 'En Reparación']
        ).select_related('idtipoequipo', 'idestadoactual', 'idfaenaactual')

        # Equipos con OTs vencidas
        equipos_ots_vencidas = Equipos.objects.filter(
            ordenestrabajo__fechaejecucion__lt=timezone.now().date(),
            ordenestrabajo__idestadoot__nombreestadoot__in=['Abierta', 'Asignada']
        ).distinct().select_related('idtipoequipo', 'idestadoactual', 'idfaenaactual')

        # Equipos con mantenimientos atrasados (más de 100 horas sobre el intervalo)
        # Esta lógica se puede mejorar con cálculos más precisos
        equipos_mantenimiento_atrasado = []

        return Response({
            'equipos_fuera_servicio': EquipoSerializer(equipos_fuera_servicio, many=True).data,
            'equipos_ots_vencidas': EquipoSerializer(equipos_ots_vencidas, many=True).data,
            'equipos_mantenimiento_atrasado': equipos_mantenimiento_atrasado
        })

    @action(detail=False, methods=['post'], url_path='completar-actividad')
    def completar_actividad(self, request):
        """
        Marca una actividad como completada y registra los resultados
        """
        actividad_id = request.data.get('actividad_id')
        observaciones = request.data.get('observaciones', '')
        tiempo_real = request.data.get('tiempo_real_minutos')
        resultado_inspeccion = request.data.get('resultado_inspeccion')
        medicion_valor = request.data.get('medicion_valor')
        unidad_medicion = request.data.get('unidad_medicion')

        try:
            actividad = ActividadesOrdenTrabajo.objects.get(idactividadot=actividad_id)
            
            with transaction.atomic():
                actividad.completada = True
                actividad.fechafinactividad = timezone.now()
                actividad.observacionesactividad = observaciones
                actividad.tiemporealminutos = tiempo_real
                actividad.resultadoinspeccion = resultado_inspeccion
                actividad.medicionvalor = medicion_valor
                actividad.unidadmedicion = unidad_medicion
                actividad.idtecnicoejecutor = request.user if request.user.is_authenticated else None
                actividad.save()

                # Verificar si todas las actividades de la OT están completadas
                ot = actividad.idordentrabajo
                actividades_pendientes = ot.actividadesordentrabajo_set.filter(completada=False).count()
                
                if actividades_pendientes == 0:
                    # Marcar OT como completada
                    estado_completada = EstadosOrdenTrabajo.objects.get_or_create(
                        nombreestadoot='Completada',
                        defaults={'descripcion': 'Orden de trabajo finalizada'}
                    )[0]
                    
                    ot.idestadoot = estado_completada
                    ot.fechacompletado = timezone.now()
                    ot.save()

            return Response({
                'message': 'Actividad completada exitosamente',
                'actividad': ActividadOrdenTrabajoSerializer(actividad).data
            })

        except ActividadesOrdenTrabajo.DoesNotExist:
            return Response(
                {'error': 'Actividad no encontrada'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al completar actividad: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='actualizar-horometro')
    def actualizar_horometro(self, request):
        """
        Actualiza el horómetro de un equipo
        """
        equipo_id = request.data.get('equipo_id')
        nuevo_horometro = request.data.get('horometro')
        observaciones = request.data.get('observaciones', '')

        try:
            equipo = Equipos.objects.get(idequipo=equipo_id)
            horometro_anterior = equipo.horometroactual
            
            equipo.horometroactual = nuevo_horometro
            equipo.save()

            # Aquí se podría crear un registro de historial de horómetros
            # HistorialHorometros.objects.create(...)

            return Response({
                'message': 'Horómetro actualizado exitosamente',
                'equipo': equipo.nombreequipo,
                'horometro_anterior': horometro_anterior,
                'horometro_nuevo': nuevo_horometro
            })

        except Equipos.DoesNotExist:
            return Response(
                {'error': 'Equipo no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al actualizar horómetro: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='reportes/eficiencia')
    def reporte_eficiencia(self, request):
        """
        Genera reporte de eficiencia de mantenimiento
        """
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            fecha_fin = timezone.now().date()
            fecha_inicio = fecha_fin - datetime.timedelta(days=30)
        
        # OTs completadas en el período
        ots_completadas = OrdenesTrabajo.objects.filter(
            fechacompletado__date__range=[fecha_inicio, fecha_fin],
            idestadoot__nombreestadoot='Completada'
        )
        
        # Tiempo promedio de resolución
        tiempo_promedio = ots_completadas.aggregate(
            promedio=Avg('tiempototalminutos')
        )['promedio'] or 0
        
        # Eficiencia por tipo de mantenimiento
        eficiencia_por_tipo = {}
        for tipo in TiposMantenimientoOT.objects.all():
            ots_tipo = ots_completadas.filter(idtipomantenimientoot=tipo)
            eficiencia_por_tipo[tipo.nombretipomantenimientoot] = {
                'total_ots': ots_tipo.count(),
                'tiempo_promedio': ots_tipo.aggregate(
                    promedio=Avg('tiempototalminutos')
                )['promedio'] or 0
            }

        return Response({
            'periodo': {
                'fecha_inicio': fecha_inicio,
                'fecha_fin': fecha_fin
            },
            'total_ots_completadas': ots_completadas.count(),
            'tiempo_promedio_resolucion': tiempo_promedio,
            'eficiencia_por_tipo': eficiencia_por_tipo
        })

