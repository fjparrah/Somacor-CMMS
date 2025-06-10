from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .forms import LoginForm
from .models import Usuario
from django.contrib import messages
import hashlib
from django.shortcuts import redirect

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            nombre_usuario = form.cleaned_data['nombre_usuario']
            clave = form.cleaned_data['clave']
            clave_hash = hashlib.sha256(clave.encode()).hexdigest()

            try:
                usuario = Usuario.objects.get(nombre_usuario=nombre_usuario, clave_hash=clave_hash, activo=True)
                request.session['usuario_id'] = usuario.id
                request.session['usuario_nombre'] = usuario.nombre_usuario
                return redirect('menu') 
            except Usuario.DoesNotExist:
                messages.error(request, 'Usuario o contraseña incorrectos.')
    else:
        form = LoginForm()
    return render(request, 'CMMS_SOMACOR_app/login.html', {'form': form})



def logout_view(request):
    request.session.flush()
    return redirect('login')


def menu_view(request):
    return render(request, 'CMMS_SOMACOR_app/menu.html')
