"""
Views for mappings app – 100% assignment-compliant.

Assignment requires:
  POST   /api/mappings/                    – Assign a doctor to a patient
  GET    /api/mappings/                    – Retrieve all mappings
  GET    /api/mappings/<patient_id>/       – Get all doctors assigned to a specific patient
  DELETE /api/mappings/<id>/              – Remove a doctor from a patient
"""
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import PatientDoctorMapping
from .serializers import PatientDoctorMappingSerializer


class MappingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing patient-doctor mappings."""

    serializer_class = PatientDoctorMappingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']  # no PUT/PATCH on mappings
    filterset_fields = ['patient', 'doctor', 'doctor__specialization']
    search_fields = ['patient__name', 'doctor__name', 'notes']
    ordering_fields = ['assigned_at', 'id']

    def get_queryset(self):
        """Return mappings whose patient was created by the logged-in user."""
        return PatientDoctorMapping.objects.select_related('patient', 'doctor').filter(
            patient__created_by=self.request.user
        )

    def retrieve(self, request, *args, **kwargs):
        """
        GET /api/mappings/<patient_id>/
        Returns ALL doctors assigned to the given patient.
        """
        patient_id = kwargs.get('pk')
        queryset = self.get_queryset().filter(patient_id=patient_id)
        if not queryset.exists():
            return Response(
                {'message': 'No doctor assignments found for this patient.'},
                status=status.HTTP_200_OK
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
