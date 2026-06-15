# services/__init__.py
from .auth_service import AuthService
from .complaint_service import ComplaintService, generate_complaint_number
from .department_service import DepartmentService
from .assignment_service import AssignmentService
from .water_service import WaterService
from .power_service import PowerService
from .waste_service import WasteManagementService
from .traffic_signal_service import TrafficSignalService
from .traffic_incident_service import TrafficIncidentService
from .congestion_service import CongestionService
from .road_maintenance_service import RoadMaintenanceService
from .traffic_violation_service import TrafficViolationService
from .traffic_dashboard_service import TrafficDashboardService


__all__ = [
    "AuthService",
    "ComplaintService",
    "generate_complaint_number",
    "DepartmentService",
    "AssignmentService",
    "WaterService",
    "PowerService",
    "WasteManagementService",
     "TrafficSignalService",
    "TrafficIncidentService",
    "CongestionService",
    "RoadMaintenanceService",
    "TrafficViolationService",
    "TrafficDashboardService"
]