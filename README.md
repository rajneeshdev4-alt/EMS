# ExpenseFlow - Full-Stack Expense Management System

A secure, responsive, and scalable Expense Management System built as a technical assessment. It features complete role-based access control (Admin/User), expense approval workflows, analytics dashboards, server-side filtering, and CSV exporting.

## 🚀 Tech Stack

**Frontend:**
- React.js (Vite)
- TypeScript
- Tailwind CSS v4
- React Router DOM
- React Hook Form + Zod (Validation)
- Recharts (Analytics)
- Axios
- Vitest + React Testing Library

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Transactions enabled via Replica Set)
- JWT (HTTP-Only Cookies) & bcrypt
- Zod (Schema Validation)
- Swagger (OpenAPI Documentation)
- Jest + Supertest

**Infrastructure:**
- Docker & Docker Compose
- MongoDB Atlas (Cloud Database)

---

## ✨ Features

- **Authentication & Authorization:** Secure login with password hashing, JWT stored in HTTP-only cookies, and CSRF protection. Role-based routing (Admin vs. User).
- **Expense Management:** Full CRUD operations with soft-delete capability. Optimistic concurrency control (versioning) prevents double-approvals.
- **Workflow:** Users submit expenses (Pending). Admins can Approve or Reject with a required reason. Full audit trail logged for every action.
- **Dashboard Analytics:** Real-time aggregation pipelines calculating total, monthly, and yearly expenses, category breakdowns, and monthly trends.
- **Reports:** Export filtered expense data to CSV (with formula injection protection).
- **Responsive UI:** Mobile-first, SaaS-style dashboard with loading skeletons, toasts, and error boundaries.

---

## 🏗️ Architecture & Folder Structure

This project uses a **Feature-Based Architecture** with a clean separation of concerns.

```text
expense-management-system/
├── backend/
│   ├── src/
│   │   ├── config/        # Env vars, Database connection, Swagger
│   │   ├── constants/     # Enums (Roles, Status, Categories)
│   │   ├── middleware/    # Auth, CSRF, Error Handling, Rate Limiting
│   │   ├── modules/       # Feature modules (auth, users, expenses, etc.)
│   │   │   └── expenses/  # Controller, Service, Model, Routes
│   │   ├── utils/         # Helpers (CSV, Tokens, ApiError)
│   │   ├── validators/    # Zod schemas
│   │   └── app.js         # Express App setup
│   ├── tests/             # Jest API integration tests
│   └── scripts/           # Database seed script
├── frontend/
│   ├── src/
│   │   ├── app/           # Router & Providers
│   │   ├── components/    # Reusable UI (Buttons, Tables, Modals)
│   │   ├── features/      # Feature pages (auth, dashboard, expenses)
│   │   ├── hooks/         # Custom React hooks (useAuth, useDebounce)
│   │   ├── services/      # Axios API client
│   │   └── test/          # Vitest setup
└── docker-compose.yml     # Container orchestration



## 🐳 Running with Docker

This project is fully containerized using Docker and Docker Compose. 

### Prerequisites
- Docker Desktop installed and running.
- A populated `backend/.env` file with your `MONGODB_URI` and `JWT_SECRET`.

### Instructions
1. From the root of the project, build and start the containers:
   ```bash
   docker compose up --build