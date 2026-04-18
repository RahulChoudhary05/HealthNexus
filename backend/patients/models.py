"""
Patient model for healthcare application.
"""
from django.db import models
from django.conf import settings


class Patient(models.Model):
    """Represents a patient in the healthcare system."""

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer Not to Say'),
    ]

    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('Unknown', 'Unknown'),
    ]

    id = models.BigAutoField(primary_key=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patients',
        verbose_name='Created By'
    )
    name = models.CharField(max_length=200, verbose_name='Full Name')
    email = models.EmailField(blank=True, null=True, verbose_name='Email Address')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Phone Number')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='Date of Birth')
    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True,
        verbose_name='Gender'
    )
    blood_group = models.CharField(
        max_length=10,
        choices=BLOOD_GROUP_CHOICES,
        default='Unknown',
        verbose_name='Blood Group'
    )
    address = models.TextField(blank=True, null=True, verbose_name='Address')
    medical_history = models.TextField(blank=True, null=True, verbose_name='Medical History')
    allergies = models.TextField(blank=True, null=True, verbose_name='Known Allergies')
    emergency_contact_name = models.CharField(max_length=150, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} (ID: {self.id})'

    @property
    def age(self):
        """Calculate patient age from date_of_birth."""
        if self.date_of_birth:
            from django.utils import timezone
            today = timezone.now().date()
            dob = self.date_of_birth
            return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return None
