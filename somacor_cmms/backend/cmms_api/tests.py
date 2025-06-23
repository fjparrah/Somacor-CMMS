from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from cmms_api.models import Equipos, TiposEquipo, EstadosEquipo, Faenas, Roles, Usuarios

class RolesModelTest(TestCase):
    def test_rol_creation(self):
        rol = Roles.objects.create(nombrerol="Administrador")
        self.assertEqual(rol.nombrerol, "Administrador")

    def test_rol_str_representation(self):
        rol = Roles.objects.create(nombrerol="Técnico")
        self.assertEqual(str(rol), "Técnico")

class UsuariosModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.rol = Roles.objects.create(nombrerol="Operador")

    def test_usuario_creation(self):
        usuario = Usuarios.objects.create(user=self.user, idrol=self.rol, departamento="Operaciones")
        self.assertEqual(usuario.user.username, "testuser")
        self.assertEqual(usuario.idrol.nombrerol, "Operador")
        self.assertEqual(usuario.departamento, "Operaciones")

    def test_usuario_str_representation(self):
        usuario = Usuarios.objects.create(user=self.user, idrol=self.rol)
        self.assertEqual(str(usuario), "testuser")

class TiposEquipoModelTest(TestCase):
    def test_tipo_equipo_creation(self):
        tipo = TiposEquipo.objects.create(nombretipo="Retroexcavadora")
        self.assertEqual(tipo.nombretipo, "Retroexcavadora")

    def test_tipo_equipo_str_representation(self):
        tipo = TiposEquipo.objects.create(nombretipo="Grúa")
        self.assertEqual(str(tipo), "Grúa")


class EquipoModelTest(TestCase):
    def setUp(self):
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Camión")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        self.faena = Faenas.objects.create(nombrefaena="Faena Principal")

    def test_equipo_creation(self):
        equipo = Equipos.objects.create(
            codigointerno="EQ001",
            nombreequipo="Camión Minero 1",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo,
            idfaenaactual=self.faena,
            horometroactual=1000
        )
        self.assertEqual(equipo.codigointerno, "EQ001")
        self.assertEqual(equipo.nombreequipo, "Camión Minero 1")
        self.assertEqual(equipo.idtipoequipo.nombretipo, "Camión")
        self.assertEqual(equipo.idestadoactual.nombreestado, "Operativo")
        self.assertEqual(equipo.idfaenaactual.nombrefaena, "Faena Principal")
        self.assertEqual(equipo.horometroactual, 1000)

    def test_equipo_str_representation(self):
        equipo = Equipos.objects.create(
            codigointerno="EQ002",
            nombreequipo="Excavadora 2",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo,
            idfaenaactual=self.faena
        )
        self.assertEqual(str(equipo), "Excavadora 2 (EQ002)")

class EquipoAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='admin', password='admin')
        self.client.force_authenticate(user=self.user)
        self.tipo_equipo = TiposEquipo.objects.create(nombretipo="Camión")
        self.estado_equipo = EstadosEquipo.objects.create(nombreestado="Operativo")
        self.faena = Faenas.objects.create(nombrefaena="Faena Principal")
        self.equipo = Equipos.objects.create(
            codigointerno="EQ001",
            nombreequipo="Camión Minero 1",
            idtipoequipo=self.tipo_equipo,
            idestadoactual=self.estado_equipo,
            idfaenaactual=self.faena,
            horometroactual=1000
        )

    def test_get_equipos_list(self):
        response = self.client.get("/api/equipos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["nombreequipo"], "Camión Minero 1")

    def test_create_equipo(self):
        data = {
            "codigointerno": "EQ002",
            "nombreequipo": "Excavadora 2",
            "idtipoequipo": self.tipo_equipo.idtipoequipo,
            "idestadoactual": self.estado_equipo.idestadoequipo,
            "idfaenaactual": self.faena.idfaena,
            "horometroactual": 500
        }
        response = self.client.post("/api/equipos/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Equipos.objects.count(), 2)

    def test_update_equipo(self):
        data = {
            "nombreequipo": "Camión Minero Actualizado",
            "horometroactual": 1500
        }
        response = self.client.patch(f"/api/equipos/{self.equipo.idequipo}/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.equipo.refresh_from_db()
        self.assertEqual(self.equipo.nombreequipo, "Camión Minero Actualizado")
        self.assertEqual(self.equipo.horometroactual, 1500)

    def test_delete_equipo(self):
        response = self.client.delete(f"/api/equipos/{self.equipo.idequipo}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Equipos.objects.count(), 0)