from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Repuestos, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, UsoRepuestosActividadOT,
    HistorialHorometros, HistorialEstadosEquipo, Agendas, DocumentosAdjuntos,
    Notificaciones
)

# --- Personalización del Panel de Administración ---

# Define una vista "inline" para el perfil de usuario.
# Esto permite ver y editar el perfil de 'Usuarios' (con su rol)
# directamente desde la página de edición del 'User' de Django.
class UsuariosInline(admin.StackedInline):
    model = Usuarios
    can_delete = False
    verbose_name_plural = 'Perfil de Usuario CMMS'

# Define un nuevo panel de administración para el modelo User que incluye el perfil
class UserAdmin(BaseUserAdmin):
    inlines = (UsuariosInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_rol')

    # Función para mostrar el rol del usuario en la lista de usuarios.
    @admin.display(description='Rol')
    def get_rol(self, obj):
        try:
            return obj.usuarios.idrol.nombrerol
        except Usuarios.DoesNotExist:
            return 'No asignado'

# Vuelve a registrar el modelo User con la nueva configuración personalizada.
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# --- Paneles de Administración Personalizados para Modelos Clave ---

@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    list_display = ('idrol', 'nombrerol', 'descripcionrol')
    search_fields = ('nombrerol',)

@admin.register(Equipos)
class EquiposAdmin(admin.ModelAdmin):
    list_display = ('nombreequipo', 'codigointerno', 'idtipoequipo', 'idfaenaactual', 'idestadoactual', 'activo')
    list_filter = ('idtipoequipo', 'idfaenaactual', 'idestadoactual', 'activo')
    search_fields = ('nombreequipo', 'codigointerno', 'marca', 'modelo')
    list_per_page = 20

@admin.register(OrdenesTrabajo)
class OrdenesTrabajoAdmin(admin.ModelAdmin):
    list_display = ('numeroot', 'idequipo', 'idtipomantenimientoot', 'idestadoot', 'fechacreacionot', 'prioridad')
    list_filter = ('idestadoot', 'idtipomantenimientoot', 'prioridad', 'fechacreacionot')
    search_fields = ('numeroot', 'idequipo__nombreequipo', 'descripcionproblemareportado')
    date_hierarchy = 'fechacreacionot'
    list_per_page = 25

@admin.register(PlanesMantenimiento)
class PlanesMantenimientoAdmin(admin.ModelAdmin):
    list_display = ('nombreplan', 'idequipo', 'activo', 'version')
    list_filter = ('activo', 'idequipo__idfaenaactual__nombrefaena')
    search_fields = ('nombreplan', 'idequipo__nombreequipo')

@admin.register(Repuestos)
class RepuestosAdmin(admin.ModelAdmin):
    list_display = ('codigorepuesto', 'descripcionrepuesto', 'stockactual', 'unidadmedida', 'activo')
    search_fields = ('codigorepuesto', 'descripcionrepuesto', 'numeropartefabricante')
    list_filter = ('activo',)

@admin.register(Faenas)
class FaenasAdmin(admin.ModelAdmin):
    list_display = ('nombrefaena', 'ubicacion', 'contacto', 'activa')
    list_filter = ('activa',)
    search_fields = ('nombrefaena', 'ubicacion')

# --- Registros Simples para los Demás Modelos ---
# Para los modelos que no requieren una personalización compleja,
# un registro simple es suficiente para que aparezcan en el panel.

admin.site.register(Especialidades)
admin.site.register(TiposEquipo)
admin.site.register(EstadosEquipo)
admin.site.register(TiposTarea)
admin.site.register(TiposMantenimientoOT)
admin.site.register(EstadosOrdenTrabajo)
admin.site.register(TareasEstandar)
admin.site.register(DetallesPlanMantenimiento)
admin.site.register(ActividadesOrdenTrabajo)
admin.site.register(UsoRepuestosActividadOT)
admin.site.register(HistorialHorometros)
admin.site.register(HistorialEstadosEquipo)
admin.site.register(Agendas)
admin.site.register(DocumentosAdjuntos)
admin.site.register(Notificaciones)

# Nota: El modelo 'Usuarios' no se registra de forma independiente porque ya lo hemos
# integrado "inline" en el panel del modelo 'User' de Django para una mejor gestión.
