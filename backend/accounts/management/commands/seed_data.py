"""Management command: python manage.py seed_data.

Seeds realistic healthcare data and is safe to run repeatedly.
Primary login account (requested): rahul@gmail.com / Rahul@01
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from accounts.models import User
from patients.models import Patient
from doctors.models import Doctor
from mappings.models import PatientDoctorMapping


class Command(BaseCommand):
    help = 'Seeds the database with realistic healthcare data'

    def handle(self, *args, **kwargs):
        self.stdout.write('\n=== Seeding HealthNexus database ===\n')

        with transaction.atomic():
            # 1) Users
            users_data = [
                {'name': 'Rahul Sharma', 'email': 'rahul@gmail.com'},
                {'name': 'Mayank Verma', 'email': 'mayank@gmail.com'},
                {'name': 'Sandeep Gupta', 'email': 'sandeep@gmail.com'},
                {'name': 'Aditya Kumar', 'email': 'aditya@gmail.com'},
            ]
            PASSWORD = 'Rahul@01'
            created_users = []

            for ud in users_data:
                user, created = User.objects.update_or_create(
                    email=ud['email'],
                    defaults={'name': ud['name']}
                )
                user.set_password(PASSWORD)
                user.save(update_fields=['password'])
                action = 'created' if created else 'updated'
                self.stdout.write(self.style.SUCCESS(f'  [OK] User {action}: {user.name} ({user.email})'))
                created_users.append(user)

            rahul = created_users[0]

            # 2) Doctors
            doctors_data = [
                {
                    'name': 'Rahul Mehta', 'email': 'dr.rahul@apollo.in',
                    'specialization': 'cardiology', 'experience_years': 12,
                    'hospital': 'Apollo Hospital Delhi', 'license_number': 'MCI-DL-2341',
                    'consultation_fee': 800, 'phone': '+91-9811234567', 'is_available': True,
                },
                {
                    'name': 'Mayank Joshi', 'email': 'dr.mayank@aiims.in',
                    'specialization': 'neurology', 'experience_years': 18,
                    'hospital': 'AIIMS New Delhi', 'license_number': 'MCI-DL-5823',
                    'consultation_fee': 1200, 'phone': '+91-9911234567', 'is_available': True,
                },
                {
                    'name': 'Aditya Singh', 'email': 'dr.aditya@fortis.in',
                    'specialization': 'pediatrics', 'experience_years': 9,
                    'hospital': 'Fortis Hospital Gurgaon', 'license_number': 'MCI-HR-1123',
                    'consultation_fee': 600, 'phone': '+91-9711234567', 'is_available': True,
                },
                {
                    'name': 'Sandeep Patel', 'email': 'dr.sandeep@max.in',
                    'specialization': 'orthopedics', 'experience_years': 15,
                    'hospital': 'Max Hospital Saket', 'license_number': 'MCI-DL-7741',
                    'consultation_fee': 900, 'phone': '+91-9611234567', 'is_available': True,
                },
                {
                    'name': 'Sunita Reddy', 'email': 'dr.sunita@manipal.in',
                    'specialization': 'dermatology', 'experience_years': 7,
                    'hospital': 'Manipal Hospital Bangalore', 'license_number': 'MCI-KA-3312',
                    'consultation_fee': 700, 'phone': '+91-9511234567', 'is_available': False,
                },
                {
                    'name': 'Vikram Nair', 'email': 'dr.vikram@kims.in',
                    'specialization': 'surgery', 'experience_years': 22,
                    'hospital': 'KIMS Hospital Hyderabad', 'license_number': 'MCI-TS-9901',
                    'consultation_fee': 1500, 'phone': '+91-9411234567', 'is_available': True,
                },
                {
                    'name': 'Neha Bansal', 'email': 'dr.neha@medanta.in',
                    'specialization': 'endocrinology', 'experience_years': 11,
                    'hospital': 'Medanta Gurgaon', 'license_number': 'MCI-HR-7789',
                    'consultation_fee': 950, 'phone': '+91-9311234567', 'is_available': True,
                },
                {
                    'name': 'Arjun Menon', 'email': 'dr.arjun@care.in',
                    'specialization': 'pulmonology', 'experience_years': 14,
                    'hospital': 'CARE Hospital Chennai', 'license_number': 'MCI-TN-6182',
                    'consultation_fee': 980, 'phone': '+91-9211234567', 'is_available': True,
                },
            ]
            created_doctors = []

            for dd in doctors_data:
                defaults = {**dd, 'created_by': rahul}
                doc, created = Doctor.objects.update_or_create(
                    license_number=dd['license_number'],
                    defaults=defaults
                )
                action = 'created' if created else 'updated'
                self.stdout.write(self.style.SUCCESS(f'  [OK] Doctor {action}: Dr. {doc.name}'))
                created_doctors.append(doc)

            # 3) Patients under Rahul's account
            patients_data = [
                {
                    'name': 'Rahul Tiwari', 'email': 'rahul.tiwari.patient@gmail.com',
                    'phone': '+91-9810000001', 'date_of_birth': '1990-03-15',
                    'gender': 'male', 'blood_group': 'O+',
                    'address': '42 Lajpat Nagar, New Delhi',
                    'medical_history': 'Hypertension, mild diabetes',
                    'allergies': 'Penicillin',
                    'emergency_contact_name': 'Sita Tiwari',
                    'emergency_contact_phone': '+91-9810000099',
                },
                {
                    'name': 'Mayank Aggarwal', 'email': 'mayank.aggarwal.patient@gmail.com',
                    'phone': '+91-9820000002', 'date_of_birth': '1985-07-22',
                    'gender': 'male', 'blood_group': 'A+',
                    'address': '15 Sector 18, Noida',
                    'medical_history': 'Asthma, seasonal allergies',
                    'allergies': 'Dust, pollen',
                },
                {
                    'name': 'Sandeep Yadav', 'email': 'sandeep.yadav.patient@gmail.com',
                    'phone': '+91-9830000003', 'date_of_birth': '1978-11-08',
                    'gender': 'male', 'blood_group': 'B+',
                    'address': '7 Civil Lines, Allahabad',
                    'medical_history': 'Lower back pain, knee arthritis',
                    'allergies': 'None known',
                },
                {
                    'name': 'Aditya Mishra', 'email': 'aditya.mishra.patient@gmail.com',
                    'phone': '+91-9840000004', 'date_of_birth': '1995-01-30',
                    'gender': 'male', 'blood_group': 'AB+',
                    'address': '23 Banjara Hills, Hyderabad',
                    'medical_history': 'Migraine, anxiety disorder',
                    'allergies': 'Ibuprofen',
                },
                {
                    'name': 'Priya Kapoor', 'email': 'priya.kapoor.patient@gmail.com',
                    'phone': '+91-9850000005', 'date_of_birth': '1992-09-14',
                    'gender': 'female', 'blood_group': 'O-',
                    'address': '88 Koramangala, Bangalore',
                    'medical_history': 'PCOD, hypothyroidism',
                    'allergies': 'Sulfa drugs',
                },
                {
                    'name': 'Neha Sharma', 'email': 'neha.sharma.patient@gmail.com',
                    'phone': '+91-9860000006', 'date_of_birth': '2001-05-03',
                    'gender': 'female', 'blood_group': 'B-',
                    'address': '12 Powai, Mumbai',
                    'medical_history': 'Vitamin D deficiency, anaemia',
                    'allergies': 'None known',
                },
                {
                    'name': 'Arjun Singh', 'email': 'arjun.singh.patient@gmail.com',
                    'phone': '+91-9870000007', 'date_of_birth': '1970-12-25',
                    'gender': 'male', 'blood_group': 'A-',
                    'address': '5 Alipore, Kolkata',
                    'medical_history': 'Type 2 diabetes, hypertension, cholesterol',
                    'allergies': 'Aspirin',
                },
                {
                    'name': 'Kavya Reddy', 'email': 'kavya.reddy.patient@gmail.com',
                    'phone': '+91-9880000008', 'date_of_birth': '1988-06-18',
                    'gender': 'female', 'blood_group': 'AB-',
                    'address': '30 Anna Nagar, Chennai',
                    'medical_history': 'Rheumatoid arthritis',
                    'allergies': 'Latex',
                },
                {
                    'name': 'Rohan Malhotra', 'email': 'rohan.malhotra.patient@gmail.com',
                    'phone': '+91-9890000009', 'date_of_birth': '1982-10-06',
                    'gender': 'male', 'blood_group': 'O+',
                    'address': '17 Vasant Kunj, New Delhi',
                    'medical_history': 'Sleep apnea, obesity',
                    'allergies': 'None known',
                },
                {
                    'name': 'Pooja Nair', 'email': 'pooja.nair.patient@gmail.com',
                    'phone': '+91-9800000010', 'date_of_birth': '1996-04-19',
                    'gender': 'female', 'blood_group': 'A+',
                    'address': '44 Panampilly Nagar, Kochi',
                    'medical_history': 'Thyroid imbalance',
                    'allergies': 'Seafood',
                },
                {
                    'name': 'Imran Sheikh', 'email': 'imran.sheikh.patient@gmail.com',
                    'phone': '+91-9810000011', 'date_of_birth': '1976-02-11',
                    'gender': 'male', 'blood_group': 'B-',
                    'address': '81 Camp Road, Pune',
                    'medical_history': 'COPD, hypertension',
                    'allergies': 'Sulphites',
                },
                {
                    'name': 'Sneha Arora', 'email': 'sneha.arora.patient@gmail.com',
                    'phone': '+91-9820000012', 'date_of_birth': '2003-08-01',
                    'gender': 'female', 'blood_group': 'AB+',
                    'address': '62 Sector 22, Chandigarh',
                    'medical_history': 'Migraine episodes',
                    'allergies': 'Naproxen',
                },
            ]
            created_patients = []

            for pd in patients_data:
                defaults = {**pd, 'created_by': rahul}
                pat, created = Patient.objects.update_or_create(
                    email=pd['email'],
                    defaults=defaults
                )
                action = 'created' if created else 'updated'
                self.stdout.write(self.style.SUCCESS(f'  [OK] Patient {action}: {pat.name}'))
                created_patients.append(pat)

            # 4) Patient-doctor mappings
            mappings_data = [
                (0, 0, 'Referred for hypertension management'),
                (0, 2, 'Post-operative knee follow-up'),
                (1, 1, 'Neurological evaluation for asthma complications'),
                (2, 3, 'Orthopedic consultation for lower back pain'),
                (3, 1, 'Migraine specialist treatment plan'),
                (4, 2, 'Pediatric referral for hormonal issues'),
                (5, 0, 'Cardiac screening recommended by GP'),
                (6, 0, 'Cardiology follow-up for diabetic patient'),
                (6, 5, 'Surgical consultation for diabetes complications'),
                (7, 3, 'Orthopaedic referral for joint pain'),
                (8, 7, 'Pulmonology consult for sleep-disordered breathing'),
                (8, 6, 'Endocrine consult for metabolic control'),
                (9, 6, 'Thyroid profile monitoring and follow-up'),
                (10, 7, 'COPD management and inhalation plan'),
                (11, 1, 'Advanced headache clinic referral'),
                (11, 0, 'Baseline cardiac fitness assessment'),
            ]
            count = 0
            for pi, di, notes in mappings_data:
                if pi < len(created_patients) and di < len(created_doctors):
                    _, created = PatientDoctorMapping.objects.update_or_create(
                        patient=created_patients[pi],
                        doctor=created_doctors[di],
                        defaults={'notes': notes}
                    )
                    if created:
                        count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f'  [OK] Mapping synced: {created_patients[pi].name} -> Dr. {created_doctors[di].name}'
                    ))

        self.stdout.write(self.style.SUCCESS(
            '\n=== Seed complete! ===\n'
            'Login credentials (password for all: Rahul@01):\n'
            '  rahul@gmail.com\n'
            '  mayank@gmail.com\n'
            '  sandeep@gmail.com\n'
            '  aditya@gmail.com\n'
            f'Total mappings processed: {len(mappings_data)}\n'
        ))
