"""
Admin configuration for the doctors app.
"""
from django.contrib import admin
from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'specialization', 'hospital', 'experience_years', 'is_available', 'created_by', 'created_at')
    list_filter = ('specialization', 'is_available', 'created_at')
    search_fields = ('name', 'email', 'hospital', 'license_number')
    readonly_fields = ('created_at', 'updated_at')
