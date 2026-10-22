# TodoFlow

A full-stack task management application built with React, Tailwind CSS, Node.js, Express, and MongoDB. Manage tasks, set due dates, track progress, and keep your tasks private with session-based authentication.

## Live Demo

**[🚀 Open TodoFlow](https://full-stack-todo-app-sigma-hazel.vercel.app/)**

Try the deployed application and explore task management features.

| Resource | Link |
|---|---|
| **Live Application** | [TodoFlow on Vercel](https://full-stack-todo-app-sigma-hazel.vercel.app/) |
| **GitHub Repository** | [Full-Stack-Todo-App](https://github.com/Sangeet-30/Full-Stack-Todo-App) |
| **Backend API** | [TodoFlow API on Render](https://todo-flow-backend-wndu.onrender.com) |

## Features

- **Authentication:** Registration, login, logout, and persistent cookie-based sessions.
- **Private Tasks:** Each user can access only their own tasks.
- **Task Management:** Create, edit, delete, and complete tasks.
- **Due Dates:** Required due dates with past-date validation.
- **Search & Filters:** Search by task name and filter All, Active, and Completed tasks.
- **Progress Tracking:** Completion percentage and active task counters.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Icons
- **Backend:** Node.js, Express 5, express-session, connect-mongo
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** bcryptjs, cookie-based sessions
- **Deployment:** Vercel, Render

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

- Node.js 20+
- npm
- MongoDB local instance or MongoDB Atlas account

### Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Configure `Backend/.env`:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/todo_app
SESSION_SECRET=your_secure_random_secret
CORS_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### Frontend

In a separate terminal:

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

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deployment

### MongoDB Atlas

Create a database and user, configure network access, and add the connection string to `MONGO_URL` on Render.

### Render — Backend

- **Root Directory:** `Backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Environment variables:

```env
NODE_ENV=production
MONGO_URL=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_random_secret
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel — Frontend

- **Root Directory:** `Frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Environment variables:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/todo
VITE_AUTH_BASE_URL=https://your-backend.onrender.com/api/auth
```

Replace example URLs with your actual deployment URLs.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Log in |
| `POST` | `/api/auth/logout` | Log out |
| `GET` | `/api/auth/me` | Get the current user |

### Todos

All todo endpoints require an authenticated session.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/todo` | Get the user's tasks |
| `POST` | `/api/todo` | Create a task |
| `PATCH` | `/api/todo/:id` | Update a task |
| `PUT` | `/api/todo/:id/completed` | Toggle completion |
| `DELETE` | `/api/todo/:id` | Delete a task |
| `DELETE` | `/api/todo/completed` | Clear completed tasks |

### Health Check

`GET /api/health` — Check backend service health.

## Author

**Sangeet** · [GitHub Profile](https://github.com/Sangeet-30)
