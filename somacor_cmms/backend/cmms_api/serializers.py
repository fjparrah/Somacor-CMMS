from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Repuestos, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, UsoRepuestosActividadOT,
    HistorialHorometros, HistorialEstadosEquipo, Agendas, DocumentosAdjuntos,
    Notificaciones
)

# --- Serializers de Catálogos (Simples) ---
# Estos serializers se usan para los "mantenedores" y no requieren lógica compleja.

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidades
        fields = '__all__'

class FaenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faenas
        fields = '__all__'

class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposEquipo
        fields = '__all__'

class EstadoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosEquipo
        fields = '__all__'
        
class TipoTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposTarea
        fields = '__all__'

class TipoMantenimientoOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposMantenimientoOT
        fields = '__all__'

class EstadoOrdenTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosOrdenTrabajo
        fields = '__all__'

class RepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repuestos
        fields = '__all__'
        
class TareaEstandarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TareasEstandar
        fields = '__all__'

# --- Serializers de Autenticación y Usuarios ---

class UserSerializer(serializers.ModelSerializer):
    """Serializer para LEER datos de usuario, mostrando el nombre del rol."""
    rol = RolSerializer(source='usuarios.idrol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'rol']

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer para CREAR usuarios, aceptando el ID del rol."""
    rol_id = serializers.IntegerField(write_only=True)
    nombre_completo = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'nombre_completo', 'rol_id')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_rol_id(self, value):
        if not Roles.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El rol especificado no existe.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        rol_id = validated_data.pop('rol_id')
        nombre_completo = validated_data.pop('nombre_completo')
        rol = Roles.objects.get(pk=rol_id)
        
        # Divide el nombre completo
        first_name = nombre_completo.split(' ')[0]
        last_name = ' '.join(nombre_completo.split(' ')[1:])
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=first_name,
            last_name=last_name
        )
        if rol.nombrerol == 'Administrador':
            user.is_staff = True
            user.is_superuser = True
        user.save()
        Usuarios.objects.create(user=user, idrol=rol, activo=True)
        return user

# --- Serializers para Equipos (Lectura y Escritura) ---

class EquipoSerializer(serializers.ModelSerializer):
    """Serializer para LEER equipos, mostrando nombres de relaciones."""
    idtipoequipo = TipoEquipoSerializer(read_only=True)
    idfaenaactual = FaenaSerializer(read_only=True)
    idestadoactual = EstadoEquipoSerializer(read_only=True)
    idoperarioasignadopredeterminado = UserSerializer(read_only=True)

    class Meta:
        model = Equipos
        fields = '__all__'

class EquipoWriteSerializer(serializers.ModelSerializer):
    """[CORREGIDO] Serializer para CREAR/ACTUALIZAR equipos, aceptando IDs."""
    idtipoequipo = serializers.PrimaryKeyRelatedField(queryset=TiposEquipo.objects.all(), source='idtipoequipo')
    idfaenaactual = serializers.PrimaryKeyRelatedField(queryset=Faenas.objects.all(), source='idfaenaactual', required=False, allow_null=True)
    idestadoactual = serializers.PrimaryKeyRelatedField(queryset=EstadosEquipo.objects.all(), source='idestadoactual')
    # El operario es opcional
    idoperarioasignadopredeterminado = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all(), source='idoperarioasignadopredeterminado', required=False, allow_null=True)

    class Meta:
        model = Equipos
        fields = (
            'codigointerno', 'nombreequipo', 'idtipoequipo', 'marca', 'modelo',
            'aniofabricacion', 'fechaadquisicion', 'idfaenaactual',
            'horometroactual', 'idestadoactual', 'idoperarioasignadopredeterminado',
            'imagenurl', 'observaciones', 'activo'
        )

# --- Serializers para Órdenes de Trabajo ---

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    """Serializer para LEER OTs."""
    idequipo = EquipoSerializer(read_only=True)
    idtipomantenimientoot = TipoMantenimientoOTSerializer(read_only=True)
    idestadoot = EstadoOrdenTrabajoSerializer(read_only=True)
    idsolicitante = UserSerializer(read_only=True)

    class Meta:
        model = OrdenesTrabajo
        fields = '__all__'

class OrdenTrabajoWriteSerializer(serializers.ModelSerializer):
    """[NUEVO] Serializer para CREAR/ACTUALIZAR OTs."""
    idequipo = serializers.PrimaryKeyRelatedField(queryset=Equipos.objects.all())
    idtipomantenimientoot = serializers.PrimaryKeyRelatedField(queryset=TiposMantenimientoOT.objects.all())
    idestadoot = serializers.PrimaryKeyRelatedField(queryset=EstadosOrdenTrabajo.objects.all())
    idsolicitante = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())
    idreportadopor = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all(), required=False, allow_null=True)
    idtecnicoasignadoprincipal = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = OrdenesTrabajo
        # Asegúrate de incluir todos los campos que el frontend enviará
        fields = (
            'numeroot', 'idequipo', 'idtipomantenimientoot', 'idestadoot',
            'idsolicitante', 'idreportadopor', 'idtecnicoasignadoprinciapl',
            'fechareportefalla', 'fechaprogramadainicio',
            'descripcionproblemareportado', 'prioridad'
        )


# --- Otros Serializers Complejos (si los hubiera) ---

class PlanMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanesMantenimiento
        fields = '__all__'

class DetallePlanMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallesPlanMantenimiento
        fields = '__all__'

class ActividadOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadesOrdenTrabajo
        fields = '__all__'

class AgendaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='idagenda', read_only=True)
    title = serializers.CharField(source='tituloevento')
    start = serializers.DateTimeField(source='fechahorainicio')
    end = serializers.DateTimeField(source='fechahorafin')
    type = serializers.CharField(source='tipoevento', allow_blank=True, required=False)
    notes = serializers.CharField(source='descripcionevento', allow_blank=True, required=False)

    class Meta:
        model = Agendas
        fields = ('id', 'title', 'start', 'end', 'type', 'notes', 'idequipo', 'idordentrabajo', 'idusuarioasignado')

class HistorialHorometrosSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialHorometros
        fields = '__all__'

class HistorialEstadosEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialEstadosEquipo
        fields = '__all__'

class DocumentoAdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentosAdjuntos
        fields = '__all__'
        
class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificaciones
        fields = '__all__'