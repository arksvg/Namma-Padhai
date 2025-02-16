from django.urls import path
from .views import FatigueDetectionView

urlpatterns = [
    path('detect/', FatigueDetectionView.as_view(), name='fatigue-detect'),
]
