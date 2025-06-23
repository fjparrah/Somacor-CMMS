# cmms_api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import (
    Roles, Usuarios, TiposEquipo, Faenas, EstadosEquipo, Equipos,
    ChecklistTemplate, ChecklistCategory, ChecklistItem,
    ChecklistInstance, ChecklistAnswer, TiposTarea, TareasEstandar,
    PlanesMantenimiento, DetallesPlanMantenimiento, TiposMantenimientoOT,
    EstadosOrdenTrabajo, OrdenesTrabajo, ActividadesOrdenTrabajo, Agendas
)

# --- Serializers Anteriores ---
class RolSerializer(serializers.ModelSerializer):
    class Meta: model = Roles; fields = '__all__'

class UsuariosSerializer(serializers.ModelSerializer):
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)
    class Meta:
        model = Usuarios
        fields = ('idrol', 'nombrerol', 'departamento')
        
class UserSerializer(serializers.ModelSerializer):
    # Make 'usuarios' writable for creation, but read-only for updates
    usuarios = UsuariosSerializer(required=False, allow_null=True)
    idrol = serializers.PrimaryKeyRelatedField(queryset=Roles.objects.all(), write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'usuarios', 'idrol')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        usuarios_data = validated_data.pop('usuarios', {})
        idrol = validated_data.pop('idrol', None)
        password = validated_data.pop('password', None)

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()

        # Determine the role to assign
        assigned_role = None
        if idrol: # If a role is explicitly provided, use it
            assigned_role = idrol
        else: # Otherwise, try to assign a default role
            try:
                assigned_role = Roles.objects.get(nombrerol='Operador') # Or choose another default role name
            except Roles.DoesNotExist:
                assigned_role = Roles.objects.first() # Fallback to the first role if 'Operador' doesn't exist
            
        if assigned_role:
            Usuarios.objects.create(user=user, idrol=assigned_role, **usuarios_data)
        else:
            print("Advertencia: No se pudo asignar un rol al nuevo usuario. No hay roles definidos.")

        return user

    def update(self, instance, validated_data):
        usuarios_data = validated_data.pop('usuarios', None)
        idrol = validated_data.pop('idrol', None)
        password = validated_data.pop('password', None)

        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)

        if password:
            instance.set_password(password)
        instance.save()

        if usuarios_data is not None or idrol is not None:
            usuarios_instance, created = Usuarios.objects.get_or_create(user=instance)
            if idrol:
                usuarios_instance.idrol = idrol
            if usuarios_data:
                for attr, value in usuarios_data.items():
                    setattr(usuarios_instance, attr, value)
            usuarios_instance.save()

        return instance

class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta: model = TiposEquipo; fields = '__all__'

class FaenaSerializer(serializers.ModelSerializer):
    class Meta: model = Faenas; fields = '__all__'

class EstadoEquipoSerializer(serializers.ModelSerializer):
    class Meta: model = EstadosEquipo; fields = '__all__'

class EquipoSerializer(serializers.ModelSerializer):
    tipo_equipo_nombre = serializers.CharField(source='idtipoequipo.nombretipo', read_only=True)
    faena_nombre = serializers.CharField(source='idfaenaactual.nombrefaena', read_only=True)
    estado_nombre = serializers.CharField(source='idestadoactual.nombreestado', read_only=True)
    
    class Meta:
        model = Equipos
        fields = '__all__'

# --- NUEVOS SERIALIZERS PARA EL MÓDULO DE CHECKLISTS ---

class ChecklistItemSerializer(serializers.ModelSerializer):
    """ Serializer para un ítem individual del checklist. """
    class Meta:
        model = ChecklistItem
        fields = ['id_item', 'texto', 'es_critico', 'orden']

class ChecklistCategorySerializer(serializers.ModelSerializer):
    """ Serializer para una categoría, incluyendo sus ítems anidados. """
    items = ChecklistItemSerializer(many=True, read_only=True)
    class Meta:
        model = ChecklistCategory
        fields = ['id_category', 'nombre', 'orden', 'items']

class ChecklistTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer para la plantilla de checklist. Se usa para leer la plantilla
    completa con todas sus categorías e ítems.
    """
    categories = ChecklistCategorySerializer(many=True, read_only=True)
    tipo_equipo_nombre = serializers.CharField(source='tipo_equipo.nombretipo', read_only=True)
    class Meta:
        model = ChecklistTemplate
        fields = ['id_template', 'nombre', 'tipo_equipo', 'tipo_equipo_nombre', 'activo', 'categories']

class ChecklistAnswerSerializer(serializers.ModelSerializer):
    """ Serializer para enviar las respuestas de un checklist. """
    item = serializers.IntegerField(source='item.id_item')
    class Meta:
        model = ChecklistAnswer
        fields = ['item', 'estado', 'observacion_item']

class ChecklistInstanceSerializer(serializers.ModelSerializer):
    """
    Serializer principal para crear y leer un checklist completado.
    Maneja la creación anidada de las respuestas.
    """
    answers = ChecklistAnswerSerializer(many=True)
    
    # Campos de solo lectura para visualizar la información relacionada
    operador_nombre = serializers.CharField(source='operador.get_full_name', read_only=True)
    equipo_nombre = serializers.CharField(source='equipo.nombreequipo', read_only=True)
    template_nombre = serializers.CharField(source='template.nombre', read_only=True)
    # También incluimos las respuestas leídas para ver un checklist ya completado
    answers_read = ChecklistAnswerSerializer(source='answers', many=True, read_only=True)

    class Meta:
        model = ChecklistInstance
        fields = [
            'id_instance', 'template', 'equipo', 'operador', 'fecha_inspeccion', 
            'horometro_inspeccion', 'lugar_inspeccion', 'observaciones_generales', 
            'fecha_creacion', 'answers', 'answers_read', 'operador_nombre', 'equipo_nombre', 'template_nombre'
        ]
        extra_kwargs = {
            'answers': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Sobrescribe el método de creación para manejar la creación anidada de
        la instancia del checklist y todas sus respuestas en una sola transacción.
        """
        answers_data = validated_data.pop('answers')
        with transaction.atomic():
            instance = ChecklistInstance.objects.create(**validated_data)
            for answer_data in answers_data:
                item_id = answer_data.pop('item')['id_item']
                item = ChecklistItem.objects.get(id_item=item_id)
                ChecklistAnswer.objects.create(instance=instance, item=item, **answer_data)
        return instance

# --- NUEVOS SERIALIZERS PARA AGENDA DE MANTENIMIENTO PREVENTIVO ---

class TipoTareaSerializer(serializers.ModelSerializer):
    class Meta: model = TiposTarea; fields = '__all__'

class TareaEstandarSerializer(serializers.ModelSerializer):
    tipo_tarea_nombre = serializers.CharField(source='idtipotarea.nombretipotarea', read_only=True)
    class Meta:
        model = TareasEstandar
        fields = '__all__'

class PlanMantenimientoSerializer(serializers.ModelSerializer):
    tipo_equipo_nombre = serializers.CharField(source='idtipoequipo.nombretipo', read_only=True)
    class Meta:
        model = PlanesMantenimiento
        fields = '__all__'

class DetallesPlanMantenimientoSerializer(serializers.ModelSerializer):
    plan_nombre = serializers.CharField(source='idplanmantenimiento.nombreplan', read_only=True)
    tarea_nombre = serializers.CharField(source='idtareaestandar.nombretarea', read_only=True)
    class Meta:
        model = DetallesPlanMantenimiento
        fields = '__all__'

class TipoMantenimientoOTSerializer(serializers.ModelSerializer):
    class Meta: model = TiposMantenimientoOT; fields = '__all__'

class EstadoOrdenTrabajoSerializer(serializers.ModelSerializer):
    class Meta: model = EstadosOrdenTrabajo; fields = '__all__'

# --- NUEVOS SERIALIZERS PARA REGISTRO DE MANTENIMIENTOS ---

class ActividadOrdenTrabajoSerializer(serializers.ModelSerializer):
    orden_trabajo_numero = serializers.CharField(source='idordentrabajo.numeroot', read_only=True)
    tarea_nombre = serializers.CharField(source='idtareaestandar.nombretarea', read_only=True)
    tecnico_nombre = serializers.CharField(source='idtecnicoejecutor.get_full_name', read_only=True)
    
    class Meta:
        model = ActividadesOrdenTrabajo
        fields = '__all__'

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='idequipo.nombreequipo', read_only=True)
    plan_nombre = serializers.CharField(source='idplanorigen.nombreplan', read_only=True)
    tipo_mantenimiento_nombre = serializers.CharField(source='idtipomantenimientoot.nombretipomantenimientoot', read_only=True)
    estado_nombre = serializers.CharField(source='idestadoot.nombreestadoot', read_only=True)
    solicitante_nombre = serializers.CharField(source='idsolicitante.get_full_name', read_only=True)
    tecnico_nombre = serializers.CharField(source='idtecnicoasignado.get_full_name', read_only=True)
    
    # Incluir actividades relacionadas
    actividades = ActividadOrdenTrabajoSerializer(source='actividadesordentrabajo_set', many=True, read_only=True)
    
    class Meta:
        model = OrdenesTrabajo
        fields = '__all__'

class AgendaSerializer(serializers.ModelSerializer):
    equipo_nombre = serializers.CharField(source='idequipo.nombreequipo', read_only=True)
    orden_trabajo_numero = serializers.CharField(source='idordentrabajo.numeroot', read_only=True)
    plan_nombre = serializers.CharField(source='idplanmantenimiento.nombreplan', read_only=True)
    usuario_asignado_nombre = serializers.CharField(source='idusuarioasignado.get_full_name', read_only=True)
    usuario_creador_nombre = serializers.CharField(source='idusuariocreador.get_full_name', read_only=True)
    
    class Meta:
        model = Agendas
        fields = '__all__'



