# 💼 Mini Job Portal

A full-stack job portal web application built with **React**, **Node.js**, **Express.js**, and **MongoDB**.

---

## 🚀 Features

### Job Management
- ✅ **Create Job** — Post jobs with title, company, location, type, salary, description, and logo URL
- ✅ **View Jobs** — Paginated grid listing with company logo, type badge, salary, and time-ago
- ✅ **Job Details** — Full job page with all details
- ✅ **Edit Job** — Pre-filled form to update any field
- ✅ **Delete Job** — Confirmation modal before deletion; cascades to applications

### Candidate Features
- ✅ **Apply to Jobs** — Submit name, email, phone; duplicate check prevents re-applying
- ✅ **View Applications** — Recruiters can view all applicants per job

### Bonus Features
- ✅ **Search** — Search by title, company, or location
- ✅ **Filter by Type** — Full-time, Part-time, Remote, Internship, Contract
- ✅ **Sort by Salary** — Ascending / Descending
- ✅ **Pagination** — 6 jobs per page, smart page numbers
- ✅ **Dark Mode** — Toggle with persistence via `localStorage`
- ✅ **Responsive Design** — Mobile-first CSS, works on phone/tablet/desktop
- ✅ **Company Logo URL** — Display company logos via URL field

---

## 🛠️ Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | React 18, React Router v7, TypeScript, Vite, CSS (custom) |
| Backend   | Node.js, Express.js 5, RESTful API                      |
| Database  | MongoDB, Mongoose 9                                     |
| Dev Tools | Vite (frontend bundler), dotenv, cors                   |

---

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | https://nodejs.org |
| **npm** | v9 or higher (comes with Node.js) | — |
| **MongoDB** | v6 or higher | https://www.mongodb.com/try/download/community |

> **Verify your installations:**
> ```bash
> node -v
> npm -v
> mongod --version
> ```

---

## 📁 Folder Structure

```
mini_project/
├── backend/
│   ├── controllers/
│   │   └── jobController.js   # Business logic for all endpoints
│   ├── middleware/
│   │   └── errorHandler.js    # Global error handling middleware
│   ├── models/
│   │   ├── Job.js             # Mongoose Job schema
│   │   └── Application.js     # Mongoose Application schema
│   ├── routes/
│   │   └── jobs.js            # All /api/jobs routes
│   ├── .env                   # Environment variables (PORT, MONGO_URI)
│   ├── package.json
│   └── server.js              # Express entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ApplicationForm.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   └── Pagination.jsx
│   │   ├── pages/
│   │   │   ├── CreateJobPage.jsx
│   │   │   ├── EditJobPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   └── JobDetailPage.jsx
│   │   ├── api.js             # Fetch API helper
│   │   ├── App.jsx            # Router + Navbar + Theme
│   │   ├── index.css          # Global design system
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── tsconfig.json
│   └── package.json
│
├── package.json               # Root scripts (convenience)
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

Make sure MongoDB is running locally on the default port **27017**.

**On Windows (if installed as a service):**
```bash
# MongoDB usually starts automatically. If not, run:
net start MongoDB
```

**On Windows (manual / not installed as a service):**
```bash
mongod --dbpath "C:\data\db"
```

**On macOS / Linux:**
```bash
mongod
# or if using Homebrew:
brew services start mongodb-community
```

---

### Step 3 — Configure Environment Variables

The backend requires a `.env` file. A default one is already provided at `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mini_job_portal
```

> Edit this file if your MongoDB runs on a different host, port, or you want to use MongoDB Atlas (cloud).  
> **Atlas example:** `MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mini_job_portal`

---

### Step 4 — Install Dependencies

You need to install dependencies for both `backend` and `frontend` separately.

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

---

## ▶️ Running the Application

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Start the Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

> **Health check:** Open http://localhost:5000 in your browser. You should see:
> ```json
> { "message": "Mini Job Portal API is running 🚀" }
> ```

---

### Terminal 2 — Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

> Open **http://localhost:5173** in your browser to use the app.

---

### Quick Start (from project root)

Alternatively, use the root-level convenience scripts (each in a separate terminal):

```bash
# Terminal 1 — Backend
npm run backend

# Terminal 2 — Frontend
npm run frontend
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

| Method   | Endpoint                          | Description                              |
|----------|-----------------------------------|------------------------------------------|
| `GET`    | `/api/jobs`                       | Fetch all jobs (search, filter, sort, paginate) |
| `POST`   | `/api/jobs`                       | Create a new job posting                 |
| `GET`    | `/api/jobs/:id`                   | Get a specific job by ID                 |
| `PUT`    | `/api/jobs/:id`                   | Update / edit a job posting              |
| `DELETE` | `/api/jobs/:id`                   | Delete a job posting                     |
| `POST`   | `/api/jobs/:id/apply`             | Submit an application for a job          |
| `GET`    | `/api/jobs/:id/applications`      | Get all applications for a job           |

### Query Parameters for `GET /api/jobs`

| Param    | Description                    | Example              |
|----------|--------------------------------|----------------------|
| `search` | Search by title/company/location | `?search=developer` |
| `type`   | Filter by job type             | `?type=Remote`       |
| `sort`   | Sort order for salary          | `?sort=salary_asc`   |
| `page`   | Page number (default: 1)       | `?page=2`            |
| `limit`  | Jobs per page (default: 6)     | `?limit=6`           |

---

## 🌐 Environment Variables Reference

| Variable    | Default                                      | Description               |
|-------------|----------------------------------------------|---------------------------|
| `PORT`      | `5000`                                       | Port the backend listens on |
| `MONGO_URI` | `mongodb://localhost:27017/mini_job_portal`   | MongoDB connection string  |

---

## 🐛 Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `MongoDB connection error` | MongoDB not running | Start `mongod` (see Step 2) |
| `EADDRINUSE: port 5000` | Port already in use | Change `PORT` in `backend/.env` |
| `EADDRINUSE: port 5173` | Port already in use | Vite will auto-select the next available port |
| Frontend can't reach backend | CORS or wrong URL | Ensure backend is running on port 5000 |
| `npm install` fails | Node.js version too old | Upgrade to Node.js v18+ |

---

## 👨‍💻 Author

Built for the Full Stack Mini Project Assignment.

**Stack:** React · TypeScript · Vite · Node.js · Express · MongoDB · Mongoose
