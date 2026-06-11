# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database.database import engine, Base
from routers import (
    # Phase 1 & 2 - Auth & Core
    auth_router, 
    citizens_router, 
    complaints_router, 
    departments_router, 
    assignments_router,
    
    # Phase 3 - Water Management
    water_zones_router, 
    water_schedules_router,
    water_tanks_router, 
    water_consumption_router,
    water_leaks_router, 
    water_dashboard_router,
    
    # Phase 3 - Power Management
    substations_router, 
    transformers_router,
    electricity_usage_router, 
    power_outages_router,
    maintenance_router, 
    power_dashboard_router,
    
    # Phase 3 - Waste Management
    waste_vehicles_router, 
    collection_routes_router,
    waste_bins_router, 
    waste_collections_router,
    sanitation_workers_router, 
    waste_dashboard_router
)

# Create tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
Path("uploads/complaints").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Smart City Platform", 
    version="5.0.0",
    description="Smart City Management System with Repository Pattern"
)

# CORS middleware - Allow your frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers WITHOUT /api/v1 prefix (so they match your frontend)
app.include_router(auth_router)           # Now accessible at /auth/*
app.include_router(citizens_router)       # Now accessible at /citizens/*
app.include_router(complaints_router)     # Now accessible at /complaints/*
app.include_router(departments_router)    # Now accessible at /departments/*
app.include_router(assignments_router)    # Now accessible at /assignments/*

# Water Supply routers
app.include_router(water_zones_router)
app.include_router(water_schedules_router)
app.include_router(water_tanks_router)
app.include_router(water_consumption_router)
app.include_router(water_leaks_router)
app.include_router(water_dashboard_router)

# Electricity Power routers
app.include_router(substations_router)
app.include_router(transformers_router)
app.include_router(electricity_usage_router)
app.include_router(power_outages_router)
app.include_router(maintenance_router)
app.include_router(power_dashboard_router)

# Waste Management routers
app.include_router(waste_vehicles_router)
app.include_router(collection_routes_router)
app.include_router(waste_bins_router)
app.include_router(waste_collections_router)
app.include_router(sanitation_workers_router)
app.include_router(waste_dashboard_router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "5.0.0"}

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Smart City Platform API",
        "version": "5.0.0",
        "architecture": "Repository Pattern",
        "modules": [
            "Authentication & Authorization",
            "Citizen Management",
            "Complaint Management",
            "Department Management",
            "Water Supply Management",
            "Electricity Power Management",
            "Waste Management"
        ]
    }