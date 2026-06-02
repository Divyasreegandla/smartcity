# 🏙️ Smart City Management Platform

## Phase 1 & Phase 2 Complete

### 📋 Project Overview
Smart City Management Platform is a comprehensive web application for managing city services, citizen complaints, and administrative tasks.

### 🛠️ Technology Stack

#### Backend
- FastAPI - REST API framework
- SQLAlchemy - ORM for database
- JWT - Authentication
- SQLite/PostgreSQL - Database

#### Frontend
- React 18 - UI framework
- Tailwind CSS - Styling
- React Router - Navigation
- Axios - API calls

### ✨ Features

#### Phase 1 - Authentication & Profile Management
- ✅ User Registration & Login with JWT
- ✅ Role-based Access (Citizen/Admin)
- ✅ Citizen Profile Management
- ✅ Admin can view/edit all citizens

#### Phase 2 - Complaint Management System
- ✅ Create Complaints with auto-generated number
- ✅ Upload Complaint Images
- ✅ Complaint Types (Road, Water, Electricity, Garbage, etc.)
- ✅ Priority Levels (Low, Medium, High, Critical)
- ✅ Status Workflow (Pending → Assigned → In Progress → Resolved)
- ✅ Complaint Status History Tracking
- ✅ Department Management (CRUD)
- ✅ Assign Complaints to Departments
- ✅ Admin Dashboard with Real Statistics
- ✅ Search & Filter Complaints
- ✅ Weekly/Monthly Trend Charts

### 🚀 Installation Guide

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000