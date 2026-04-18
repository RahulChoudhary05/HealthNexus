"""
URL routes for mappings.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MappingViewSet

router = DefaultRouter()
router.register(r'', MappingViewSet, basename='mapping')

urlpatterns = [
    path('', include(router.urls)),
]
