# cmms_api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
import json
from .models import (
    Roles, Usuarios, TiposEquipo, Faenas, EstadosEquipo, Equipos,
    ChecklistTemplate, ChecklistCategory, ChecklistItem,
    ChecklistInstance, ChecklistAnswer, TiposTarea, TareasEstandar,
    PlanesMantenimiento, DetallesPlanMantenimiento, TiposMantenimientoOT,
    EstadosOrdenTrabajo, OrdenesTrabajo, ActividadesOrdenTrabajo, Agendas,
    EvidenciaOT
)

# --- Serializers Anteriores ---
class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

class UsuariosSerializer(serializers.ModelSerializer):
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)
    class Meta:
        model = Usuarios
        fields = ('idrol', 'nombrerol', 'departamento')
        
class UserSerializer(serializers.ModelSerializer):
    usuarios = UsuariosSerializer(required=False, allow_null=True)
    idrol = serializers.PrimaryKeyRelatedField(queryset=Roles.objects.all(), write_only=True, required=False, allow_null=True)
    nombrerol = serializers.CharField(source='usuarios.idrol.nombrerol', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password', 'usuarios', 'idrol', 'nombrerol')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        usuarios_data = validated_data.pop('usuarios', {})
        idrol = validated_data.pop('idrol', None)
        password = validated_data.pop('password', None)

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()

        assigned_role = None
        if idrol: 
            assigned_role = idrol
        elif 'idrol' in usuarios_data and usuarios_data['idrol']:
            assigned_role = usuarios_data['idrol']
        else:
            try:
                assigned_role = Roles.objects.get(nombrerol='Operador')
            except Roles.DoesNotExist:
                assigned_role = Roles.objects.first()
            
        if assigned_role:
            Usuarios.objects.create(user=user, idrol=assigned_role, departamento=usuarios_data.get('departamento', ''))
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

        usuarios_instance, created = Usuarios.objects.get_or_create(user=instance)

        if idrol:
            usuarios_instance.idrol = idrol
        
        if usuarios_data and 'departamento' in usuarios_data:
            usuarios_instance.departamento = usuarios_data['departamento']
        
        usuarios_instance.save()

        return instance

class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposEquipo
        fields = '__all__'

class FaenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faenas
        fields = '__all__'

class EstadoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosEquipo
        fields = '__all__'

class EquipoSerializer(serializers.ModelSerializer):
    tipo_equipo_nombre = serializers.CharField(source='idtipoequipo.nombretipo', read_only=True)
    faena_nombre = serializers.CharField(source='idfaenaactual.nombrefaena', read_only=True)
    estado_nombre = serializers.CharField(source='idestadoactual.nombreestado', read_only=True)
    
    class Meta:
        model = Equipos
        fields = '__all__'

# --- SERIALIZERS PARA EL MÓDULO DE CHECKLISTS ---

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
    """ Serializer para procesar las respuestas de un checklist. """
    item = serializers.IntegerField()
    class Meta:
        model = ChecklistAnswer
        fields = ['item', 'estado', 'observacion_item']

class ChecklistInstanceSerializer(serializers.ModelSerializer):
    """
    Serializer principal para crear y leer un checklist completado.
    Maneja la creación anidada de las respuestas y la subida de imágenes.
    """
    answers = ChecklistAnswerSerializer(many=True, write_only=True)
    
    # Campos de solo lectura para visualizar la información relacionada
    operador_nombre = serializers.CharField(source='operador.get_full_name', read_only=True)
    equipo_nombre = serializers.CharField(source='equipo.nombreequipo', read_only=True)
    template_nombre = serializers.CharField(source='template.nombre', read_only=True)
    
    # Campo para la imagen de evidencia
    imagen_evidencia = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    class Meta:
        model = ChecklistInstance
        # --- INICIO DE LA CORRECCIÓN ---
        # Se elimina 'operador' de la lista de campos.
        # El campo se sigue asignando en el método `create`, pero ya no forma parte
        # de los campos que el serializador espera recibir del frontend.
        fields = [
            'id_instance', 'template', 'equipo', 'fecha_inspeccion', 
            'horometro_inspeccion', 'lugar_inspeccion', 'observaciones_generales', 
            'fecha_creacion', 'answers', 'operador_nombre', 'equipo_nombre', 
            'template_nombre', 'imagen_evidencia'
        ]
        # --- FIN DE LA CORRECCIÓN ---

    def create(self, validated_data):
        """
        Sobrescribe el método de creación para manejar la creación anidada de
        la instancia del checklist, sus respuestas y la asignación del operador.
        """
        answers_data = validated_data.pop('answers')
        
        # Asignamos el usuario de la solicitud actual como el operador.
        # Esto es posible porque pasamos el contexto desde la vista.
        user = self.context["request"].user
        if user and user.is_authenticated:
            validated_data["operador"] = user
        else:
            # Manejar el caso de usuario no autenticado o no disponible
            # Podrías lanzar un error de validación o asignar un valor por defecto
            raise serializers.ValidationError("Usuario no autenticado para asignar como operador.")
        
        with transaction.atomic():
            instance = ChecklistInstance.objects.create(**validated_data)
            for answer_data in answers_data:
                item_id = answer_data.pop('item')
                item = ChecklistItem.objects.get(id_item=item_id)
                ChecklistAnswer.objects.create(instance=instance, item=item, **answer_data)
        return instance

# --- SERIALIZERS PARA AGENDA DE MANTENIMIENTO PREVENTIVO ---

class TipoTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposTarea
        fields = '__all__'

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
    class Meta:
        model = TiposMantenimientoOT
        fields = '__all__'

class EstadoOrdenTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosOrdenTrabajo
        fields = '__all__'

# --- SERIALIZERS PARA REGISTRO DE MANTENIMIENTOS ---

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

# --- SERIALIZER PARA EVIDENCIAS FOTOGRÁFICAS ---

class EvidenciaOTSerializer(serializers.ModelSerializer):
    usuario_subida_nombre = serializers.CharField(source='usuario_subida.get_full_name', read_only=True)
    orden_trabajo_numero = serializers.CharField(source='idordentrabajo.numeroot', read_only=True)
    
    class Meta:
        model = EvidenciaOT
        fields = '__all__'
        
    def create(self, validated_data):
        # Asignar automáticamente el usuario actual como quien sube la evidencia
        validated_data['usuario_subida'] = self.context['request'].user
        return super().create(validated_data)

