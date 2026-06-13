# 💼 Mini Job Portal

A full-stack job portal web application with **JWT authentication**, **Role-Based Access Control (RBAC)**, **Recruiter & Candidate Dashboards**, **Interview Scheduling**, **Recruitment Analytics**, **Activity Tracking**, and much more — built with **React**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- ✅ **JWT Integration** — Secure token-based auth; tokens stored in localStorage
- ✅ **Register / Login** — Email + password with bcrypt hashing
- ✅ **Role-Based Access Control** — `recruiter` and `candidate` roles
- ✅ **Protected Routes** — Auth-guarded API endpoints and frontend pages
- ✅ **Rate Limiting** — Global 200 req/15min; auth endpoints 20 req/15min

### 👔 Recruiter Features

#### Feature 1 — Recruiter Dashboard
- ✅ **5 Stat Cards** — Total Jobs, Active Jobs, Closed Jobs, Total Applications, Shortlisted Candidates
- ✅ **Job Filter Bar** — Filter job list by All / Open / Closed
- ✅ **Recent Activity Feed** — Last 10 recruiter actions with relative timestamps

#### Feature 2 — Job Status Management
- ✅ **Open / Closed Status** — Each job card shows a status badge
- ✅ **One-Click Toggle** — "Close Job" / "Reopen" button on every job card
- ✅ **Closed Jobs Hidden** — Closed jobs are hidden from the public job listing

#### Feature 3 — Applicant Management
- ✅ **Search Applicants** — Instant case-insensitive search by name or email
- ✅ **Filter Chips** — Filter by all 6 pipeline stages
- ✅ **Bulk Actions** — Select multiple applicants → Shortlist / Reject / Move to Under Review
- ✅ **Export CSV** — Download applicant list as CSV per job

#### Feature 4 — Application Status Workflow (6-Stage Pipeline)
```
Applied → Under Review → Shortlisted → Interview Scheduled → Hired
                       ↘              ↘ Rejected
```
- ✅ **6 Stages**: Applied, Under Review, Shortlisted, Interview Scheduled, Rejected, Hired
- ✅ **Dropdown per applicant** — change status; Hired/Rejected require confirmation modal
- ✅ **Every change logged** to Activity Feed

#### Feature 5 — Recruiter Notes
- ✅ **Multiple notes per applicant** — Add, edit, delete notes
- ✅ **Timestamped** — Shows relative time ("2 hours ago")
- ✅ **Slide-in sidebar** — Notes panel opens without leaving the page
- ✅ **Visible only to recruiter team**

#### Feature 6 — Interview Scheduling & Management
- ✅ **Schedule Interview** — Date, Time, Mode (Online/Offline), Meeting Link / Location, Remarks
- ✅ **Update Interview** — Modify any detail after scheduling
- ✅ **Cancel Interview** — Removes interview; reverts status to Shortlisted
- ✅ **Auto-status update** — Scheduling sets status to "Interview Scheduled"
- ✅ **Interview badge** — Shows on applicant row when interview is scheduled

#### Feature 7 — Recruitment Analytics (`/analytics`)
- ✅ **Job Analytics Card** — Total, Active, Closed jobs
- ✅ **Applicant Analytics Card** — Total, Shortlisted, Rejected, Hired
- ✅ **Top Performing Job** — Auto-surfaces job with most applications
- ✅ **Hiring Funnel Chart** — Horizontal SVG bar chart showing pipeline drop-off
- ✅ **Applications per Job** — SVG bar chart (top 10 jobs)
- ✅ **Status Breakdown** — Per-stage count with progress bars

#### Feature 8 — Activity Tracking
- ✅ **ActivityLog model** — Every recruiter action stored in MongoDB
- ✅ **Recent Activity Panel** — Last 10 entries shown in dashboard
- ✅ **Relative timestamps** — "2 hours ago", "Yesterday", etc.
- ✅ **Actions logged**: Job created, closed, reopened; status changes; notes; interview scheduling/cancellation; bulk actions

### 🎓 Candidate Features
- ✅ **Apply to Jobs** — With resume URL & cover letter fields
- ✅ **Candidate Dashboard** — Track applications with real-time 6-stage status
- ✅ **Saved Jobs** — Bookmark jobs; view & remove from dashboard
- ✅ **Duplicate Guard** — Can't apply to same job twice

### 📋 Job Management
- ✅ **Create / Edit / Delete Job** — Recruiter-only, with ownership guard
- ✅ **Tags field** — Comma-separated skill tags on job postings
- ✅ **View Jobs** — Paginated grid listing (public, Open jobs only)
- ✅ **Job Details** — Full job page with role-aware actions

