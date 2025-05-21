from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def login(request):
    return render(request, 'CMMS_SOMACOR/login.html')

@login_required
def menu_view(request):
    return render(request, 'CMMS_SOMACOR/menu.html')