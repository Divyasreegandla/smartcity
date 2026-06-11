# services/__init__.py
from .auth_service import AuthService
from .complaint_service import ComplaintService, generate_complaint_number
from .department_service import DepartmentService
from .assignment_service import AssignmentService
from .water_service import WaterService
from .power_service import PowerService
from .waste_service import WasteManagementService

__all__ = [
    "AuthService",
    "ComplaintService",
    "generate_complaint_number",
    "DepartmentService",
    "AssignmentService",
    "WaterService",
    "PowerService",
    "WasteManagementService",
]