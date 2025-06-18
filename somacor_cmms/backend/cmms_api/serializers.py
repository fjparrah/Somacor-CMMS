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
    idrol = serializers.IntegerField(write_only=True)
    nombreCompleto = serializers.CharField(write_only=True, required=True, source='first_name')

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'nombreCompleto', 'idrol')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'email': {'required': True}
        }

    def validate_idrol(self, value):
        """ Valida que el rol con el ID proporcionado exista en la base de datos. """
        if not Roles.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El rol seleccionado no es válido.")
        return value

    def create(self, validated_data):
        """
        Sobrescribe el método create para manejar la creación de un perfil
        de usuario donde la relación OneToOne es también la llave primaria.
        """
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'password': validated_data['password'],
            'first_name': validated_data.get('first_name', '')
        }
        rol_id = validated_data['idrol']

        try:
            with transaction.atomic():
                # 1. Se crea el usuario de Django.
                user = User.objects.create_user(**user_data)
                
                # 2. Se obtiene la instancia del Rol.
                rol_instance = Roles.objects.get(pk=rol_id)

                # --- CORRECCIÓN FINAL Y DEFINITIVA ---
                # 3. Se instancia el perfil de Usuarios, pasando los campos que no son la llave primaria.
                profile = Usuarios(idrol=rol_instance)
                
                # 4. Se asigna explícitamente el pk del usuario recién creado al pk del perfil.
                #    Como 'idusuario' es el PK, esto los enlazará correctamente.
                profile.pk = user.pk
                
                # 5. Se guarda el perfil ya con su llave primaria y relaciones asignadas.
                profile.save()
                
        except Exception as e:
            # Si algo falla, se lanza un error de validación claro.
            raise serializers.ValidationError({"error": f"No se pudo completar la transacción de registro: {str(e)}"})

        return user


class UsuariosSerializer(serializers.ModelSerializer):
    """ Serializer para el modelo de perfil de usuario (Usuarios). """
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)

    class Meta:
        model = Usuarios
        fields = ['idrol', 'nombrerol', 'idespecialidad', 'telefono']


class UserSerializer(serializers.ModelSerializer):
    """ Serializer para el modelo User de Django, incluyendo el perfil anidado. """
    usuarios = UsuariosSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'usuarios']


# --- Serializers de Catálogos (Simples) ---

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
