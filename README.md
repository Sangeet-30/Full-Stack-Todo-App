# TodoFlow

A full-stack task management application built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB. TodoFlow provides secure user authentication, user-specific task isolation, due date management, real-time search, category filtering, and progress tracking.

## Features

- **Authentication:** User registration, login, logout, and persistent cookie-based sessions.
- **User-Specific Todos:** Isolated task lists scoped strictly to each authenticated account.
- **Todo CRUD:** Create, view, edit, and delete tasks.
- **Completion Tracking:** Toggle task completion status and bulk-clear completed items.
- **Due Date Validation:** Mandatory due dates, past-date prevention, and calendar-day status badges.
- **Search & Filtering:** Real-time search by task name and filtering by All, Active, and Completed.
- **Progress Tracking:** Dynamic completion percentage and active task counters.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Icons
- **Backend:** Node.js, Express 5, express-session, connect-mongo
- **Database & Security:** MongoDB (Atlas), Mongoose, bcryptjs

## Project Structure

```text
Full-Stack-Todo-App/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── app.js
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   └── package.json
└── README.md
```

## Run Locally

### Prerequisites

- Node.js 20 or higher
- npm
- Local MongoDB instance or MongoDB Atlas account

### 1. Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
```

Configure `Backend/.env`:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/todo_app
SESSION_SECRET=your_secure_random_secret_at_least_32_characters
CORS_ORIGIN=http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
```

The backend server runs at `http://localhost:3000`.

### 2. Frontend Setup

Open a separate terminal:

```bash
cd Frontend
npm install
cp .env.example .env
```

Configure `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/todo
VITE_AUTH_BASE_URL=http://localhost:3000/api/auth
```

Start the frontend development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## Deployment

TodoFlow is designed for deployment across MongoDB Atlas, Render, and Vercel.

### 1. MongoDB Atlas

1. Create a cluster in MongoDB Atlas.
2. Create a database user with read/write permissions.
3. Allow network access for your hosting environment.
4. Copy the connection string for the backend `MONGO_URL`.

### 2. Backend on Render

Deploy as a **Web Service** connected to your repository:

- **Root Directory:** `Backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Required Environment Variables:

```env
NODE_ENV=production
MONGO_URL=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_random_secret_min_32_characters
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 3. Frontend on Vercel

Import the repository into Vercel:

- **Root Directory:** `Frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Required Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/todo
VITE_AUTH_BASE_URL=https://your-backend.onrender.com/api/auth
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Log in and establish session |
| `POST` | `/api/auth/logout` | Log out and destroy session |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### Todos

All Todo endpoints require an authenticated session.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/todo` | Retrieve authenticated user's todos |
| `POST` | `/api/todo` | Create a new todo |
| `PATCH` | `/api/todo/:id` | Update an existing todo |
| `PUT` | `/api/todo/:id/completed` | Toggle completion status |
| `DELETE` | `/api/todo/:id` | Delete a single todo |
| `DELETE` | `/api/todo/completed` | Clear all completed todos |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service and database connectivity status |

## Author

**Sangeet** — [GitHub Profile](https://github.com/Sangeet-30)
