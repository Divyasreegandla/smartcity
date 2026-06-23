# models/__init__.py - Complete list
from .users import User
from .citizen_profiles import CitizenProfile
from .departments import Department
from .complaints import Complaint
from .complaint_assignments import ComplaintAssignment
from .complaint_attachments import ComplaintAttachment
from .complaint_status_history import ComplaintStatusHistory
from .bill_categories import BillCategory
from .citizen_bills import CitizenBill
from .bill_payments import BillPayment
from .payment_receipts import PaymentReceipt
from .email_verifications import EmailVerification
from .mobile_verifications import MobileVerification
from .water_zones import WaterZone
from .water_tanks import WaterTank
from .water_consumption import WaterConsumption
from .water_leak_reports import WaterLeakReport
from .water_supply_schedules import WaterSupplySchedule
from .substations import Substation
from .transformers import Transformer
from .transformer_maintenance import TransformerMaintenance
from .electricity_usage import ElectricityUsage
from .power_outages import PowerOutage
from .waste_vehicles import WasteVehicle
from .waste_bins import WasteBin
from .collection_routes import CollectionRoute
from .waste_collection_logs import WasteCollectionLog
from .sanitation_workers import SanitationWorker
from .traffic_signals import TrafficSignal
from .traffic_incidents import TrafficIncident
from .congestion_reports import CongestionReport
from .road_maintenance import RoadMaintenance
from .traffic_violations import TrafficViolation

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