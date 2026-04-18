"""
Views for the doctors app.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Doctor
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing doctor instances.
    GET /api/doctors/ returns ALL doctors (not filtered by user).
    Other operations are for authenticated users only.
    """
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['specialization', 'is_available']
    search_fields = ['name', 'email', 'hospital', 'specialization']
    ordering_fields = ['created_at', 'name', 'experience_years', 'consultation_fee']

    def get_queryset(self):
        """Return all doctors (assignment says 'Retrieve all doctors')."""
        return Doctor.objects.all()

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)
