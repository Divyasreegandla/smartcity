from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database.database import engine, Base
from routers import (
    auth_router, citizens_router, complaints_router, 
    departments_router, assignments_router,
    water_zones_router, water_schedules_router,
    water_tanks_router, water_consumption_router,
    water_leaks_router, water_dashboard_router,
    substations_router, transformers_router,
    electricity_usage_router, power_outages_router,
    maintenance_router, power_dashboard_router
)


# Create tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
Path("uploads/complaints").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Smart City Platform", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Phase 1 & 2 routers
app.include_router(auth_router)
app.include_router(citizens_router)
app.include_router(complaints_router)
app.include_router(departments_router)
app.include_router(assignments_router)

# Include Phase 3 routers
app.include_router(water_zones_router)
app.include_router(water_schedules_router)
app.include_router(water_tanks_router)
app.include_router(water_consumption_router)
app.include_router(water_leaks_router)
app.include_router(water_dashboard_router)  # NEW
app.include_router(substations_router)
app.include_router(transformers_router)
app.include_router(electricity_usage_router)
app.include_router(power_outages_router)
app.include_router(maintenance_router)
app.include_router(power_dashboard_router)

@app.get("/")
def root():
    return {
        "message": "Smart City Platform API", 
        "version": "4.0.0",
        "modules": ["Auth", "Citizens", "Complaints", "Departments", "Water Supply", "Electricity Power"]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}