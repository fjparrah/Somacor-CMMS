# cmms_api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_maintenance import MantenimientoWorkflowViewSet
from .views_checklist import ChecklistWorkflowViewSet

router = DefaultRouter()

# Registros de la API básica
router.register(r'users', views.UserViewSet)
router.register(r'roles', views.RolViewSet)
router.register(r'faenas', views.FaenaViewSet)
router.register(r'tipos-equipo', views.TipoEquipoViewSet)
router.register(r'estados-equipo', views.EstadoEquipoViewSet)
router.register(r'equipos', views.EquipoViewSet)

# Checklist API routes
router.register(r'checklist-templates', views.ChecklistTemplateViewSet)
router.register(r'checklist-categories', views.ChecklistCategoryViewSet)
router.register(r'checklist-items', views.ChecklistItemViewSet)
router.register(r'checklist-instances', views.ChecklistInstanceViewSet)
router.register(r'checklist-answers', views.ChecklistAnswerViewSet)

# Agenda de Mantenimiento Preventivo API routes
router.register(r'tipos-tarea', views.TipoTareaViewSet)
router.register(r'tareas-estandar', views.TareaEstandarViewSet)
router.register(r'planes-mantenimiento', views.PlanMantenimientoViewSet)
router.register(r'detalles-plan-mantenimiento', views.DetallesPlanMantenimientoViewSet)
router.register(r'tipos-mantenimiento-ot', views.TiposMantenimientoOTViewSet)
router.register(r'estados-orden-trabajo', views.EstadosOrdenTrabajoViewSet)

# Registro de Mantenimientos API routes
router.register(r'ordenes-trabajo', views.OrdenTrabajoViewSet)
router.register(r'actividades-ot', views.ActividadOrdenTrabajoViewSet)
router.register(r'agendas', views.AgendaViewSet)

# Workflows especializados
router.register(r'mantenimiento-workflow', MantenimientoWorkflowViewSet, basename='mantenimiento-workflow')
router.register(r'checklist-workflow', ChecklistWorkflowViewSet, basename='checklist-workflow')

# URLs de la API
urlpatterns = [
    path('', include(router.urls)),
    # Rutas de autenticación
    path('login/', views.CustomAuthToken.as_view(), name='auth_token'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

