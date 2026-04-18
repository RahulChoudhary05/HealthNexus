"""
Serializers for the doctors app.
"""
from rest_framework import serializers
from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for the Doctor model."""

    created_by_name = serializers.ReadOnlyField(source='created_by.name')
    specialization_display = serializers.ReadOnlyField(source='get_specialization_display')

    class Meta:
        model = Doctor
        fields = (
            'id', 'name', 'email', 'phone', 'specialization', 'specialization_display',
            'license_number', 'experience_years', 'qualification', 'hospital',
            'address', 'consultation_fee', 'is_available',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'specialization_display')

    def validate_license_number(self, value):
        """Validate license number uniqueness (excluding current instance on update)."""
        if value:
            queryset = Doctor.objects.filter(license_number=value)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError('A doctor with this license number already exists.')
        return value
