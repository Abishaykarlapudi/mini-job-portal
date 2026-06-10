# 💼 Mini Job Portal

A full-stack job portal web application with **JWT authentication**, **Role-Based Access Control (RBAC)**, **Recruiter & Candidate Dashboards**, and **Saved Jobs** — built with **React**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- ✅ **JWT Integration** — Secure token-based auth; tokens stored in localStorage
- ✅ **Register / Login** — Email + password with bcrypt hashing
- ✅ **Role-Based Access Control** — `recruiter` and `candidate` roles
- ✅ **Protected Routes** — Auth-guarded API endpoints and frontend pages
- ✅ **Rate Limiting** — Global 200 req/15min; auth endpoints 20 req/15min

### 👔 Recruiter Features
- ✅ **Post Jobs** — Only recruiters can create job listings
- ✅ **Edit / Delete Own Jobs** — Ownership enforcement (only your own jobs)
- ✅ **Recruiter Dashboard** — Stats: total jobs posted, total applications received
- ✅ **Manage Applications** — View all applicants per job, update application status (Pending / Reviewed / Accepted / Rejected)

### 🎓 Candidate Features
- ✅ **Apply to Jobs** — Only candidates can apply; duplicate check per user
- ✅ **Candidate Dashboard** — Track applications with real-time status
- ✅ **Saved Jobs** — Bookmark jobs; view & remove from dashboard

### 📋 Job Management
- ✅ **Create / Edit / Delete Job** — Recruiter-only, with ownership guard
- ✅ **View Jobs** — Paginated grid listing (public, no auth required)
- ✅ **Job Details** — Full job page with role-aware actions

### 🔍 Search, Filter & Pagination
- ✅ **Search** — Search by title, company, or location
- ✅ **Filter by Type** — Full-time, Part-time, Remote, Internship, Contract
- ✅ **Sort** — Newest, Oldest, Salary (asc/desc)
- ✅ **Pagination** — 6 jobs per page, smart page numbers

### 🎨 UX & Design
- ✅ **Dark / Light Mode** — Toggle with localStorage persistence
- ✅ **Responsive Design** — Mobile-first CSS, works on phone/tablet/desktop
- ✅ **Role-Aware Navbar** — Shows user name, role pill, and Sign Out when logged in

---

## 🛠️ Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 18, React Router v7, TypeScript, Vite, CSS (custom)         |
| Backend   | Node.js, Express.js 5, RESTful API                                |
| Database  | MongoDB, Mongoose 9                                               |
| Auth      | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)                         |
| Security  | `express-rate-limit`, route guards, ownership checks              |
| Dev Tools | Vite (frontend bundler), dotenv, cors                             |

---

## 📋 Prerequisites

| Tool       | Version           | Download                                       |
|------------|-------------------|------------------------------------------------|
| **Node.js** | v18 or higher    | https://nodejs.org                             |
| **npm**    | v9 or higher      | —                                              |
| **MongoDB** | v6 or higher     | https://www.mongodb.com/try/download/community |

---

## 📁 Folder Structure

```
mini_project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # register, login, getMe
│   │   ├── jobController.js       # Job CRUD + applications (auth-aware)
│   │   └── userController.js      # Dashboard + saved jobs
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + RBAC authorize
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt
│   │   ├── Job.js                 # Job schema (+ postedBy)
│   │   ├── Application.js         # Application schema (+ applicantId, status)
│   │   └── SavedJob.js            # SavedJob schema (userId + jobId, unique)
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── jobs.js                # /api/jobs/* (guarded)
│   │   └── user.js                # /api/user/* (dashboard, saved jobs)
│   ├── .env                       # Environment variables
│   ├── .env.example               # Template for .env
│   ├── package.json
│   └── server.js                  # Express entry + rate limiting
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT state, login/register/logout
│   │   ├── components/
│   │   │   ├── ApplicationForm.jsx # Auth-aware application form
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ProtectedRoute.jsx  # Auth + role guard component
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx    # With role picker
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── JobDetailPage.jsx   # Role-aware actions
│   │   │   ├── CreateJobPage.jsx
│   │   │   └── EditJobPage.jsx
│   │   ├── api.js                  # Auth-aware API helper
│   │   ├── App.jsx                 # Router + AuthProvider + Navbar
│   │   ├── index.css               # Full design system
│   │   └── main.jsx
│   └── package.json
│
├── package.json                    # Root convenience scripts
└── README.md
```

---

## ⚙️ Setup & Installation

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Abishaykarlapudi/mini-job-portal.git
cd mini-job-portal
```

---

### Step 2 — Start MongoDB

```bash
# Windows (service)
net start MongoDB

# Windows (manual)
mongod --dbpath "C:\data\db"

