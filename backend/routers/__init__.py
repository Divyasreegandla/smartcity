from .auth import router as auth_router
from .citizens import router as citizens_router
from .complaints import router as complaints_router
from .departments import router as departments_router
from .assignments import router as assignments_router
from .water_zones import router as water_zones_router
from .water_schedules import router as water_schedules_router
from .water_tanks import router as water_tanks_router
from .water_consumption import router as water_consumption_router
from .water_leaks import router as water_leaks_router
from .water_dashboard import router as water_dashboard_router
from .substations import router as substations_router
from .transformers import router as transformers_router
from .electricity_usage import router as electricity_usage_router
from .power_outages import router as power_outages_router
from .maintenance import router as maintenance_router
from .power_dashboard import router as power_dashboard_router
# Phase 5 - Waste Management
from .waste_vehicles import router as waste_vehicles_router
from .collection_routes import router as collection_routes_router
from .waste_bins import router as waste_bins_router
from .waste_collections import router as waste_collections_router
from .sanitation_workers import router as sanitation_workers_router
from .waste_dashboard import router as waste_dashboard_router

__all__ = [
    "auth_router",
    "citizens_router",
    "complaints_router",
    "departments_router",
    "assignments_router",
    "water_zones_router",
    "water_schedules_router",
    "water_tanks_router",
    "water_consumption_router",
    "water_leaks_router",
    "water_dashboard_router",
    "substations_router",
    "transformers_router",
    "electricity_usage_router",
    "power_outages_router",
    "maintenance_router",
    "power_dashboard_router",
    "waste_vehicles_router",
    "collection_routes_router",
    "waste_bins_router",
    "waste_collections_router",
    "sanitation_workers_router",
    "waste_dashboard_router"
]