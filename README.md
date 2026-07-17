# Employee Management System (EMS) - Production Ready Full-Stack Application

A production-grade, enterprise-ready **Employee Management System (EMS)** designed with secure JWT authentication, robust Role-Based Access Control (RBAC), recursive organizational hierarchy visualization, real-time analytics, and clean architecture.

---

## 🚀 Tech Stack

### Frontend

- **React.js & TypeScript**: Core application framework.
- **Material UI (MUI)**: Enterprise-grade UI component library.
- **Redux Toolkit**: Centralized state management (Auth, UI/Theme preference).
- **React Router DOM**: Client-side routing with Auth Guards and RBAC route protection.
- **React Hook Form & Zod**: Form handling and schema-based client-side validation.
- **Recharts**: Responsive dashboard statistics and trend visualization charts.
- **Axios**: HTTP client with interceptors for automatic JWT attachment and 401 handling.

### Backend

- **Node.js & Express.js (TypeScript)**: Highly structured backend REST API.
- **MongoDB & Mongoose ODM**: Database with relational schemas and reporting hierarchy references.
- **JWT & bcryptjs**: Secure authentication and password hashing.
- **Zod**: Robust request body validation middleware.
- **Helmet, CORS, Express-Rate-Limit**: Backend security headers and rate-limiting.

---

## 📁 Folder Structure

```
employe-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers (Auth, Employee, Org, Dashboard)
│   │   ├── middleware/      # Auth, RBAC, Validation, Error Handling middlewares
│   │   ├── models/          # Mongoose Schemas (Employee Model)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (Hierarchy, circular loop checks)
│   │   ├── validators/      # Zod validation schemas
│   │   ├── utils/           # JWT, Seeding, AppError utilities
│   │   ├── types/           # TS type extensions (Express Request)
│   │   ├── app.ts           # App definition with security middlewares
│   │   └── server.ts        # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance with interceptors
│   │   ├── components/      # Reusable UI components (Dialogs, Guards)
│   │   ├── layouts/         # Responsive sidebar & navbar Dashboard Layout
│   │   ├── pages/           # Pages (Dashboard, Employees, Org Tree, Profile)
│   │   ├── redux/           # Redux Toolkit slices, store, and typed hooks
│   │   ├── theme/           # MUI Light/Dark mode themes
│   │   ├── types/           # Global TypeScript interfaces
│   │   ├── App.tsx          # Router and Theme provider wrapper
│   │   └── main.tsx         # Main entry point
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
└── docker-compose.yml       # Docker orchestrator
```

---

## 🔒 Security & RBAC matrix

| Feature / Resource          |       Super Admin        |         HR Manager          |            Employee            |
| :-------------------------- | :----------------------: | :-------------------------: | :----------------------------: |
| **Dashboard Statistics**    |  ✅ View Stats & Charts  |   ✅ View Stats & Charts    |        ❌ Access Denied        |
| **Create Employee**         |      ✅ Full Access      | ✅ Allowed (No Super Admin) |        ❌ Access Denied        |
| **Edit Employee**           |      ✅ Full Access      | ✅ Allowed (No Super Admin) |        ❌ Access Denied        |
| **Delete Employee (Soft)**  |      ✅ Full Access      |      ❌ Access Denied       |        ❌ Access Denied        |
| **View Employee Directory** |      ✅ Full Access      |       ✅ Full Access        |        ❌ Access Denied        |
| **View Org Tree**           |      ✅ Full Access      |       ✅ Full Access        |        ❌ Access Denied        |
| **Edit Own Profile**        | ✅ Full (Limited fields) |  ✅ Full (Limited fields)   | ✅ Phone, Password, Image only |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- MongoDB (running locally or a MongoDB Atlas connection string)
- Docker & Docker Compose (optional, for containerized run)

### Local Development Setup

1. **Clone and navigate to the project directory**:

   ```bash
   cd employe-management
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ems
   JWT_SECRET=ems_super_secret_jwt_key_2026_prod_ready_secure
   JWT_EXPIRES_IN=1d
   NODE_ENV=development
   ```

3. **Install Dependencies & Seed Database**:

   ```bash
   # Build & Seed Backend
   cd backend
   npm install
   npm run build
   npm run seed      # This seeds 1 Super Admin, 2 HR Managers, and 15 Employees
   npm run dev       # Starts backend dev server on http://localhost:5000

   # Build & Run Frontend
   cd ../frontend
   npm install
   npm run dev       # Starts React Vite app on http://localhost:3000
   ```

### Running with Docker Compose

To spin up the entire application stack (MongoDB, Backend REST API, and Nginx-served Frontend React App) in one command:

```bash
docker-compose up --build
```

Access the application at `http://localhost:3000` and the API at `http://localhost:5000`.

---

## 🔑 Test Credentials (Seeded Data)

All accounts are seeded with the password: **`password123`**

1. **Super Admin**:
   - **Email**: `saurabh.admin@ems.com`
2. **HR Manager 1**:
   - **Email**: `rohan.hr@ems.com`
3. **HR Manager 2**:
   - **Email**: `priya.hr@ems.com`
4. **Standard Employee**:
   - **Email**: `amit.eng@ems.com`

---

## 📡 API Documentation

Every endpoint returns structured JSON with a `success: boolean` flag.

### 1. Authentication

- **POST `/api/auth/login`**
  - **Description**: Authenticates an employee and returns a JWT.
  - **Body**: `{ "email": "saurabh.admin@ems.com", "password": "password123" }`
  - **Response (200)**: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

- **POST `/api/auth/logout`**
  - **Description**: Invalidates session.
  - **Headers**: `Authorization: Bearer <token>`

- **GET `/api/auth/me`**
  - **Description**: Retrieves the profile of the logged-in user.
  - **Headers**: `Authorization: Bearer <token>`

### 2. Employee Management

- **GET `/api/employees`**
  - **Description**: Fetch employees with pagination, search, sorting, and filters.
  - **Access**: Super Admin, HR Manager
  - **Query Params**: `search`, `department`, `role`, `status`, `sortBy`, `order`, `page`, `limit`

- **POST `/api/employees`**
  - **Description**: Create a new employee record.
  - **Access**: Super Admin, HR Manager (HR cannot create Super Admins)
  - **Body**: Create employee details matching Schema validation.

- **PUT `/api/employees/:id`**
  - **Description**: Update employee details.
  - **Access**: Super Admin, HR Manager, or Owner (Owner can only update phone, password, and profileImage).

- **DELETE `/api/employees/:id`**
  - **Description**: Soft delete employee record (sets `isDeleted: true` and status to `Inactive`).
  - **Access**: Super Admin only (prevents deleting active managers with direct reportees).

### 3. Organizational Hierarchy & Dashboard

- **GET `/api/organization/tree`**
  - **Description**: Recursively builds and returns the organization tree starting from top-level CEOs.
  - **Access**: Super Admin, HR Manager

- **GET `/api/employees/:id/reportees`**
  - **Description**: Returns all direct reportees of a specific employee.
  - **Access**: Super Admin, HR Manager

- **PATCH `/api/employees/:id/manager`**
  - **Description**: Updates the reporting manager of an employee. Checks and blocks circular reporting.
  - **Access**: Super Admin, HR Manager

- **GET `/api/dashboard/stats`**
  - **Description**: Aggregates and returns statistics (total count, active, departments) and data trends (monthly joining, departments distribution).
  - **Access**: Super Admin, HR Manager
