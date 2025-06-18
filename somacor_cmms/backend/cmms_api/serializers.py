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

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios. Maneja la creación del
    usuario de Django y del perfil 'Usuarios' asociado en una sola transacción.
    """
    # Campo para recibir el ID del rol desde el frontend. Es de solo escritura.
    idrol = serializers.IntegerField(write_only=True)
    
    # Hacemos que los campos del modelo User sean requeridos para el registro
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)

    class Meta:
        model = User
        # Campos que se esperan del frontend para el registro
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'idrol')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'last_name': {'required': False} # El apellido es opcional
        }

    def validate_idrol(self, value):
        """ Valida que el rol con el ID proporcionado exista en la base de datos. """
        if not Roles.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El rol seleccionado no es válido.")
        return value

    def create(self, validated_data):
        """
        Sobrescribe el método create para manejar la lógica de registro.
        Crea el objeto User y el perfil Usuarios asociado de forma atómica.
        """
        # Extraemos el idrol, ya que no pertenece al modelo User
        idrol = validated_data.pop('idrol')
        
        try:
            # transaction.atomic asegura que ambas operaciones (crear User y Usuarios)
            # se completen con éxito. Si una falla, la otra se revierte.
            with transaction.atomic():
                # Creamos el usuario usando el método helper que hashea la contraseña
                user = User.objects.create_user(
                    username=validated_data['username'],
                    email=validated_data['email'],
                    password=validated_data['password'],
                    first_name=validated_data.get('first_name', ''),
                    last_name=validated_data.get('last_name', '')
                )
                
                # Obtenemos la instancia del Rol a partir del ID
                rol = Roles.objects.get(pk=idrol)
                
                # Creamos el perfil de usuario personalizado
                Usuarios.objects.create(idusuario=user, idrol=rol)
                
        except Exception as e:
            # Si algo falla durante la transacción, se lanza un error de validación
            raise serializers.ValidationError({"error": f"No se pudo crear el usuario: {str(e)}"})

        return user


class UsuariosSerializer(serializers.ModelSerializer):
    """ Serializer para el modelo de perfil de usuario (Usuarios). """
    # Permite mostrar el nombre del rol en lugar de solo su ID.
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)

    class Meta:
        model = Usuarios
        fields = ['idrol', 'nombrerol', 'idespecialidad', 'telefono', 'cargo']


class UserSerializer(serializers.ModelSerializer):
    """ Serializer para el modelo User de Django, incluyendo el perfil anidado. """
    # Anidamos el serializer del perfil 'Usuarios' para incluirlo en la respuesta.
    usuarios = UsuariosSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'usuarios']


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


# --- Serializers de Modelos Principales ---

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
    # Mapeo de campos para compatibilidad con librerías de calendario en frontend
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
