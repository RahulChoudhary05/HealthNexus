# 🏥 HealthNexus — Healthcare Backend Platform
> **WhatBytes Backend Developer Internship Assignment**

A full-stack healthcare management system built with **Django REST Framework** + **PostgreSQL** backend and a **React (Vite)** frontend with a modern, premium UI.

---

## 📁 Project Structure

```
HealthcareBackend/
├── backend/                  ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example          ← Copy to .env and fill values
│   ├── healthcare/           ← Django project config
│   ├── accounts/             ← Auth (register/login/logout)
│   ├── patients/             ← Patient CRUD
│   ├── doctors/              ← Doctor CRUD
│   └── mappings/             ← Patient-Doctor assignments
│
└── frontend/                 ← React + Vite UI
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/Navbar.jsx
        └── pages/  (Home, Login, Register, Dashboard, Patients, Doctors, Mappings)
```

---

## 🚀 Quick Setup Guide

### Step 1 — Prerequisites

Install these **first** before anything:

| Tool | Download Link |
|------|---------------|
| Python 3.11+ | https://www.python.org/downloads/ |
| PostgreSQL 15+ | https://www.postgresql.org/download/windows/ |
| Node.js 18+ | https://nodejs.org/ |
| Git | https://git-scm.com/ |

---

### Step 2 — Database Setup

**Option A — Local PostgreSQL (Free)**
1. Install PostgreSQL (link above).
2. Open **pgAdmin** or **psql** and run:
   ```sql
   CREATE DATABASE healthcare_db;
   ```
3. Note your `postgres` user password — you'll need it in `.env`.

**Option B — Neon.tech Free Cloud PostgreSQL (Recommended — no install needed!)**
1. Go to **https://neon.tech** → Sign up with GitHub (100% free, no credit card).
2. Click **"Create Project"** → give it a name → click **Create**.
3. Copy the **Connection String** shown (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`).
4. Use those values in your `.env` file (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

---

### Step 3 — Backend Setup

```bash
# 1. Go into backend folder
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it (Windows PowerShell)
venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create your .env file
copy .env.example .env
# Then open .env in VS Code and fill in your DB credentials + SECRET_KEY

# 6. Run migrations
python manage.py makemigrations
python manage.py migrate

# 7. (Optional) Create admin superuser
python manage.py createsuperuser

# 8. Start the server
python manage.py runserver
```

✅ Backend runs at: **http://127.0.0.1:8000**
📖 Swagger API Docs: **http://127.0.0.1:8000/api/docs/**

---

### Step 4 — Frontend Setup

Open a **new terminal window** (keep backend running):

```bash
# 1. Go into frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

## 🔑 Environment Variables (`.env` file)

Copy `backend/.env.example` to `backend/.env`:

```dotenv
SECRET_KEY=django-insecure-change-me-to-a-strong-random-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Local PostgreSQL
DB_NAME=healthcare_db
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432

# OR use Neon.tech free cloud values above ↑

JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

**How to generate a SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Or visit: https://djecrety.ir/

---

## 📡 API Endpoints (All Assignment Requirements)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/api/auth/register/` | ❌ | Register new user |
| POST | `/api/auth/login/` | ❌ | Login → returns JWT tokens |
| POST | `/api/auth/logout/` | ✅ | Blacklist refresh token |
| GET | `/api/auth/profile/` | ✅ | Get logged-in user info |
| POST | `/api/patients/` | ✅ | Add a new patient |
| GET | `/api/patients/` | ✅ | Get all patients (yours only) |
| GET | `/api/patients/<id>/` | ✅ | Get specific patient |
| PUT | `/api/patients/<id>/` | ✅ | Update patient |
| DELETE | `/api/patients/<id>/` | ✅ | Delete patient |
| POST | `/api/doctors/` | ✅ | Add a new doctor |
| GET | `/api/doctors/` | ✅ | Get all doctors |
| GET | `/api/doctors/<id>/` | ✅ | Get specific doctor |
| PUT | `/api/doctors/<id>/` | ✅ | Update doctor |
| DELETE | `/api/doctors/<id>/` | ✅ | Delete doctor |
| POST | `/api/mappings/` | ✅ | Assign doctor to patient |
| GET | `/api/mappings/` | ✅ | Get all mappings |
| GET | `/api/mappings/<patient_id>/` | ✅ | All doctors for a patient |
| DELETE | `/api/mappings/<id>/` | ✅ | Remove assignment |

All protected endpoints require: `Authorization: Bearer <access_token>`

---

## 🆓 Free Platforms Used

| Service | What For | Link |
|---------|----------|------|
| **Neon.tech** | Free PostgreSQL cloud DB | https://neon.tech |
| **Render.com** | Deploy Django backend free | https://render.com |
| **Vercel** | Deploy React frontend free | https://vercel.com |
| **Swagger UI** | API docs (built-in) | `/api/docs/` |

---

## 🧪 Test with Postman

1. Download **Postman**: https://www.postman.com/downloads/
2. Register: `POST http://127.0.0.1:8000/api/auth/register/`
   ```json
   {"name": "Test User", "email": "test@test.com", "password": "Test@1234", "password2": "Test@1234"}
   ```
3. Copy the `access` token from the response.
4. In Postman: Go to **Authorization** tab → Type: **Bearer Token** → paste your token.
5. Now test all other endpoints!

---

**Built with ❤️ for the WhatBytes Backend Developer Internship Assignment**
