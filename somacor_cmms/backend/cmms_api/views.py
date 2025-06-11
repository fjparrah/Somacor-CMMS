from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import *
from .serializers import *

# --- Clases de Permisos Personalizados ---

class IsAdminUser(permissions.BasePermission):
    """ Permiso que solo permite el acceso a usuarios con el rol 'Administrador'. """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated: return False
        try: return request.user.usuarios.idrol.nombrerol == 'Administrador'
        except Usuarios.DoesNotExist: return False

# --- Vistas de Autenticación ---
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        # [Mejora] Se incluye el objeto 'user' completo con su rol en la respuesta del login
        user_data = UserSerializer(user, context={'request': request}).data
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_data})

class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        if hasattr(request.user, 'auth_token') and request.user.auth_token:
            request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny] # Cualquiera puede registrarse
    serializer_class = UserCreateSerializer

# --- ViewSets para todos los modelos ---

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('usuarios__idrol').all().order_by('id')
    permission_classes = [IsAdminUser] # Solo los administradores pueden gestionar usuarios
    def get_serializer_class(self):
        return UserCreateSerializer if self.action == 'create' else UserSerializer

class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated] # Cualquiera autenticado puede ver los roles

# --- Viewsets para "Mantenedores" (Catálogos) ---
# Permisos relajados para que cualquier usuario autenticado pueda leerlos.
class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [permissions.IsAuthenticated]

class FaenaViewSet(viewsets.ModelViewSet):
    queryset = Faenas.objects.all()
    serializer_class = FaenaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TiposEquipo.objects.all()
    serializer_class = TipoEquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class EstadoEquipoViewSet(viewsets.ModelViewSet):
    queryset = EstadosEquipo.objects.all()
    serializer_class = EstadoEquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all()
    serializer_class = TipoTareaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all()
    serializer_class = TipoMantenimientoOTSerializer
    permission_classes = [permissions.IsAuthenticated]

class EstadoOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all()
    serializer_class = EstadoOrdenTrabajoSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- Viewsets de Operaciones Principales ---

class EquipoViewSet(viewsets.ModelViewSet):
    """
    [CORREGIDO] ViewSet de Equipos que usa diferentes serializers para lectura y escritura.
    """
    queryset = Equipos.objects.select_related(
        'idtipoequipo', 'idfaenaactual', 'idestadoactual', 'idoperarioasignadopredeterminado__user'
    ).all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return EquipoWriteSerializer
        return EquipoSerializer

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    """
    [MEJORADO] ViewSet de OT que usa diferentes serializers.
    """
    queryset = OrdenesTrabajo.objects.select_related(
        'idequipo', 'idtipomantenimientoot', 'idestadoot', 'idsolicitante__user'
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return OrdenTrabajoWriteSerializer
        return OrdenTrabajoSerializer

# --- El resto de los Viewsets pueden permanecer simples por ahora ---

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuestos.objects.all()
    serializer_class = RepuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all()
    serializer_class = TareaEstandarSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all()
    serializer_class = PlanMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class DetallePlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all()
    serializer_class = DetallePlanMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class ActividadOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = ActividadesOrdenTrabajo.objects.all()
    serializer_class = ActividadOTSerializer
    permission_classes = [permissions.IsAuthenticated]

class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agendas.objects.all()
    serializer_class = AgendaSerializer
    permission_classes = [permissions.IsAuthenticated]

class HistorialHorometrosViewSet(viewsets.ModelViewSet):
    queryset = HistorialHorometros.objects.all()
    serializer_class = HistorialHorometrosSerializer
    permission_classes = [permissions.IsAuthenticated]

class HistorialEstadosEquipoViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstadosEquipo.objects.all()
    serializer_class = HistorialEstadosEquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentoAdjuntoViewSet(viewsets.ModelViewSet):
    queryset = DocumentosAdjuntos.objects.all()
    serializer_class = DocumentoAdjuntoSerializer
    permission_classes = [permissions.IsAuthenticated]

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificaciones.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]