from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import *

class EquipoModelTest(TestCase):
    """Pruebas para el modelo Equipo"""
    
    def setUp(self):
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        
    def test_crear_equipo(self):
        """Prueba la creación de un equipo"""
        equipo = Equipos.objects.create(
            nombreequipo="Test Equipo",
            codigointerno="TEST-001",
            marca="Test Marca",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo
        )
        self.assertEqual(equipo.nombreequipo, "Test Equipo")
        self.assertEqual(str(equipo), "Test Equipo (TEST-001)")
        
    def test_equipo_sin_codigo_interno(self):
        """Prueba la creación de un equipo sin código interno"""
        equipo = Equipos.objects.create(
            nombreequipo="Test Equipo 2",
            patente="ABC123",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo
        )
        self.assertEqual(str(equipo), "Test Equipo 2 (ABC123)")

class PlanMantenimientoModelTest(TestCase):
    """Pruebas para el modelo PlanMantenimiento"""
    
    def setUp(self):
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.tipo_tarea = TiposTarea.objects.create(nombretipotarea="Inspección")
        
    def test_crear_plan_mantenimiento(self):
        """Prueba la creación de un plan de mantenimiento"""
        plan = PlanesMantenimiento.objects.create(
            nombreplan="Plan Test",
            descripcionplan="Plan de prueba",
            idtipoequipo=self.tipo_equipo
        )
        self.assertEqual(plan.nombreplan, "Plan Test")
        self.assertTrue(plan.activo)
        
    def test_crear_tarea_estandar(self):
        """Prueba la creación de una tarea estándar"""
        tarea = TareasEstandar.objects.create(
            nombretarea="Revisar aceite",
            descripciontarea="Verificar nivel de aceite del motor",
            idtipotarea=self.tipo_tarea,
            tiempoestimadominutos=30
        )
        self.assertEqual(tarea.nombretarea, "Revisar aceite")
        self.assertEqual(tarea.tiempoestimadominutos, 30)

class OrdenTrabajoModelTest(TestCase):
    """Pruebas para el modelo OrdenTrabajo"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        self.equipo = Equipos.objects.create(
            nombreequipo="Test Equipo",
            codigointerno="TEST-001",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo
        )
        self.tipo_mantenimiento = TiposMantenimientoOT.objects.create(
            nombretipomantenimientoot="Preventivo"
        )
        self.estado_ot = EstadosOrdenTrabajo.objects.create(
            nombreestadoot="Abierta"
        )
        
    def test_crear_orden_trabajo(self):
        """Prueba la creación de una orden de trabajo"""
        ot = OrdenesTrabajo.objects.create(
            numeroot="OT-TEST-001",
            idequipo=self.equipo,
            idtipomantenimientoot=self.tipo_mantenimiento,
            idestadoot=self.estado_ot,
            idsolicitante=self.user,
            horometro=1000
        )
        self.assertEqual(ot.numeroot, "OT-TEST-001")
        self.assertEqual(ot.horometro, 1000)
        self.assertEqual(str(ot), "OT-TEST-001 - Test Equipo")

class ChecklistModelTest(TestCase):
    """Pruebas para los modelos de Checklist"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        self.equipo = Equipos.objects.create(
            nombreequipo="Test Equipo",
            codigointerno="TEST-001",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo
        )
        
    def test_crear_checklist_template(self):
        """Prueba la creación de una plantilla de checklist"""
        template = ChecklistTemplate.objects.create(
            nombre="Checklist Minicargador",
            tipo_equipo=self.tipo_equipo
        )
        self.assertEqual(template.nombre, "Checklist Minicargador")
        self.assertTrue(template.activo)
        
    def test_crear_checklist_category(self):
        """Prueba la creación de una categoría de checklist"""
        template = ChecklistTemplate.objects.create(
            nombre="Checklist Test",
            tipo_equipo=self.tipo_equipo
        )
        category = ChecklistCategory.objects.create(
            template=template,
            nombre="Motor",
            orden=1
        )
        self.assertEqual(category.nombre, "Motor")
        self.assertEqual(str(category), "1. Motor")
        
    def test_crear_checklist_item(self):
        """Prueba la creación de un ítem de checklist"""
        template = ChecklistTemplate.objects.create(
            nombre="Checklist Test",
            tipo_equipo=self.tipo_equipo
        )
        category = ChecklistCategory.objects.create(
            template=template,
            nombre="Motor",
            orden=1
        )
        item = ChecklistItem.objects.create(
            category=category,
            texto="Nivel de aceite",
            es_critico=True,
            orden=1
        )
        self.assertEqual(item.texto, "Nivel de aceite")
        self.assertTrue(item.es_critico)

