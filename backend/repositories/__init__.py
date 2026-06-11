from .base_repository import BaseRepository
from .user_repository import UserRepository
from .complaint_repository import ComplaintRepository
from .department_repository import DepartmentRepository
from .assignment_repository import AssignmentRepository

# Water Management
from .water_zone_repository import WaterZoneRepository
from .water_tank_repository import WaterTankRepository
from .water_consumption_repository import WaterConsumptionRepository
from .water_leak_repository import WaterLeakRepository
from .water_schedule_repository import WaterScheduleRepository

# Power Management
from .substation_repository import SubstationRepository
from .transformer_repository import TransformerRepository
from .electricity_usage_repository import ElectricityUsageRepository
from .power_outage_repository import PowerOutageRepository
from .maintenance_repository import MaintenanceRepository

# Waste Management
from .waste_vehicle_repository import WasteVehicleRepository
from .waste_bin_repository import WasteBinRepository
from .collection_route_repository import CollectionRouteRepository
from .waste_collection_repository import WasteCollectionRepository
from .sanitation_worker_repository import SanitationWorkerRepository

__all__ = [
    "BaseRepository",
    "UserRepository",
    "ComplaintRepository",
    "DepartmentRepository",
    "AssignmentRepository",
    # Water
    "WaterZoneRepository",
    "WaterTankRepository",
    "WaterConsumptionRepository",
    "WaterLeakRepository",
    "WaterScheduleRepository",
    # Power
    "SubstationRepository",
    "TransformerRepository",
    "ElectricityUsageRepository",
    "PowerOutageRepository",
    "MaintenanceRepository",
    # Waste
    "WasteVehicleRepository",
    "WasteBinRepository",
    "CollectionRouteRepository",
    "WasteCollectionRepository",
    "SanitationWorkerRepository",
]