# macOS/Linux
mongod
# or
brew services start mongodb-community
```

---

### Step 3 — Configure Environment Variables

Copy the example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

**`backend/.env`:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini_job_portal
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
```

> **MongoDB Atlas:** Replace `MONGO_URI` with your Atlas connection string.

---

### Step 4 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## ▶️ Running the Application

You need **two terminal windows**.

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
Expected:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

### Quick Start (from project root)
```bash
# Terminal 1
npm run backend

# Terminal 2
npm run frontend
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

### Auth Routes (`/api/auth`)

| Method | Endpoint              | Access  | Description                    |
|--------|-----------------------|---------|--------------------------------|
| `POST` | `/api/auth/register`  | Public  | Register (name, email, password, role) |
| `POST` | `/api/auth/login`     | Public  | Login → returns JWT token      |
| `GET`  | `/api/auth/me`        | Private | Get current user profile       |

**Register / Login response:**
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": { "id": "...", "name": "Jane", "email": "jane@co.com", "role": "recruiter" }
}
```

---

### Job Routes (`/api/jobs`)

| Method   | Endpoint                             | Access              | Description                          |
|----------|--------------------------------------|---------------------|--------------------------------------|
| `GET`    | `/api/jobs`                          | Public              | Fetch all jobs (search, filter, sort, paginate) |
| `GET`    | `/api/jobs/:id`                      | Public              | Get a specific job                   |
| `POST`   | `/api/jobs`                          | 🔒 Recruiter        | Create a new job posting             |
| `PUT`    | `/api/jobs/:id`                      | 🔒 Recruiter (own)  | Update a job posting                 |
| `DELETE` | `/api/jobs/:id`                      | 🔒 Recruiter (own)  | Delete a job posting                 |
| `POST`   | `/api/jobs/:id/apply`                | 🔒 Candidate        | Apply for a job                      |
| `GET`    | `/api/jobs/:id/applications`         | 🔒 Recruiter        | Get all applications for a job       |
| `PATCH`  | `/api/jobs/:id/applications/:appId`  | 🔒 Recruiter        | Update application status            |

**Query Parameters for `GET /api/jobs`:**

| Param    | Description                          | Example              |
|----------|--------------------------------------|----------------------|
| `search` | Search by title/company/location     | `?search=developer`  |
| `type`   | Filter by job type                   | `?type=Remote`       |
| `sort`   | Sort order                           | `?sort=salary_asc`   |
| `page`   | Page number (default: 1)             | `?page=2`            |
| `limit`  | Jobs per page (default: 6)           | `?limit=6`           |

---

### User Routes (`/api/user`)

| Method   | Endpoint                        | Access              | Description                          |
|----------|---------------------------------|---------------------|--------------------------------------|
| `GET`    | `/api/user/dashboard`           | 🔒 Any auth         | Role-aware dashboard data            |
| `GET`    | `/api/user/saved-jobs`          | 🔒 Candidate        | List saved jobs                      |
| `POST`   | `/api/user/saved-jobs/:jobId`   | 🔒 Candidate        | Save a job                           |
| `DELETE` | `/api/user/saved-jobs/:jobId`   | 🔒 Candidate        | Remove a saved job                   |

**All protected endpoints require header:**
```
Authorization: Bearer <jwt_token>
```

---

## 🌐 Environment Variables Reference

| Variable         | Default                                       | Description                  |
|------------------|-----------------------------------------------|------------------------------|
| `PORT`           | `5000`                                        | Backend server port          |
| `MONGO_URI`      | `mongodb://localhost:27017/mini_job_portal`   | MongoDB connection string    |
| `JWT_SECRET`     | —                                             | **Required** — secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d`                                          | JWT token expiry duration    |

---

## 🔒 Security Features

- **Password Hashing** — bcrypt with salt rounds (10)
- **JWT Auth** — Signed tokens with configurable expiry
- **RBAC** — `protect` + `authorize()` middleware on all write routes
- **Ownership Checks** — Recruiter can only edit/delete their own jobs
- **Rate Limiting** — Global 200 req/15min; `/api/auth` limited to 20 req/15min
- **Duplicate Guard** — Candidate can't apply to the same job twice

---

## 🐛 Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `MongoDB connection error` | MongoDB not running | Start `mongod` |
| `Token is invalid or expired` | JWT expired or wrong secret | Check `JWT_SECRET` in `.env` |
| `403 Forbidden` on job creation | Not logged in as recruiter | Register with `role: recruiter` |
| `EADDRINUSE: port 5000` | Port already in use | Change `PORT` in `backend/.env` |
| Frontend can't reach backend | CORS or wrong URL | Ensure backend is on port 5000 |

---

## 👨‍💻 Author

Built for the Full Stack Mini Project Assignment.

**Stack:** React · TypeScript · Vite · Node.js · Express · MongoDB · Mongoose · JWT · bcrypt
