from django import forms

class LoginForm(forms.Form):
    nombre_usuario = forms.CharField(label='Usuario', max_length=50)
    clave = forms.CharField(label='Contraseña', widget=forms.PasswordInput)

