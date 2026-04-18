"""
Doctor model for healthcare application.
"""
from django.db import models
from django.conf import settings


class Doctor(models.Model):
    """Represents a doctor in the healthcare system."""

    SPECIALIZATION_CHOICES = [
        ('general_practice', 'General Practice'),
        ('cardiology', 'Cardiology'),
        ('dermatology', 'Dermatology'),
        ('endocrinology', 'Endocrinology'),
        ('gastroenterology', 'Gastroenterology'),
        ('neurology', 'Neurology'),
        ('oncology', 'Oncology'),
        ('ophthalmology', 'Ophthalmology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('psychiatry', 'Psychiatry'),
        ('pulmonology', 'Pulmonology'),
        ('radiology', 'Radiology'),
        ('surgery', 'Surgery'),
        ('urology', 'Urology'),
        ('other', 'Other'),
    ]

    id = models.BigAutoField(primary_key=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctors',
        verbose_name='Created By'
    )
    name = models.CharField(max_length=200, verbose_name='Full Name')
    email = models.EmailField(blank=True, null=True, verbose_name='Email Address')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Phone Number')
    specialization = models.CharField(
        max_length=50,
        choices=SPECIALIZATION_CHOICES,
        default='general_practice',
        verbose_name='Specialization'
    )
    license_number = models.CharField(
        max_length=50,
        blank=True, null=True,
        unique=True,
        verbose_name='License Number'
    )
    experience_years = models.PositiveIntegerField(
        default=0,
        verbose_name='Years of Experience'
    )
    qualification = models.CharField(max_length=200, blank=True, null=True, verbose_name='Qualification')
    hospital = models.CharField(max_length=200, blank=True, null=True, verbose_name='Hospital/Clinic')
    address = models.TextField(blank=True, null=True, verbose_name='Address')
    consultation_fee = models.DecimalField(
        max_digits=10, decimal_places=2,
        blank=True, null=True,
        verbose_name='Consultation Fee (INR)'
    )
    is_available = models.BooleanField(default=True, verbose_name='Available for Consultation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'
        ordering = ['-created_at']

    def __str__(self):
        return f'Dr. {self.name} - {self.get_specialization_display()}'
