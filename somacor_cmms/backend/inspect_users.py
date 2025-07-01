import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cmms_project.settings")
django.setup()

from django.contrib.auth.models import User
from cmms_api.models import Usuarios, Roles

print("\n--- User Roles in Database ---")
for user in User.objects.all():
    try:
        usuario_profile = Usuarios.objects.get(user=user)
        print(f"User: {user.username}, Email: {user.email}, Role: {usuario_profile.idrol.nombrerol}")
    except Usuarios.DoesNotExist:
        print(f"User: {user.username}, Email: {user.email}, No associated profile (Usuarios model)")
    except Roles.DoesNotExist:
        print(f"User: {user.username}, Email: {user.email}, Associated profile but role does not exist")


