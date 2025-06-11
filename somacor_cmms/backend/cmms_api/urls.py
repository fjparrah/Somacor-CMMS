from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# El router de Django REST Framework se encarga de generar
# automáticamente las URLs para cada ViewSet.
router = DefaultRouter()

# Registra una ruta para cada modelo de la aplicación.
router.register(r'users', views.UserViewSet)
router.register(r'roles', views.RolViewSet)
router.register(r'especialidades', views.EspecialidadViewSet)
router.register(r'faenas', views.FaenaViewSet)
router.register(r'tipos-equipo', views.TipoEquipoViewSet)
router.register(r'estados-equipo', views.EstadoEquipoViewSet)
router.register(r'tipos-tarea', views.TipoTareaViewSet)
router.register(r'tipos-mantenimiento-ot', views.TipoMantenimientoOTViewSet)
router.register(r'estados-orden-trabajo', views.EstadoOrdenTrabajoViewSet)
router.register(r'repuestos', views.RepuestoViewSet)
router.register(r'equipos', views.EquipoViewSet)
router.register(r'tareas-estandar', views.TareaEstandarViewSet)
router.register(r'planes-mantenimiento', views.PlanMantenimientoViewSet)
router.register(r'detalles-plan-mantenimiento', views.DetallePlanMantenimientoViewSet)
router.register(r'ordenes-trabajo', views.OrdenTrabajoViewSet)
router.register(r'actividades-ot', views.ActividadOrdenTrabajoViewSet)
router.register(r'agendas', views.AgendaViewSet)
router.register(r'historial-horometros', views.HistorialHorometrosViewSet)
router.register(r'historial-estados-equipo', views.HistorialEstadosEquipoViewSet)
router.register(r'documentos', views.DocumentoAdjuntoViewSet)
router.register(r'notificaciones', views.NotificacionViewSet)


# Las URLs de la API son determinadas automáticamente por el router.
# Además, se incluyen las rutas para login, logout y registro.
urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.CustomAuthToken.as_view(), name='auth_token'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('register/', views.RegisterView.as_view(), name='register'),
]