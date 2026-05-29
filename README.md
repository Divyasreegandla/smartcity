## 📋 Project Overview

Smart City Management Platform is a comprehensive web application designed to streamline city administration and citizen services. Phase 1 focuses on building the foundation with authentication, role management, and citizen profile management.

### 🎯 Phase 1 Objectives

1. ✅ **Authentication System** - Secure JWT-based authentication
2. ✅ **User Role Management** - Citizen and Admin roles with different permissions
3. ✅ **Citizen Profile Management** - View and update profile information
4. ✅ **Dashboard Setup** - Role-based dashboards with relevant information

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.104.1 | REST API framework |
| PostgreSQL | 15+ | Production database |
| SQLAlchemy | 2.0.23 | ORM for database operations |
| JWT | - | Token-based authentication |
| Bcrypt | 4.0.1 | Password hashing |
| Uvicorn | 0.24.0 | ASGI server |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Tailwind CSS | 3.3.6 | Styling |
| React Router | 6.20.0 | Navigation |
| Axios | 1.6.2 | API calls |
| React Hot Toast | 2.4.1 | Notifications |
| React Icons | 4.12.0 | Icons |

## 📦 Features Implemented

### 🔐 Authentication
- User registration with email validation
- Secure login with JWT token generation
- Password hashing using bcrypt
- Token expiration (24 hours)
- Protected routes on both backend and frontend

### 👥 User Roles

#### Citizen Role
- View personal dashboard
- View own profile information
- Edit own profile (phone, address, city, state, pincode)
- Cannot access admin features

#### Admin Role
- View all registered citizens
- Search citizens by name, email, phone, or city
- Edit ANY citizen's profile
- Full access to citizen management

### 📝 Profile Management
- View complete profile information
- Edit phone number (validation: 10+ digits)
- Edit address (validation: min 5 characters)
- Edit city, state, pincode
- Real-time form validation
- Success/error toast notifications

### 🎨 User Interface
- Responsive design with Tailwind CSS
- Modern gradient backgrounds
- Clean, professional layout
- Mobile-friendly sidebar navigation
- Loading states and animations
- Toast notifications for all actions

## 📡 API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Authenticate user | Public |
| GET | `/auth/profile` | Get current user profile | Authenticated |
| GET | `/citizens/` | Get all citizens | Admin only |
| GET | `/citizens/{id}` | Get citizen by ID | Authenticated |
| PUT | `/citizens/{id}` | Update citizen profile | Authenticated |

# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# Run the backend server:
uvicorn main:app --reload --port 8000

# Frontend Setup
cd frontend

# Install dependencies
npm install

# Run the frontend server:
npm start