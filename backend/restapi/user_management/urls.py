from django.urls import path
from .views import RegisterView, LoginView, UserUpdateView, UserDeleteView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('update/', UserUpdateView.as_view(), name='update_user'),
    path('delete/', UserDeleteView.as_view(), name='delete_user'),
]
