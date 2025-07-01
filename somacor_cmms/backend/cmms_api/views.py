# cmms_api/views.py

from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models, transaction
from .models import *
from .serializers import *

# --- Vistas de Autenticación ---
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user_data = UserSerializer(user, context={'request': request}).data
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_data})

class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        if request.user and request.user.is_authenticated:
            request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- ViewSets de Catálogos ---
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class RolViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.AllowAny]

class FaenaViewSet(viewsets.ModelViewSet):
    queryset = Faenas.objects.all()
    serializer_class = FaenaSerializer
    permission_classes = [permissions.AllowAny]

class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TiposEquipo.objects.all()
    serializer_class = TipoEquipoSerializer
    permission_classes = [permissions.AllowAny]

class EstadoEquipoViewSet(viewsets.ModelViewSet):
    queryset = EstadosEquipo.objects.all()
    serializer_class = EstadoEquipoSerializer
    permission_classes = [permissions.AllowAny]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipos.objects.all()
    serializer_class = EquipoSerializer
    permission_classes = [permissions.AllowAny]

# --- NUEVOS VIEWSETS PARA EL MÓDULO DE CHECKLISTS ---

class ChecklistTemplateViewSet(viewsets.ModelViewSet):
    queryset = ChecklistTemplate.objects.all()
    serializer_class = ChecklistTemplateSerializer
    permission_classes = [permissions.AllowAny]

class ChecklistCategoryViewSet(viewsets.ModelViewSet):
    queryset = ChecklistCategory.objects.all()
    serializer_class = ChecklistCategorySerializer
    permission_classes = [permissions.AllowAny]

class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
    permission_classes = [permissions.AllowAny]

class ChecklistInstanceViewSet(viewsets.ModelViewSet):
    queryset = ChecklistInstance.objects.all()
    serializer_class = ChecklistInstanceSerializer
    permission_classes = [permissions.AllowAny]

class ChecklistAnswerViewSet(viewsets.ModelViewSet):
    queryset = ChecklistAnswer.objects.all()
    serializer_class = ChecklistAnswerSerializer
    permission_classes = [permissions.AllowAny]

# --- NUEVOS VIEWSETS PARA AGENDA DE MANTENIMIENTO PREVENTIVO ---

class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all()
    serializer_class = TipoTareaSerializer
    permission_classes = [permissions.AllowAny]

class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all()
    serializer_class = TareaEstandarSerializer
    permission_classes = [permissions.AllowAny]

class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all()
    serializer_class = PlanMantenimientoSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=True, methods=['get'], url_path='generar-agenda')
    def generar_agenda(self, request, pk=None):
        """
        Genera eventos de agenda basados en el plan de mantenimiento y los equipos asociados
        """
        plan = self.get_object()
        equipos = Equipos.objects.filter(idtipoequipo=plan.idtipoequipo, activo=True)
        
        eventos_creados = []
        for equipo in equipos:
            detalles = DetallesPlanMantenimiento.objects.filter(
                idplanmantenimiento=plan, 
                activo=True
            ).order_by('intervalohorasoperacion')
            
            for detalle in detalles:
                # Calcular próxima fecha de mantenimiento basada en horometro actual
                horas_restantes = detalle.intervalohorasoperacion - (equipo.horometroactual % detalle.intervalohorasoperacion)
                if horas_restantes == detalle.intervalohorasoperacion:
                    horas_restantes = 0  # Ya es tiempo de mantenimiento
                
                # Estimar fecha (asumiendo 8 horas de operación por día)
                dias_estimados = horas_restantes / 8
                fecha_estimada = timezone.now().date() + timezone.timedelta(days=int(dias_estimados))
                
                # Crear evento en agenda
                evento = Agendas.objects.create(
                    tituloevento=f"Mantenimiento {detalle.idtareaestandar.nombretarea} - {equipo.nombreequipo}",
                    fechahorainicio=timezone.datetime.combine(fecha_estimada, timezone.datetime.min.time().replace(hour=8)),
                    fechahorafin=timezone.datetime.combine(fecha_estimada, timezone.datetime.min.time().replace(hour=8)) + timezone.timedelta(minutes=detalle.idtareaestandar.tiempoestimadominutos),
                    descripcionevento=f"Mantenimiento preventivo programado cada {detalle.intervalohorasoperacion} horas",
                    tipoevento="Mantenimiento Preventivo",
                    colorevento="#28a745",
                    idequipo=equipo,
                    idplanmantenimiento=plan,
                    idusuariocreador=request.user if request.user.is_authenticated else User.objects.first()
                )
                eventos_creados.append(AgendaSerializer(evento).data)
        
        return Response({
            'message': f'Se crearon {len(eventos_creados)} eventos de agenda',
            'eventos': eventos_creados
        })

class DetallesPlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all()
    serializer_class = DetallesPlanMantenimientoSerializer
    permission_classes = [permissions.AllowAny]

class TiposMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all()
    serializer_class = TipoMantenimientoOTSerializer
    permission_classes = [permissions.AllowAny]

class EstadosOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all()
    serializer_class = EstadoOrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

# --- NUEVOS VIEWSETS PARA REGISTRO DE MANTENIMIENTOS ---

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenesTrabajo.objects.all().order_by('-fechacreacionot')
    serializer_class = OrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='crear-desde-plan')
    def crear_desde_plan(self, request):
        """
        Crea una orden de trabajo desde un plan de mantenimiento
        """
        id_equipo = request.data.get('idequipo')
        id_plan = request.data.get('idplanorigen')
        horometro_disparo = request.data.get('horometro')
        id_tecnico = request.data.get('idtecnicoasignado')
        id_solicitante = request.data.get('idsolicitante')
        
        if not all([id_equipo, id_plan, horometro_disparo, id_tecnico, id_solicitante]):
            return Response({'error': 'Faltan datos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            equipo = Equipos.objects.get(pk=id_equipo)
            plan = PlanesMantenimiento.objects.get(pk=id_plan)
            tecnico = User.objects.get(pk=id_tecnico)
            solicitante = User.objects.get(pk=id_solicitante)
            
            # Obtener o crear registros necesarios
            try:
                estado_inicial = EstadosOrdenTrabajo.objects.get(nombreestadoot='Abierta')
            except EstadosOrdenTrabajo.DoesNotExist:
                estado_inicial = EstadosOrdenTrabajo.objects.create(
                    nombreestadoot='Abierta', 
                    descripcion='OT recién creada.'
                )
            
            try:
                tipo_ot = TiposMantenimientoOT.objects.get(nombretipomantenimientoot='Preventivo')
            except TiposMantenimientoOT.DoesNotExist:
                tipo_ot = TiposMantenimientoOT.objects.create(
                    nombretipomantenimientoot='Preventivo', 
                    descripcion='Mantenimiento planificado.'
                )
            
            # Buscar tareas aplicables para el horometro
            detalles_aplicables = DetallesPlanMantenimiento.objects.filter(
                idplanmantenimiento=plan,
                intervalohorasoperacion__lte=int(horometro_disparo),
                intervalohorasoperacion__gt=0,
                activo=True
            ).annotate(
                residuo=models.Value(int(horometro_disparo)) % models.F('intervalohorasoperacion')
            ).filter(residuo=0)
            
            if not detalles_aplicables.exists():
                return Response({
                    'error': 'No se encontraron tareas aplicables para el intervalo.'
                }, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                nueva_ot = OrdenesTrabajo.objects.create(
                    numeroot=f"OT-{equipo.codigointerno or equipo.idequipo}-{timezone.now().strftime('%Y%m%d%H%M')}",
                    idequipo=equipo,
                    idplanorigen=plan,
                    idtipomantenimientoot=tipo_ot,
                    idestadoot=estado_inicial,
                    horometro=horometro_disparo,
                    idsolicitante=solicitante,
                    idtecnicoasignado=tecnico,
                    fechaemision=timezone.now().date(),
                    fechaejecucion=request.data.get('fechaejecucion')
                )
                
                # Crear actividades para cada tarea aplicable
                for detalle in detalles_aplicables:
                    ActividadesOrdenTrabajo.objects.create(
                        idordentrabajo=nueva_ot,
                        idtareaestandar=detalle.idtareaestandar,
                        descripcionactividad=detalle.idtareaestandar.descripciontarea or detalle.idtareaestandar.nombretarea,
                        tiempoestimadominutos=detalle.idtareaestandar.tiempoestimadominutos
                    )
            
            serializer = self.get_serializer(nueva_ot)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Ocurrió un error inesperado: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='reportar-falla')
    def reportar_falla(self, request):
        """
        Crea una orden de trabajo correctiva por falla reportada
        """
        id_equipo = request.data.get('idequipo')
        descripcion = request.data.get('descripcionproblemareportado')

        if not all([id_equipo, descripcion]):
            return Response({'error': 'Faltan datos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            equipo = Equipos.objects.get(pk=id_equipo)
            # Asignar automáticamente el usuario actual como solicitante
            solicitante = request.user

            # Obtener o crear el estado y tipo de OT
            try:
                estado_inicial = EstadosOrdenTrabajo.objects.get(nombreestadoot='Abierta')
            except EstadosOrdenTrabajo.DoesNotExist:
                estado_inicial = EstadosOrdenTrabajo.objects.create(
                    nombreestadoot='Abierta', 
                    descripcion='OT recién creada.'
                )
            
            try:
                tipo_ot = TiposMantenimientoOT.objects.get(nombretipomantenimientoot='Correctivo')
            except TiposMantenimientoOT.DoesNotExist:
                tipo_ot = TiposMantenimientoOT.objects.create(
                    nombretipomantenimientoot='Correctivo', 
                    descripcion='Mantenimiento por falla no planificada.'
                )

            with transaction.atomic():
                nueva_ot = OrdenesTrabajo.objects.create(
                    numeroot=f"OT-CORR-{equipo.codigointerno or equipo.idequipo}-{timezone.now().strftime('%Y%m%d%H%M')}",
                    idequipo=equipo,
                    idtipomantenimientoot=tipo_ot,
                    idestadoot=estado_inicial,
                    descripcionproblemareportado=descripcion,
                    fechareportefalla=timezone.now(),
                    idsolicitante=solicitante,
                    idtecnicoasignado=solicitante,
                    prioridad=request.data.get('prioridad', 'Alta')
                )
            
            serializer = self.get_serializer(nueva_ot)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Ocurrió un error inesperado: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ActividadOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = ActividadesOrdenTrabajo.objects.all()
    serializer_class = ActividadOrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agendas.objects.all()
    serializer_class = AgendaSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='calendario')
    def calendario(self, request):
        """
        Retorna eventos de agenda en formato compatible con calendarios
        """
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        queryset = self.get_queryset()
        
        if start_date:
            queryset = queryset.filter(fechahorainicio__gte=start_date)
        if end_date:
            queryset = queryset.filter(fechahorafin__lte=end_date)
        
        eventos = []
        for agenda in queryset:
            eventos.append({
                'id': agenda.idagenda,
                'title': agenda.tituloevento,
                'start': agenda.fechahorainicio.isoformat(),
                'end': agenda.fechahorafin.isoformat(),
                'description': agenda.descripcionevento,
                'color': agenda.colorevento,
                'allDay': agenda.esdiacompleto,
                'extendedProps': {
                    'equipo': agenda.equipo_nombre if hasattr(agenda, 'equipo_nombre') else None,
                    'tipo': agenda.tipoevento,
                    'orden_trabajo': agenda.orden_trabajo_numero if hasattr(agenda, 'orden_trabajo_numero') else None
                }
            })
        
        return Response(eventos)


# --- VIEWSET PARA EVIDENCIAS FOTOGRÁFICAS ---

class EvidenciaOTViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar evidencias fotográficas de órdenes de trabajo
    """
    queryset = EvidenciaOT.objects.all()
    serializer_class = EvidenciaOTSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        orden_trabajo_id = self.request.query_params.get('orden_trabajo', None)
        if orden_trabajo_id:
            queryset = queryset.filter(idordentrabajo=orden_trabajo_id)
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

