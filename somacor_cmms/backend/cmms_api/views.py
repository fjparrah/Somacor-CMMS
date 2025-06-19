# cmms_api/views.py
# ARCHIVO MODIFICADO: Se apunta RegisterView al nuevo UserSerializer.

from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import *
# Se importa el UserSerializer mejorado. UserRegistrationSerializer ya no existe.
from .serializers import *

# --- Vistas de Autenticación (sin cambios) ---
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

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # MODIFICADO: Ahora usa el serializador unificado para manejar el registro.
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# --- Vistas del Modelo (ViewSets) ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    # MODIFICADO: Usa el serializador unificado que maneja C/R/U/D.
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# El resto de los ViewSets (RolViewSet, FaenaViewSet, etc.) permanecen igual
# ya que sus permisos ya estaban establecidos en AllowAny.

class RolViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.AllowAny]

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadSerializer
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

class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all()
    serializer_class = TipoTareaSerializer
    permission_classes = [permissions.AllowAny]

class TipoMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all()
    serializer_class = TipoMantenimientoOTSerializer
    permission_classes = [permissions.AllowAny]

class EstadoOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all()
    serializer_class = EstadoOrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuestos.objects.all()
    serializer_class = RepuestoSerializer
    permission_classes = [permissions.AllowAny]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipos.objects.all()
    serializer_class = EquipoSerializer
    permission_classes = [permissions.AllowAny]

class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all()
    serializer_class = TareaEstandarSerializer
    permission_classes = [permissions.AllowAny]

class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all()
    serializer_class = PlanMantenimientoSerializer
    permission_classes = [permissions.AllowAny]

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenesTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

class DetallePlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all()
    serializer_class = DetallePlanMantenimientoSerializer
    permission_classes = [permissions.AllowAny]

class ActividadOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = ActividadesOrdenTrabajo.objects.all()
    serializer_class = ActividadOTSerializer
    permission_classes = [permissions.AllowAny]

class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agendas.objects.all()
    serializer_class = AgendaSerializer
    permission_classes = [permissions.AllowAny]

class HistorialHorometrosViewSet(viewsets.ModelViewSet):
    queryset = HistorialHorometros.objects.all()
    serializer_class = HistorialHorometrosSerializer
    permission_classes = [permissions.AllowAny]

class HistorialEstadosEquipoViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstadosEquipo.objects.all()
    serializer_class = HistorialEstadosEquipoSerializer
    permission_classes = [permissions.AllowAny]

class DocumentoAdjuntoViewSet(viewsets.ModelViewSet):
    queryset = DocumentosAdjuntos.objects.all()
    serializer_class = DocumentoAdjuntoSerializer
    permission_classes = [permissions.AllowAny]

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificaciones.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.AllowAny]
