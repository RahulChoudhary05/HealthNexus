"""
Serializers for the mappings app.
"""
from rest_framework import serializers
from .models import PatientDoctorMapping

class PatientDoctorMappingSerializer(serializers.ModelSerializer):
    """Serializer for patient-doctor mappings."""
    patient_name = serializers.ReadOnlyField(source='patient.name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    doctor_specialization = serializers.ReadOnlyField(source='doctor.get_specialization_display')

    class Meta:
        model = PatientDoctorMapping
        fields = ('id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'doctor_specialization', 'notes', 'assigned_at')
        read_only_fields = ('id', 'assigned_at', 'patient_name', 'doctor_name', 'doctor_specialization')

    def validate(self, attrs):
        """Ensure mapping doesn't already exist."""
        patient = attrs.get('patient')
        doctor = attrs.get('doctor')
        if PatientDoctorMapping.objects.filter(patient=patient, doctor=doctor).exists():
            raise serializers.ValidationError("This doctor is already assigned to this patient.")
        return attrs
