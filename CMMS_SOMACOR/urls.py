from django.contrib.auth.views import LoginView, LogoutView
from django.urls import path
from CMMS_SOMACOR.views import menu_view  
urlpatterns = [
    path('login/', LoginView.as_view(template_name='CMMS_SOMACOR/login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', menu_view, name='menu'), 
]