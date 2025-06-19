# cmms_api/serializers.py
# ARCHIVO MODIFICADO: Lógica de creación y actualización de UserSerializer mejorada.

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

# --- Serializers de Usuarios y Autenticación ---

class UsuariosSerializer(serializers.ModelSerializer):
    """ Serializer para leer el perfil extendido del usuario (modelo Usuarios). """
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)

    class Meta:
        model = Usuarios
        fields = ('idrol', 'nombrerol', 'idespecialidad', 'telefono')


class UserSerializer(serializers.ModelSerializer):
    """
    Serializador integral para el modelo User.
    Maneja la lectura, creación y actualización de Usuarios y su perfil asociado.
    """
    usuarios = UsuariosSerializer(read_only=True)
    rol_id = serializers.IntegerField(write_only=True, required=False)
    nombre_completo = serializers.CharField(source='first_name', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'is_active',
            'usuarios', # Perfil anidado de solo lectura.
            'password', 
            # Campos de solo escritura
            'rol_id', 'nombre_completo',
        )
        read_only_fields = ('first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}, 'required': False},
            'email': {'required': True},
            'nombre_completo': {'write_only': True} # Marcar explícitamente como de solo escritura
        }

    def create(self, validated_data):
        """
        Maneja la creación de un nuevo User y su perfil asociado.
        """
        with transaction.atomic():
            rol_id = validated_data.get('rol_id')
            if not rol_id:
                raise serializers.ValidationError({"rol_id": "El rol es un campo requerido."})
            
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data.get('password'),
                first_name=validated_data.get('first_name', ''), # Mapeado desde 'nombre_completo'
                is_active=validated_data.get('is_active', True)
            )
            
            rol_instance = Roles.objects.get(pk=rol_id)
            Usuarios.objects.create(user=user, idrol=rol_instance)

        return user

    def update(self, instance, validated_data):
        """
        Maneja la actualización de un User existente y su perfil.
        """
        with transaction.atomic():
            # Actualiza los campos del modelo User
            instance.username = validated_data.get('username', instance.username)
            instance.email = validated_data.get('email', instance.email)
            instance.is_active = validated_data.get('is_active', instance.is_active)
            
            # Mapea 'nombre_completo' a 'first_name'
            if 'first_name' in validated_data:
                instance.first_name = validated_data.get('first_name')
            
            # Actualiza la contraseña de forma segura
            if 'password' in validated_data and validated_data['password']:
                instance.set_password(validated_data['password'])
            
            instance.save()
            
            # Actualiza el rol en el perfil de Usuarios
            if 'rol_id' in validated_data:
                rol_id = validated_data.get('rol_id')
                profile = instance.usuarios
                profile.idrol = Roles.objects.get(pk=rol_id)
                profile.save()

        return instance

# --- El resto de los serializadores no necesitan cambios ---

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

# ... (y así sucesivamente para todos los demás serializadores que ya tenías)
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

class EquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipos
        fields = '__all__'

class TareaEstandarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TareasEstandar
        fields = '__all__'

class PlanMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanesMantenimiento
        fields = '__all__'

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrdenesTrabajo
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
