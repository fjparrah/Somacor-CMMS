from django.urls import path
from CMMS_SOMACOR_app import views

urlpatterns = [
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('menu/', views.menu_view, name='menu'), 
]