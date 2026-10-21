# Full-Stack Todo Application (TodoFlow)

A production-ready full-stack Todo application built with **React 19**, **Vite**, **Tailwind CSS**, **Node.js**, **Express 5**, and **MongoDB with Mongoose**.

---

## Table of Contents

- [Overview](#overview)
- [Implemented Features](#implemented-features)
- [Future Enhancements](#future-enhancements)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation and Running](#installation-and-running)
- [REST API Reference](#rest-api-reference)
- [Testing & Quality Verification](#testing--quality-verification)
- [Security & Production Best Practices](#security--production-best-practices)

---

## Overview

TodoFlow is designed to help users organize, track, and complete daily tasks efficiently. The application follows clean architecture principles, separating the reactive client-side user interface from the RESTful backend API while preserving original course concepts and database conventions (`todo_app` database name, `/api/todo` endpoint routes).

---

## Implemented Features

### Frontend (React 19 + Vite + Tailwind CSS)
- **Responsive Layout**: Designed for mobile devices, tablets, and desktop displays with responsive typography, touch targets, and spacing.
- **Task Management (CRUD)**:
  - Create tasks with mandatory description and due date (preventing past dates).
  - View all tasks with date indicators and status badges.
  - Inline editing for active tasks with input autofocus and keyboard shortcuts (`Enter` to save, `Escape` to cancel); completed tasks cannot be edited.
  - Quick toggle completion with optimistic UI updates and strike-through styling.
  - Safe task deletion protected by a confirmation modal.
- **Search & Filtering**:
  - Live client-side keyword search across task descriptions.
  - Filter tabs: **All Tasks**, **Active**, and **Completed** with real-time counters.
  - Bulk action to **Clear Completed** tasks with confirmation dialog.
- **Visual Progress & Metrics**:
  - Metric summary cards displaying total, active, and completed task tallies.
  - Dynamic completion rate progress bar with animated transition.
  - Contextual due date badges (overdue, due today, due tomorrow, upcoming).
- **Feedback & State Handling**:
  - Skeleton loading states while retrieving tasks from the backend.
  - Clear empty states tailored to each filter and search query.
  - Inline error alerts with a **Retry** action button for network failures.
  - Auto-dismissing success notifications for task actions.
  - Client-side form validation preventing blank submissions or oversized text.
  - Accessible ARIA labels and roles for keyboard navigation and screen readers.

### Backend (Node.js + Express 5 + Mongoose 9)
- **RESTful Endpoints**: Full CRUD support on `/api/todo` following standard HTTP methods and status codes.
- **Input Validation & Sanitization**:
  - Validates required task text, trims whitespace, and limits length (max 300 characters).
  - Enforces mandatory due dates on create and update, rejects missing/empty/past calendar dates, and prevents updating completed tasks.
  - Verifies 24-character hexadecimal MongoDB ObjectIds before database queries.
- **Robust Error Handling**:
  - Explicit HTTP status codes (`200`, `201`, `204`, `400`, `404`, `500`).
  - Centralized global error middleware for catching asynchronous errors.
  - Standardized JSON 404 handler for unrecognized routes.
- **Health & Diagnostics**:
  - `GET /api/health` reports service and database connectivity state.
- **Environment & Security**:
  - Configurable CORS origins via `CORS_ORIGIN` environment variable.
  - Database URI injected via `MONGO_URL` with fallback to `mongodb://127.0.0.1:27017/todo_app`.
  - Zero hardcoded credentials; strict `.gitignore` rules protect real secrets.
  - Graceful shutdown handlers for `SIGINT` and `SIGTERM`.

---

## Future Enhancements

The following capabilities are reserved for future releases:
- User authentication and authorization (JWT / session-based multi-tenant support).
- Task categories, tags, and priorities (High, Medium, Low).
- Drag-and-drop task reordering.
- Dark mode theme toggle.
- Push notifications / reminder emails for impending due dates.

---

## Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, React Icons (`react-icons/fi`) |
| **Backend** | Node.js (v20+ / v24), Express 5, Mongoose 9, dotenv, cors |
| **Database** | MongoDB (Local daemon or MongoDB Atlas) |
| **Testing** | Node.js native test runner (`node:test`, `node:assert/strict`) |

---

## Project Structure

```
Full-Stack-Todo-App/
├── Backend/
│   ├── controllers/
│   │   ├── errors.js               # 404 handler
│   │   └── todoItemController.js   # CRUD operations and request validators
│   ├── models/
│   │   └── todoItem.js             # Mongoose TodoItem schema
│   ├── routes/
│   │   ├── todoItemRouter.js       # Express route definitions
│   │   └── totoItemRouter.js       # Backwards-compatibility alias
│   ├── tests/
│   │   └── api.test.js             # Unit and controller integration tests
│   ├── .env.example                # Example backend environment variables
│   ├── app.js                      # Express app setup, middleware, and server bootstrap
│   └── package.json                # Backend scripts and dependencies
├── Frontend/
│   ├── src/
│   │   ├── assets/                 # Static visual assets
│   │   ├── components/
│   │   │   ├── AddTodo.jsx         # Task creation form with validation
│   │   │   ├── AlertBanner.jsx     # Optional / utility alerts
│   │   │   ├── AppName.jsx         # Header branding component
│   │   │   ├── ConfirmModal.jsx    # Accessible modal for destructive operations
│   │   │   ├── Footer.jsx          # Footer attribution
│   │   │   ├── NotificationBanner.jsx # Error and success notification displays
│   │   │   ├── TodoItem.jsx        # Individual task item card (view & edit)
│   │   │   └── TodoItems.jsx       # Task list, metrics, filter bar & search
│   │   ├── services/
│   │   │   └── itemsService.js     # Configurable API client functions
│   │   ├── store/
│   │   │   ├── TodoContext.js      # React Context definition
│   │   │   └── TodoContext-store.jsx # State management provider & reducer
│   │   ├── App.css                 # Global styling & Tailwind CSS directives
│   │   ├── App.jsx                 # Top-level app layout
│   │   └── main.jsx                # Application root mount
│   ├── .env.example                # Example frontend environment variables
│   ├── eslint.config.js            # ESLint rules
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend scripts and dependencies
│   └── vite.config.js              # Vite configuration with Tailwind CSS plugin
├── .gitignore                      # Git exclusion rules
└── README.md                       # Project documentation
```

---

## Prerequisites

- **Node.js**: v20.x or higher (v24.x recommended)
- **npm**: v10.x or higher
- **MongoDB**: A running local MongoDB instance or a cloud MongoDB Atlas connection string

---

## Environment Setup

### 1. Backend Configuration
Copy the example environment file:
```bash
cp Backend/.env.example Backend/.env
```

Edit `Backend/.env` with your settings:
```env
# Server Port
PORT=3000

# Node Environment
NODE_ENV=development

# MongoDB Connection String (database: todo_app)
MONGO_URL=mongodb://127.0.0.1:27017/todo_app

# Allowed CORS Origins (comma-separated or * for development)
CORS_ORIGIN=http://localhost:5173

# Optional Session Secret
SESSION_SECRET=replace_with_a_secure_session_secret
```

### 2. Frontend Configuration
Copy the example environment file:
```bash
cp Frontend/.env.example Frontend/.env
```

Edit `Frontend/.env` with your backend API URL:
```env
# Todo API Base URL
VITE_API_BASE_URL=http://localhost:3000/api/todo
```

---

## Installation and Running

### 1. Backend

Navigate to the `Backend/` directory:
```bash
cd Backend
```

Install dependencies:
```bash
npm install
```

Start the server in development mode (with nodemon):
```bash
npm run dev
```

Or run in standard production mode:
```bash
npm start
```

The backend starts listening at `http://localhost:3000` (or the configured `PORT`).

### 2. Frontend

Open a new terminal window and navigate to the `Frontend/` directory:
```bash
cd Frontend
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Open your browser at `http://localhost:5173` to use the application.

---

## REST API Reference

Base URL: `http://localhost:3000/api/todo`

### Endpoints

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & DB connection state | `200 OK` |
| `GET` | `/api/todo` | Retrieve all todo items (sorted newest first) | `200 OK` |
| `POST` | `/api/todo` | Create a new todo item | `201 Created` |
| `PATCH` | `/api/todo/:id` | Update task description and/or due date | `200 OK` |
| `PUT` | `/api/todo/:id/completed` | Toggle completion status | `200 OK` |
| `DELETE` | `/api/todo/:id` | Delete a single todo item by ID | `204 No Content` |
| `DELETE` | `/api/todo/completed` | Delete all completed todo items | `200 OK` |

### Sample Requests & Responses

#### 1. Create a Task
`POST /api/todo`
```json
// Request Body:
{
  "task": "Review pull request updates",
  "date": "2026-10-25"
}

// Response (201 Created):
{
  "_id": "67160ab5f3a09e02c5e31a89",
  "task": "Review pull request updates",
  "date": "2026-10-25T00:00:00.000Z",
  "completed": false,
  "createdAt": "2026-10-21T07:45:00.000Z",
  "updatedAt": "2026-10-21T07:45:00.000Z",
  "__v": 0
}
```

#### 2. Update Task
`PATCH /api/todo/67160ab5f3a09e02c5e31a89`
```json
// Request Body:
{
  "task": "Review pull request updates and run tests",
  "date": "2026-10-26"
}

// Response (200 OK):
{
  "_id": "67160ab5f3a09e02c5e31a89",
  "task": "Review pull request updates and run tests",
  "date": "2026-10-26T00:00:00.000Z",
  "completed": false,
  "createdAt": "2026-10-21T07:45:00.000Z",
  "updatedAt": "2026-10-21T07:50:00.000Z",
  "__v": 0
}
```

#### 3. Mark Task Completed
`PUT /api/todo/67160ab5f3a09e02c5e31a89/completed`
```json
// Request Body:
{
  "completed": true
}

// Response (200 OK):
{
  "_id": "67160ab5f3a09e02c5e31a89",
  "task": "Review pull request updates and run tests",
  "date": "2026-10-26T00:00:00.000Z",
  "completed": true,
  "createdAt": "2026-10-21T07:45:00.000Z",
  "updatedAt": "2026-10-21T07:55:00.000Z",
  "__v": 0
}
```

#### 4. Delete Single Task
`DELETE /api/todo/67160ab5f3a09e02c5e31a89`
```
// Response: 204 No Content
```

#### 5. Clear All Completed Tasks
`DELETE /api/todo/completed`
```json
// Response (200 OK):
{
  "message": "Completed todos removed successfully.",
  "deletedCount": 3
}
```

#### Error Response Format
When input is invalid or a resource is not found:
```json
// 400 Bad Request
{
  "message": "Task description cannot be empty."
}

// 404 Not Found
{
  "message": "Todo item not found."
}
```

---

## Testing & Quality Verification

### Run Backend Tests
The backend includes automated tests covering validation, error handling, 404 routes, and CRUD operations using the built-in Node.js test runner:
```bash
cd Backend
npm test
```
Result: 28 passing tests (including date requirement, calendar date preservation, completed task edit protection, format validation, and past date rejection).

### Run Frontend Unit Tests
To test date status calculation, calendar day diff, ISO timestamp extraction, and task editability:
```bash
cd Frontend
npm test
```
Result: 15 passing tests (covering today, tomorrow, yesterday, future dates, ISO timestamps, editability rules, and boundary conditions).

### Run Frontend Linting
To check code formatting and verify React Hooks & ESLint rules:
```bash
cd Frontend
npm run lint
```
Result: 0 errors, 0 warnings.

### Build Frontend Production Assets
To verify production bundle compilation:
```bash
cd Frontend
npm run build
```
Result: Built successfully without errors.

---

## Security & Production Best Practices

1. **Environment Separation**: Real `.env` files are excluded by `.gitignore`. Template `.env.example` files are provided for configuration.
2. **CORS Hardening**: In production, specify explicit client domains in `CORS_ORIGIN` (e.g. `https://todo.yourdomain.com`) instead of wildcard `*`.
3. **Database Security**: Never commit MongoDB Atlas credentials. Use secure secret management in deployment environments (e.g., Docker secrets, AWS Secrets Manager, Vercel/Render environment variables).
4. **Input Constraints**: Client and server-side boundaries reject oversized payloads and prevent database injection or malformed ObjectId crashes.

