# services/assignment_service.py
from sqlalchemy.orm import Session
from typing import List, Optional
from repositories.assignment_repository import AssignmentRepository
from repositories.complaint_repository import ComplaintRepository
from repositories.department_repository import DepartmentRepository
from models.complaints import ComplaintStatus


class AssignmentService:
    def __init__(self, db: Session):
        self.db = db
        self.assignment_repo = AssignmentRepository(db)
        self.complaint_repo = ComplaintRepository(db)
        self.department_repo = DepartmentRepository(db)

    def assign_complaint(self, complaint_id: int, department_id: int, assigned_by: int, 
                        assigned_to: Optional[int] = None, remarks: Optional[str] = None):
        """Assign a complaint to a department"""
        # Check if complaint exists
        complaint = self.complaint_repo.get_by_id(complaint_id)
        if not complaint:
            return None, "Complaint not found"
        
        # Check if department exists
        department = self.department_repo.get_by_id(department_id)
        if not department:
            return None, "Department not found"
        
        # Create assignment
        assignment = self.assignment_repo.assign_complaint(
            complaint_id=complaint_id,
            department_id=department_id,
            assigned_by=assigned_by,
            assigned_to=assigned_to,
            remarks=remarks
        )
        
        # Update complaint status to ASSIGNED
        self.complaint_repo.update_status(
            complaint_id=complaint_id,
            new_status=ComplaintStatus.ASSIGNED,
            updated_by=assigned_by,
            remarks=f"Assigned to {department.department_name}"
        )
        
        return assignment, None

    def get_complaint_assignments(self, complaint_id: int) -> List[dict]:
        """Get all assignments for a complaint"""
        assignments = self.assignment_repo.get_by_complaint_id(complaint_id)
        
        result = []
        for assignment in assignments:
            department = self.department_repo.get_by_id(assignment.department_id)
            result.append({
                "id": assignment.id,
                "complaint_id": assignment.complaint_id,
                "department_id": assignment.department_id,
                "department_name": department.department_name if department else "Unknown",
                "assigned_to": assignment.assigned_to,
                "assigned_at": assignment.assigned_at,
                "remarks": assignment.remarks
            })
        
        return result

    def get_my_assignments(self, user_id: int, user_role: str, db) -> List[dict]:
        """Get assignments for current user"""
        if user_role == "admin":
            assignments = self.assignment_repo.get_all()
        else:
            # Get complaints by this citizen
            complaints = self.complaint_repo.get_by_citizen_id(user_id)
            complaint_ids = [c.id for c in complaints]
            assignments = []
            if complaint_ids:
                assignments = self.assignment_repo.get_by_complaint_ids(complaint_ids)
        
        result = []
        for assignment in assignments:
            complaint = self.complaint_repo.get_by_id(assignment.complaint_id)
            department = self.department_repo.get_by_id(assignment.department_id)
            
            result.append({
                "id": assignment.id,
                "complaint_id": assignment.complaint_id,
                "complaint_number": complaint.complaint_number if complaint else None,
                "complaint_title": complaint.title if complaint else None,
                "department_name": department.department_name if department else "Unknown",
                "assigned_at": assignment.assigned_at,
                "remarks": assignment.remarks
            })
        
        return result