class APITestCase(APITestCase):
    """Pruebas para las APIs REST"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        
    def test_get_equipos_list(self):
        """Prueba obtener la lista de equipos"""
        url = reverse('equipos-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_create_equipo(self):
        """Prueba crear un equipo via API"""
        url = reverse('equipos-list')
        data = {
            'nombreequipo': 'Nuevo Equipo API',
            'codigointerno': 'API-001',
            'marca': 'Test Marca',
            'idtipoequipo': self.tipo_equipo.pk,
            'idestadoactual': self.estado_equipo.pk,
            'activo': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Equipos.objects.count(), 1)
        
    def test_get_tipos_equipo_list(self):
        """Prueba obtener la lista de tipos de equipo"""
        url = reverse('tiposequipo-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_create_plan_mantenimiento(self):
        """Prueba crear un plan de mantenimiento via API"""
        url = reverse('planesmantenimiento-list')
        data = {
            'nombreplan': 'Plan API Test',
            'descripcionplan': 'Plan creado via API',
            'idtipoequipo': self.tipo_equipo.pk,
            'activo': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PlanesMantenimiento.objects.count(), 1)

class IntegrationTest(TestCase):
    """Pruebas de integración para flujos completos"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Minicargador")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        self.equipo = Equipos.objects.create(
            nombreequipo="Test Equipo",
            codigointerno="TEST-001",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo
        )
        self.tipo_tarea = TiposTarea.objects.create(nombretipotarea="Inspección")
        self.tarea_estandar = TareasEstandar.objects.create(
            nombretarea="Revisar aceite",
            idtipotarea=self.tipo_tarea,
            tiempoestimadominutos=30
        )
        self.plan = PlanesMantenimiento.objects.create(
            nombreplan="Plan Test",
            idtipoequipo=self.tipo_equipo
        )
        
    def test_flujo_completo_mantenimiento_preventivo(self):
        """Prueba el flujo completo de mantenimiento preventivo"""
        # 1. Crear detalle del plan
        detalle = DetallesPlanMantenimiento.objects.create(
            idplanmantenimiento=self.plan,
            idtareaestandar=self.tarea_estandar,
            intervalohorasoperacion=100
        )
        self.assertEqual(detalle.intervalohorasoperacion, 100)
        
        # 2. Crear tipos necesarios para OT
        tipo_mantenimiento = TiposMantenimientoOT.objects.create(
            nombretipomantenimientoot="Preventivo"
        )
        estado_ot = EstadosOrdenTrabajo.objects.create(
            nombreestadoot="Abierta"
        )
        
        # 3. Crear orden de trabajo
        ot = OrdenesTrabajo.objects.create(
            numeroot="OT-PREV-001",
            idequipo=self.equipo,
            idplanorigen=self.plan,
            idtipomantenimientoot=tipo_mantenimiento,
            idestadoot=estado_ot,
            idsolicitante=self.user,
            horometro=100
        )
        
        # 4. Crear actividad de la OT
        actividad = ActividadesOrdenTrabajo.objects.create(
            idordentrabajo=ot,
            idtareaestandar=self.tarea_estandar,
            descripcionactividad="Revisar nivel de aceite del motor",
            tiempoestimadominutos=30
        )
        
        # Verificaciones
        self.assertEqual(ot.idplanorigen, self.plan)
        self.assertEqual(actividad.idtareaestandar, self.tarea_estandar)
        self.assertFalse(actividad.completada)
        
    def test_flujo_checklist_completo(self):
        """Prueba el flujo completo de checklist"""
        # 1. Crear template de checklist
        template = ChecklistTemplate.objects.create(
            nombre="Checklist Test",
            tipo_equipo=self.tipo_equipo
        )
        
        # 2. Crear categoría
        category = ChecklistCategory.objects.create(
            template=template,
            nombre="Motor",
            orden=1
        )
        
        # 3. Crear ítems
        item1 = ChecklistItem.objects.create(
            category=category,
            texto="Nivel de aceite",
            es_critico=True,
            orden=1
        )
        item2 = ChecklistItem.objects.create(
            category=category,
            texto="Nivel de refrigerante",
            es_critico=False,
            orden=2
        )
        
        # 4. Crear instancia de checklist
        instance = ChecklistInstance.objects.create(
            template=template,
            equipo=self.equipo,
            operador=self.user,
            fecha_inspeccion='2025-06-23',
            horometro_inspeccion=1000
        )
        
        # 5. Crear respuestas
        answer1 = ChecklistAnswer.objects.create(
            instance=instance,
            item=item1,
            estado='bueno'
        )
        answer2 = ChecklistAnswer.objects.create(
            instance=instance,
            item=item2,
            estado='malo',
            observacion_item='Requiere rellenado'
        )
        
        # Verificaciones
        self.assertEqual(instance.template, template)
        self.assertEqual(instance.answers.count(), 2)
        self.assertEqual(answer1.estado, 'bueno')
        self.assertEqual(answer2.observacion_item, 'Requiere rellenado')

