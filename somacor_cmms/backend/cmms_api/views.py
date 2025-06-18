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
        # Primero, asegurar que el usuario esté autenticado.
        if not request.user or not request.user.is_authenticated:
            return False
        # Luego, verificar su rol. Se usa un bloque try-except por si el perfil no existe.
        try:
            return request.user.usuarios.idrol.nombrerol == 'Administrador'
        except Usuarios.DoesNotExist:
            return False

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
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (AttributeError, Token.DoesNotExist):
            return Response({"error": "Token no encontrado o usuario no autenticado."}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# --- Vistas del Modelo (ViewSets) ---

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser] # CAMBIO: Solo los admins pueden ver la lista de usuarios.

class RolViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# --- Vistas de Catálogos / Mantenedores ---
# CAMBIO: Se aplica el permiso IsAdminUser a todos los mantenedores.

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [IsAdminUser]

class FaenaViewSet(viewsets.ModelViewSet):
    queryset = Faenas.objects.all()
    serializer_class = FaenaSerializer
    permission_classes = [IsAdminUser]

class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TiposEquipo.objects.all()
    serializer_class = TipoEquipoSerializer
    permission_classes = [IsAdminUser]

class EstadoEquipoViewSet(viewsets.ModelViewSet):
    queryset = EstadosEquipo.objects.all()
    serializer_class = EstadoEquipoSerializer
    permission_classes = [IsAdminUser]

class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all()
    serializer_class = TipoTareaSerializer
    permission_classes = [IsAdminUser]

class TipoMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all()
    serializer_class = TipoMantenimientoOTSerializer
    permission_classes = [IsAdminUser]

class EstadoOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all()
    serializer_class = EstadoOrdenTrabajoSerializer
    permission_classes = [IsAdminUser]


# --- Vistas de Modelos Principales ---
# Estos pueden tener permisos más flexibles, pero por ahora se mantienen protegidos.

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuestos.objects.all()
    serializer_class = RepuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipos.objects.all()
    serializer_class = EquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all()
    serializer_class = TareaEstandarSerializer
    permission_classes = [permissions.IsAuthenticated]

class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all()
    serializer_class = PlanMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenesTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer
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
