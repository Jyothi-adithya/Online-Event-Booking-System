# 🎟️ EventHub — Online Event Booking Platform
# 🎟️ EventHub — Online Event Booking Platform

A full-stack production-ready web application for discovering, booking, and managing events. Built with **React + Material UI** on the frontend and **Node.js + Express + MySQL** on the backend.

---

## 🚀 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React.js (Vite) + Material UI v5 + React Router DOM + Axios |
| Backend   | Node.js + Express.js (MVC + Service Layer) |
| Database  | MySQL (3NF normalized schema) |
| Auth      | JWT + Bcrypt |
| Uploads   | Multer |
| Validation| express-validator |

---

## 👥 User Roles

| Role       | Capabilities |
|------------|-------------|
| **User**       | Browse events, select seats, book tickets, view/cancel bookings |
| **Organizer**  | Create/edit/delete own events, view bookings, revenue analytics |
| **Admin**      | Full platform control — manage all users, events, bookings, reports |

---

## 📁 Folder Structure

```
Online Event Booking Platform/
├── backend/
│   ├── config/          # DB pool + SQL schema
│   ├── controllers/     # auth, event, seat, booking, payment, organizer, admin
│   ├── middleware/      # auth (JWT), errorHandler, validate
│   ├── models/          # user, event, seat, booking, payment, category
│   ├── routes/          # all route files
│   ├── services/        # auth, event, booking (business logic)
│   ├── utils/           # multer upload, seat lock cleaner
│   ├── uploads/         # uploaded event images
│   ├── .env
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Navbar, EventCard, ProtectedRoute
        ├── context/     # AuthContext
        ├── pages/       # All 14 pages
        ├── services/    # api.js + eventService.js
        ├── theme/       # MUI dark theme
        ├── App.jsx
        └── main.jsx
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18+
- **MySQL** 8.0+
- **npm** v9+

---

### Step 1 — Database Setup

1. Open MySQL Workbench or CLI and run:
```sql
-- Run the full schema file:
source path/to/backend/config/database.sql
```

Or via command line:
```bash
mysql -u root -p < backend/config/database.sql
```

2. Manually insert an admin user (after setting up DB):
```sql
USE event_booking_db;

-- Insert admin user (password: admin123)
INSERT INTO users (full_name, email, password_hash, role_id)
VALUES (
  'Platform Admin',
  'admin@eventhub.com',
  '$2a$12$LQv3c1yqBWVHxkd0LQ1Cr.eNmvQwc2tWbqHG7tWb3A.y5PjvUxJuq',
  (SELECT id FROM roles WHERE name='admin')
);
```
> **Note:** The hash above is bcrypt for `admin123`. Change it in production.

---

### Step 2 — Backend Setup

```bash
cd backend

# Copy and configure environment
# Edit .env with your MySQL credentials

npm install

# Start development server
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Step 3 — Frontend Setup

```bash
cd frontend

npm install

# Start Vite dev server
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_booking_db

JWT_SECRET=super_secret_jwt_key_change_in_production_2024
JWT_EXPIRES_IN=7d

SEAT_LOCK_MINUTES=10
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user/organizer |
| POST | `/api/auth/login` | Public | Login → returns JWT |
| GET  | `/api/auth/profile` | 🔒 Auth | Get current user |
| PUT  | `/api/auth/profile` | 🔒 Auth | Update profile |
| PUT  | `/api/auth/change-password` | 🔒 Auth | Change password |

### Events
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | `/api/events` | Public | List events (filterable) |
| GET  | `/api/events/:id` | Public | Get event detail |
| POST | `/api/events` | 🔒 Organizer/Admin | Create event |
| PUT  | `/api/events/:id` | 🔒 Organizer/Admin | Update event |
| DELETE | `/api/events/:id` | 🔒 Organizer/Admin | Delete event |
| PATCH | `/api/events/:id/status` | 🔒 Admin | Approve/reject |

### Seats
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET  | `/api/seats/event/:id` | Public | Get seat map |
| POST | `/api/seats/lock` | 🔒 Auth | Lock seats (10 min) |

### Bookings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | 🔒 Auth | Create booking (transaction) |
| GET  | `/api/bookings/my` | 🔒 Auth | My booking history |
| GET  | `/api/bookings/:id` | 🔒 Auth | Booking detail |
| PATCH | `/api/bookings/:id/cancel` | 🔒 Auth | Cancel booking |
| GET  | `/api/bookings/all` | 🔒 Admin | All bookings |

### Organizer
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/organizer/dashboard` | 🔒 Organizer |
| GET | `/api/organizer/events` | 🔒 Organizer |
| GET | `/api/organizer/events/:id/bookings` | 🔒 Organizer |
| GET | `/api/organizer/revenue` | 🔒 Organizer |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/dashboard` | 🔒 Admin |
| GET | `/api/admin/reports` | 🔒 Admin |
| GET/PATCH/DELETE | `/api/admin/users` | 🔒 Admin |
| GET/PATCH | `/api/admin/events` | 🔒 Admin |

---

## 🔒 Security Features

- **JWT Authentication** with 7-day expiry
- **Bcrypt** password hashing (salt rounds: 12)
- **Role-based Authorization** (user / organizer / admin)
- **Input Validation** via express-validator on all inputs
- **DB Transactions** — atomic booking with `FOR UPDATE` row locks
- **Seat Locking** — prevents double-booking via timed locks
- **CORS** — restricted to frontend origin
- **Error Handler** — centralized, no stack traces in production

---

## 🎯 Booking Workflow

```
1. User logs in
2. Browses & filters events
3. Selects an event → views seat map
4. Selects seats → API locks them (10 min timer)
5. Confirms booking → DB TRANSACTION:
   a. Re-check seat availability (FOR UPDATE)
   b. Insert booking record
   c. Insert booking_seats junction
   d. Mark seats as 'booked'
   e. Decrement event.available_seats
   f. Create payment record
   g. Mark payment 'success'
   h. Confirm booking
6. Booking reference issued → confirmation shown
```

---

## 🖥️ Pages

| Page | Route | Access |
|------|-------|--------|
| Home | `/` | Public |
| Events | `/events` | Public |
| Event Detail | `/events/:id` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Seat Selection | `/events/:id/seats` | 🔒 Auth |
| Booking Confirmation | `/booking/confirmation` | 🔒 Auth |
| Booking History | `/bookings` | 🔒 Auth |
| Booking Detail | `/bookings/:id` | 🔒 Auth |
| Profile | `/profile` | 🔒 Auth |
| Organizer Dashboard | `/organizer` | 🔒 Organizer |
| Create/Edit Event | `/organizer/events/create` | 🔒 Organizer |
| Admin Dashboard | `/admin` | 🔒 Admin |
| Admin Users | `/admin/users` | 🔒 Admin |
| Admin Events | `/admin/events` | 🔒 Admin |

---

## 🧪 Demo Credentials

After running the SQL seed:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventhub.com | admin123 |
| Organizer | Register with role=organizer | — |
| User | Register with role=user | — |

---

## 📦 Running Both Servers

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.