### 🔍 Search, Filter & Pagination
- ✅ **Search** — By title, company, or location
- ✅ **Filter by Type** — Full-time, Part-time, Remote, Internship, Contract
- ✅ **Sort** — Newest, Oldest, Salary (asc/desc)
- ✅ **Pagination** — 6 jobs per page

### 🎁 Bonus Features
- ✅ **Export Applicants CSV** — Download per-job applicant list
- ✅ **Bulk Actions** — Shortlist / Reject / Move to Under Review (multi-select)
- ✅ **Hiring Funnel Chart** — Native SVG (no external chart library)
- ✅ **Dashboard Charts** — Applications per job bar chart

---

## 🛠️ Tech Stack

| Layer     | Technology                                                        |
|-----------|-------------------------------------------------------------------|
| Frontend  | React 18, React Router v7, Vite, CSS (custom design system)       |
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
│   │   ├── jobController.js       # Job CRUD + applications + notes + interview + analytics
│   │   └── userController.js      # Role-aware dashboard + saved jobs
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + RBAC authorize
│   │   └── errorHandler.js        # Global error handling
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt
│   │   ├── Job.js                 # Job schema (+ status Open/Closed, tags[])
│   │   ├── Application.js         # Application (6-stage status, notes[], interview{})
│   │   ├── SavedJob.js            # SavedJob (userId + jobId, unique)
│   │   └── ActivityLog.js         # Activity log schema [NEW]
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   ├── jobs.js                # /api/jobs/* (all routes including new ones)
│   │   └── user.js                # /api/user/* (dashboard, saved jobs)
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   ├── ApplicationForm.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── RecruiterDashboard.jsx  # Full feature expansion
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── AnalyticsPage.jsx       # [NEW] Analytics + charts
│   │   │   ├── HomePage.jsx
│   │   │   ├── JobDetailPage.jsx
│   │   │   ├── CreateJobPage.jsx
│   │   │   └── EditJobPage.jsx
│   │   ├── api.js                      # All API methods (expanded)
│   │   ├── App.jsx                     # Router + /analytics route
│   │   ├── index.css                   # Full design system + new styles
│   │   └── main.jsx
│   └── package.json
│
├── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Abishaykarlapudi/mini-job-portal.git
cd mini-job-portal
```

### Step 2 — Start MongoDB

```bash
# Windows (service)
net start MongoDB

# Windows (manual)
mongod --dbpath "C:\data\db"

