"""
Views for the patients app.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing patient instances.
    Provides GET, POST, PUT, PATCH, DELETE operations.
    """
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['gender', 'blood_group']
    search_fields = ['name', 'email', 'phone']
    ordering_fields = ['created_at', 'name', 'date_of_birth']

    def get_queryset(self):
        """
        Filter queryset so users only see patients they created.
        """
        return Patient.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        """
        Set the created_by field to the current user when creating a new patient.
        """
        serializer.save(created_by=self.request.user)
