from django.db import models

# Create your models here.
class Usuario(models.Model):
    nombre_usuario = models.CharField(max_length=50, unique=True)
    clave_hash = models.CharField(max_length=255)
    nombre_completo = models.CharField(max_length=150)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre_usuario
