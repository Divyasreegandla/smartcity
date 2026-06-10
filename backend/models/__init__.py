from .users import User
from .citizen_profiles import CitizenProfile
from .complaints import Complaint, ComplaintPriority, ComplaintStatus
from .complaint_attachments import ComplaintAttachment
from .complaint_status_history import ComplaintStatusHistory
from .departments import Department
from .complaint_assignments import ComplaintAssignment
from .water_zones import WaterZone, ZoneStatus
from .water_supply_schedules import WaterSupplySchedule, SupplyStatus
from .water_tanks import WaterTank, TankStatus
from .water_consumption import WaterConsumption
from .water_leak_reports import WaterLeakReport, LeakStatus
from .substations import Substation, SubstationStatus
from .transformers import Transformer, TransformerStatus
from .electricity_usage import ElectricityUsage
from .power_outages import PowerOutage, OutageStatus
from .transformer_maintenance import TransformerMaintenance, MaintenanceType
# Phase 5 - Waste Management
from .waste_vehicles import WasteVehicle, VehicleStatus, VehicleType
from .collection_routes import CollectionRoute, RouteStatus
from .waste_bins import WasteBin, BinStatus
from .waste_collection_logs import WasteCollectionLog
from .sanitation_workers import SanitationWorker, ShiftType, WorkerStatus

__all__ = [
    "User",
    "CitizenProfile",
    "Complaint",
    "ComplaintPriority",
    "ComplaintStatus",
    "ComplaintAttachment",
    "ComplaintStatusHistory",
    "Department",
    "ComplaintAssignment",
    "WaterZone",
    "ZoneStatus",
    "WaterSupplySchedule",
    "SupplyStatus",
    "WaterTank",
    "TankStatus",
    "WaterConsumption",
    "WaterLeakReport",
    "LeakStatus",
    "Substation",
    "SubstationStatus",
    "Transformer",
    "TransformerStatus",
    "ElectricityUsage",
    "PowerOutage",
    "OutageStatus",
    "TransformerMaintenance",
    "MaintenanceType",
    # Phase 5
    "WasteVehicle",
    "VehicleStatus",
    "VehicleType",
    "CollectionRoute",
    "RouteStatus",
    "WasteBin",
    "BinStatus",
    "WasteCollectionLog",
    "SanitationWorker",
    "ShiftType",
    "WorkerStatus"
]