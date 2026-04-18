"""
Serializers for the patients app.
"""
from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for the Patient model."""

    age = serializers.ReadOnlyField()
    created_by_name = serializers.ReadOnlyField(source='created_by.name')

    class Meta:
        model = Patient
        fields = (
            'id', 'name', 'email', 'phone', 'date_of_birth', 'age',
            'gender', 'blood_group', 'address', 'medical_history',
            'allergies', 'emergency_contact_name', 'emergency_contact_phone',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_by_name', 'created_at', 'updated_at', 'age')
