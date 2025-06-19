# cmms_api/views.py
# ARCHIVO MODIFICADO PARA DESACTIVAR LOS PERMISOS DE AUTENTICACIÓN

from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import *
from .serializers import *

# --- Vistas de Autenticación ---
class CustomAuthToken(ObtainAuthToken):
    """
    Vista para obtener un token de autenticación.
    Devuelve el token y los datos del usuario.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user_data = UserSerializer(user, context={'request': request}).data
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_data})

class LogoutView(generics.GenericAPIView):
    """
    Vista para invalidar el token de autenticación del usuario (cerrar sesión).
    """
    permission_classes = [permissions.AllowAny] # MODIFICADO: Permite a cualquiera intentar cerrar sesión

    def post(self, request):
        try:
            if request.user and request.user.is_authenticated:
                request.user.auth_token.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (AttributeError, Token.DoesNotExist):
            return Response({"error": "Token no encontrado o usuario no autenticado."}, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    """
    Vista para registrar nuevos usuarios.
    Actualmente desactivada en el frontend, pero el endpoint sigue existiendo.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Permite el registro sin autenticación

# --- ViewSets para los modelos de la aplicación ---
# MODIFICADO: Se ha cambiado 'permission_classes' a 'permissions.AllowAny' en todos los ViewSets
# para deshabilitar la autenticación durante el desarrollo y permitir el acceso a los formularios.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

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
