# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database.database import engine, Base, create_tables
from routers import (
    auth_router, citizens_router, complaints_router, 
    departments_router, assignments_router,
    water_zones_router, water_schedules_router, water_tanks_router,
    water_consumption_router, water_leaks_router, water_dashboard_router,
    substations_router, transformers_router, electricity_usage_router,
    power_outages_router, maintenance_router, power_dashboard_router,
    waste_vehicles_router, collection_routes_router, waste_bins_router,
    waste_collections_router, sanitation_workers_router, waste_dashboard_router,
    traffic_signals_router, traffic_incidents_router, congestion_reports_router,
    road_maintenance_router, traffic_violations_router, traffic_dashboard_router,
    bills_router, property_tax_router, payments_router,
)
from routers.otp import router as otp_router


# ✅ Import all models to register them with Base
from models import (
    users, citizen_profiles, departments, complaints,
    complaint_assignments, complaint_attachments, complaint_status_history,
    bill_categories, citizen_bills, bill_payments, payment_receipts,
    email_verifications, mobile_verifications,
    water_zones, water_tanks, water_consumption, water_leak_reports, water_supply_schedules,
    substations, transformers, transformer_maintenance, electricity_usage, power_outages,
    waste_vehicles, waste_bins, collection_routes, waste_collection_logs, sanitation_workers,
    traffic_signals, traffic_incidents, congestion_reports, road_maintenance, traffic_violations
)

# ✅ Create tables on startup
print("=" * 60)
print("🚀 SMART CITY PLATFORM STARTING...")
print("=" * 60)

# Create all tables
create_tables()

# Create uploads directory
Path("uploads/complaints").mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Smart City Platform", 
    version="5.0.0",
    description="Smart City Management System with Repository Pattern"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth_router)
app.include_router(citizens_router)
app.include_router(complaints_router)
app.include_router(departments_router)
app.include_router(assignments_router)
app.include_router(water_zones_router)
app.include_router(water_schedules_router)
app.include_router(water_tanks_router)
app.include_router(water_consumption_router)
app.include_router(water_leaks_router)
app.include_router(water_dashboard_router)
app.include_router(substations_router)
app.include_router(transformers_router)
app.include_router(electricity_usage_router)
app.include_router(power_outages_router)
app.include_router(maintenance_router)
app.include_router(power_dashboard_router)
app.include_router(waste_vehicles_router)
app.include_router(collection_routes_router)
app.include_router(waste_bins_router)
app.include_router(waste_collections_router)
app.include_router(sanitation_workers_router)
app.include_router(waste_dashboard_router)
app.include_router(traffic_signals_router)
app.include_router(traffic_incidents_router)
app.include_router(congestion_reports_router)
app.include_router(road_maintenance_router)
app.include_router(traffic_violations_router)
app.include_router(traffic_dashboard_router)
app.include_router(bills_router)
app.include_router(property_tax_router)
app.include_router(payments_router) 
app.include_router(otp_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "5.0.0"}

@app.get("/")
def root():
    return {
        "message": "Smart City Platform API",
        "version": "5.0.0",
        "modules": [
            "Authentication & Authorization",
            "Citizen Management",
            "Complaint Management",
            "Department Management",
            "Water Supply Management",
            "Electricity Power Management",
            "Waste Management",
            "Property Tax Management"
        ]
    }

print("=" * 60)
print("✅ APPLICATION STARTED SUCCESSFULLY!")
print("📊 Swagger UI: http://localhost:8000/docs")
print("=" * 60)