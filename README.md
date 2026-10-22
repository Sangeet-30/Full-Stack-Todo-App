# TodoFlow — Full-Stack Todo App

A full-stack Todo application built with **React 19, Tailwind CSS, Node.js, Express, and MongoDB**. TodoFlow helps users organize daily tasks with secure authentication, task management, search, filters, and progress tracking.

## Features

- **Authentication:** User registration, login, logout, and persistent sessions.
- **Secure Access:** Password hashing and user-specific todo data isolation.
- **Task Management:** Create, view, edit, complete, and delete tasks.
- **Due Dates:** Required due dates, past-date prevention, and timezone-safe date handling.
- **Search & Filters:** Search tasks and filter by All, Active, and Completed.
- **Progress Tracking:** Completion statistics and progress indicators.
- **Responsive UI:** Clean interface for desktop, tablet, and mobile.
- **Session Management:** MongoDB-backed sessions and protected API endpoints.

## Tech Stack

| Frontend | Backend | Database & Security |
|---|---|---|
| React 19 | Node.js | MongoDB Atlas |
| Vite | Express 5 | Mongoose |
| Tailwind CSS 4 | REST API | bcryptjs |
| React Icons | Express Session | Connect Mongo |

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
├── .gitignore
└── README.md
```

## Run Locally

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB local instance or MongoDB Atlas

### 1. Clone the repository

```bash
git clone https://github.com/Sangeet-30/Full-Stack-Todo-App.git
cd Full-Stack-Todo-App
```

### 2. Configure the backend

```bash
cd Backend
npm install
cp .env.example .env
```

Configure `Backend/.env`:

```env
PORT=3000
MONGO_URL=mongodb://127.0.0.1:27017/todo_app
SESSION_SECRET=your_random_secret_of_at_least_32_characters
CORS_ORIGIN=http://localhost:5173
```

Generate a session secret on Linux with:

```bash
openssl rand -base64 32
```

Start the backend:

```bash
npm run dev
```

The backend runs at `http://localhost:3000`.

### 3. Configure the frontend

Open a second terminal:

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

Open `http://localhost:5173` in your browser.

## Deployment

TodoFlow can be deployed using **MongoDB Atlas, Render, and Vercel**.

### 1. MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with appropriate database permissions.
3. Configure network access for your backend hosting environment.
4. Copy your MongoDB connection URI for the backend environment.

### 2. Deploy the backend on Render

Create a Web Service connected to your GitHub repository.

| Setting | Value |
|---|---|
| Root Directory | `Backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Set these environment variables in Render:

```env
NODE_ENV=production
MONGO_URL=your_mongodb_atlas_connection_uri
SESSION_SECRET=your_secure_random_secret
CORS_ORIGIN=https://your-project.vercel.app
```

Use the actual Vercel frontend origin for `CORS_ORIGIN`. Configure production session cookies to use HTTPS and the appropriate cross-site cookie settings.

After deployment, copy the Render backend URL.

### 3. Deploy the frontend on Vercel

Import the repository into Vercel and configure:

| Setting | Value |
|---|---|
| Root Directory | `Frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Set these environment variables in Vercel:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/todo
VITE_AUTH_BASE_URL=https://your-backend.onrender.com/api/auth
```

Replace the example URLs with your actual Render backend URL. Redeploy the frontend after changing environment variables.

### 4. Verify the deployment

After both services are deployed, test:

- User registration and login.
- Session persistence after refreshing the browser.
- Logout.
- Creating, updating, completing, and deleting todos.
- Isolation between different user accounts.
- The backend health endpoint at `/api/health`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the current user |

### Todos

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todo` | Get the authenticated user's todos |
| POST | `/api/todo` | Create a todo |
| PATCH | `/api/todo/:id` | Update an active todo |
| PUT | `/api/todo/:id/completed` | Toggle completion |
| DELETE | `/api/todo/:id` | Delete a todo |
| DELETE | `/api/todo/completed` | Clear completed todos |

All todo endpoints require an authenticated session.

### Health Check

```text
GET /api/health
```

## Run Tests

Backend:

```bash
cd Backend
npm test
```

Frontend:

```bash
cd Frontend
npm test
npm run lint
npm run build
```

Latest reported results:
- Backend: 44 tests passed.
- Frontend: 20 tests passed.
- ESLint: 0 errors and 0 warnings.
- Production build: successful.

## Security

- Passwords are hashed before storage.
- Todo operations are scoped to the authenticated user.
- Sessions are stored in MongoDB.
- Production deployments should use HTTPS and a strong session secret.
- CORS should allow only the intended frontend origin.
- Never commit `.env` files or expose database credentials.

## Author

**Sangeet**

GitHub: [Sangeet-30](https://github.com/Sangeet-30)

---

*Full-Stack Todo App · Built with React 19, Tailwind CSS, Express & MongoDB*

*Built by Sangeet · © 2026 TodoFlow. All rights reserved.*