# macOS/Linux
mongod
```

### Step 3 — Configure Environment Variables

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

### Step 4 — Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

## ▶️ Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

### Auth Routes (`/api/auth`)

| Method | Endpoint             | Access  | Description                          |
|--------|----------------------|---------|--------------------------------------|
| `POST` | `/api/auth/register` | Public  | Register (name, email, password, role) |
| `POST` | `/api/auth/login`    | Public  | Login → returns JWT token            |
| `GET`  | `/api/auth/me`       | Private | Get current user profile             |

---

### Job Routes (`/api/jobs`)

| Method   | Endpoint                                        | Access            | Description                              |
|----------|-------------------------------------------------|-------------------|------------------------------------------|
| `GET`    | `/api/jobs`                                     | Public            | List jobs (search, filter, paginate) — Open only |
| `GET`    | `/api/jobs/:id`                                 | Public            | Get single job                           |
| `POST`   | `/api/jobs`                                     | 🔒 Recruiter      | Create job posting                       |
| `PUT`    | `/api/jobs/:id`                                 | 🔒 Recruiter (own)| Update job posting                       |
| `DELETE` | `/api/jobs/:id`                                 | 🔒 Recruiter (own)| Delete job posting                       |
| `PATCH`  | `/api/jobs/:id/status`                          | 🔒 Recruiter (own)| Toggle job Open ↔ Closed               |
| `GET`    | `/api/jobs/analytics`                           | 🔒 Recruiter      | Recruitment analytics data              |
| `GET`    | `/api/jobs/:id/applications`                    | 🔒 Recruiter      | Get applications (filter: `?status=&search=`) |
| `GET`    | `/api/jobs/:id/applications/export`             | 🔒 Recruiter      | Export applicants as CSV                |
| `PATCH`  | `/api/jobs/:id/applications/bulk`               | 🔒 Recruiter      | Bulk update statuses `{ appIds[], status }` |
| `PATCH`  | `/api/jobs/:id/applications/:appId`             | 🔒 Recruiter      | Update single application status        |
| `POST`   | `/api/jobs/:id/applications/:appId/notes`       | 🔒 Recruiter      | Add note to application                 |
| `PATCH`  | `/api/jobs/:id/applications/:appId/notes/:nId`  | 🔒 Recruiter      | Edit a note                             |
| `DELETE` | `/api/jobs/:id/applications/:appId/notes/:nId`  | 🔒 Recruiter      | Delete a note                           |
| `POST`   | `/api/jobs/:id/applications/:appId/interview`   | 🔒 Recruiter      | Schedule interview                      |
| `PATCH`  | `/api/jobs/:id/applications/:appId/interview`   | 🔒 Recruiter      | Update interview details                |
| `DELETE` | `/api/jobs/:id/applications/:appId/interview`   | 🔒 Recruiter      | Cancel interview                        |
| `POST`   | `/api/jobs/:id/apply`                           | 🔒 Candidate      | Apply to job                            |
| `GET`    | `/api/jobs/:id/applied`                         | 🔒 Candidate      | Check if already applied               |

**Application Status Values:**
```
Applied | Under Review | Shortlisted | Interview Scheduled | Rejected | Hired
```

**Interview Request Body (POST/PATCH interview):**
```json
{
  "date": "2026-06-20",
  "time": "10:30",
  "mode": "Online",
  "meetingLink": "https://meet.google.com/abc-xyz",
  "location": "",
  "remarks": "Technical round"
}
```

**Analytics Response Shape:**
```json
{
  "jobAnalytics": { "totalJobs": 24, "activeJobs": 16, "closedJobs": 8 },
  "applicantAnalytics": { "total": 342, "shortlisted": 57, "rejected": 180, "hired": 12 },
  "topPerformingJob": { "title": "Frontend Developer", "applicationCount": 85 },
  "funnelData": [ { "stage": "Applied", "count": 342 }, ... ],
  "jobPerformance": [ { "title": "...", "applications": 85 }, ... ]
}
```

---

### User Routes (`/api/user`)

| Method   | Endpoint                      | Access       | Description                          |
|----------|-------------------------------|--------------|--------------------------------------|
| `GET`    | `/api/user/dashboard`         | 🔒 Any auth  | Role-aware dashboard data            |
| `GET`    | `/api/user/saved-jobs`        | 🔒 Candidate | List saved jobs                      |
| `POST`   | `/api/user/saved-jobs/:jobId` | 🔒 Candidate | Save a job                           |
| `DELETE` | `/api/user/saved-jobs/:jobId` | 🔒 Candidate | Remove saved job                     |

**Recruiter Dashboard Response (new fields):**
```json
{
  "stats": {
    "totalJobsPosted": 24,
    "activeJobs": 16,
    "closedJobs": 8,
    "totalApplicationsReceived": 342,
    "shortlistedCount": 57,
    "hiredCount": 12
  },
  "jobs": [...],
  "recentActivity": [
    { "message": "Shortlisted John Doe", "createdAt": "..." },
    ...
  ]
}
```

---

## 🌐 Environment Variables

| Variable         | Default                                     | Description                  |
|------------------|---------------------------------------------|------------------------------|
| `PORT`           | `5000`                                      | Backend server port          |
| `MONGO_URI`      | `mongodb://localhost:27017/mini_job_portal` | MongoDB connection string    |
| `JWT_SECRET`     | —                                           | **Required** — JWT signing key |
| `JWT_EXPIRES_IN` | `7d`                                        | Token expiry duration        |

---

## 🔒 Security Features

- **Password Hashing** — bcrypt (10 rounds)
- **JWT Auth** — Signed tokens, configurable expiry
- **RBAC** — `protect` + `authorize()` middleware on all write routes
- **Ownership Checks** — Recruiter can only edit/delete their own jobs
- **Rate Limiting** — Global 200 req/15min; `/api/auth` 20 req/15min
- **Duplicate Guard** — Candidate can't apply to same job twice
- **Closed Job Guard** — Cannot apply to a Closed job

---

## 🐛 Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `MongoDB connection error` | MongoDB not running | Start `mongod` |
| `Token is invalid or expired` | JWT expired | Check `JWT_SECRET` in `.env` |
| `403 Forbidden` on job creation | Not logged in as recruiter | Register with `role: recruiter` |
| `EADDRINUSE: port 5000` | Port in use | Change `PORT` in `backend/.env` |
| Frontend can't reach backend | CORS or wrong URL | Ensure backend is on port 5000 |
| Analytics shows no data | No jobs/applications yet | Create jobs and apply as candidate |

---

## 📊 Marks Distribution

| Feature | Marks |
|---|---|
| Recruiter Dashboard (5 stats, filters, activity) | 15 |
| Applicant Management (search, filter, bulk, export) | 25 |
| Status Workflow (6 stages) | 20 |
| Interview Management (schedule/update/cancel) | 15 |
| Analytics (3 cards + funnel + breakdown) | 15 |
| Code Quality & Structure | 10 |
| **Total** | **100** |

---

## 👨‍💻 Author

Built for the Full Stack Mini Project Assignment.

**Stack:** React · Vite · Node.js · Express · MongoDB · Mongoose · JWT · bcrypt
