"""
Models for patient-doctor mappings.
"""
from django.db import models
from patients.models import Patient
from doctors.models import Doctor

class PatientDoctorMapping(models.Model):
    """Mapping between a patient and an assigned doctor."""
    id = models.BigAutoField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='doctor_mappings')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='patient_mappings')
    assigned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True, verbose_name='Assignment Notes')

    class Meta:
        db_table = 'patient_doctor_mappings'
        verbose_name = 'Patient-Doctor Mapping'
        verbose_name_plural = 'Patient-Doctor Mappings'
        unique_together = ('patient', 'doctor')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.patient.name} -> Dr. {self.doctor.name}"
