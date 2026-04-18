"""
URL configuration for healthcare project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


def api_root(request):
    """Root endpoint – returns API info."""
    return JsonResponse({
        'name': 'HealthNexus API',
        'version': '1.0.0',
        'description': 'Healthcare Backend – WhatBytes Assignment',
        'endpoints': {
            'register':  '/api/auth/register/',
            'login':     '/api/auth/login/',
            'patients':  '/api/patients/',
            'doctors':   '/api/doctors/',
            'mappings':  '/api/mappings/',
            'docs':      '/api/docs/',
        },
        'status': 'running',
    })


urlpatterns = [
    path('',      api_root,     name='api-root'),
    path('admin/', admin.site.urls),

    # ── Auth ──────────────────────────────────────────────────────────────
    path('api/auth/',     include('accounts.urls')),

    # ── Resources ─────────────────────────────────────────────────────────
    path('api/patients/', include('patients.urls')),
    path('api/doctors/',  include('doctors.urls')),
    path('api/mappings/', include('mappings.urls')),

    # ── Docs ──────────────────────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(),                       name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'),  name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),    name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

