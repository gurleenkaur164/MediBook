# 🏥 MediBook — Full-Stack Appointment Booking App

A production-ready appointment booking platform built with React + Tailwind CSS, Node.js + Express, PostgreSQL (Supabase), and JWT authentication.

## 📁 Project Structure

```
appointment-booking-app/
├── backend/          # Node.js + Express API
└── frontend/         # React + Vite + Tailwind CSS
```

---

## 🚀 Quick Start

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `backend/src/db/schema.sql`
3. Copy your **Project URL** and **Service Role Key** from Settings → API

---

### 2. Backend Setup

```bash
cd backend

# Copy env file
cp .env.example .env
# Fill in your Supabase URL, keys, and JWT secrets
```

**Edit `.env`:**
```env
PORT=5000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=super-long-random-secret-change-me
JWT_REFRESH_SECRET=another-long-random-secret
CLIENT_URL=http://localhost:5173
```

```bash
# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

### 3. Frontend Setup

```bash
cd frontend

# Copy env file  
cp .env.example .env
```

**Edit `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 User Roles

| Role | Capabilities |
|---|---|
| **Patient** | Browse doctors, book/cancel appointments, view history |
| **Doctor** | Manage availability/slots, confirm/reject appointments, view schedule |
| **Admin** | Manage all users (via API) |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (patient or doctor) |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET  | `/api/auth/me` | Get current user |

### Doctors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | List all + filters |
| GET | `/api/doctors/:id` | Doctor profile |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Available slots |
| PUT | `/api/doctors/profile` | Update doctor profile (doctor only) |
| POST | `/api/doctors/availability` | Set weekly schedule (doctor only) |
| POST | `/api/doctors/:id/slots/generate` | Generate slots for 14 days (doctor only) |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | List user's appointments |
| POST | `/api/appointments` | Book appointment (patient only) |
| PATCH | `/api/appointments/:id/status` | Update status (confirm/cancel/reject) |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get profile |
| PUT | `/api/users/me` | Update profile |
| PUT | `/api/users/me/password` | Change password |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import in Vercel
3. Set environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`
4. Deploy!

### Backend → Render

1. Push `backend/` to GitHub
2. Create a new **Web Service** on Render
3. Set the following environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `JWT_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `CLIENT_URL=https://your-vercel-app.vercel.app`
4. Deploy!

---

## 🎯 Features

- ✅ Multi-role authentication (Patient / Doctor / Admin)
- ✅ JWT access + refresh token rotation
- ✅ Doctor listing with search, filters, and sorting
- ✅ Doctor profile with availability and reviews
- ✅ Calendar-based slot picker for booking
- ✅ Real-time slot conflict prevention
- ✅ Appointment status workflow (pending → confirmed → completed)
- ✅ In-app notifications
- ✅ Doctor availability manager (weekly schedule + auto-generate slots)
- ✅ Review & rating system (auto-updates doctor rating)
- ✅ Role-based dashboards
- ✅ Fully responsive dark UI

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js 18+ + Express 5 |
| Database | PostgreSQL via Supabase |
| Auth | JWT (bcryptjs) + httpOnly cookies |
| Hosting | Vercel + Render |
