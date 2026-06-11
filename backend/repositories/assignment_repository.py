from typing import Optional, List
from sqlalchemy.orm import Session
from models.complaint_assignments import ComplaintAssignment
from .base_repository import BaseRepository


class AssignmentRepository(BaseRepository[ComplaintAssignment]):
    def __init__(self, db: Session):
        super().__init__(ComplaintAssignment, db)

    def get_by_complaint_id(self, complaint_id: int) -> List[ComplaintAssignment]:
        """Get assignments by complaint ID"""
        return self.db.query(ComplaintAssignment).filter(
            ComplaintAssignment.complaint_id == complaint_id
        ).order_by(ComplaintAssignment.assigned_at.desc()).all()

    def get_by_department_id(self, department_id: int, skip: int = 0, limit: int = 100) -> List[ComplaintAssignment]:
        """Get assignments by department"""
        return self.db.query(ComplaintAssignment).filter(
            ComplaintAssignment.department_id == department_id
        ).offset(skip).limit(limit).all()

    def get_by_assigned_to(self, assigned_to: int, skip: int = 0, limit: int = 100) -> List[ComplaintAssignment]:
        """Get assignments by assigned user"""
        return self.db.query(ComplaintAssignment).filter(
            ComplaintAssignment.assigned_to == assigned_to
        ).offset(skip).limit(limit).all()

    def get_latest_assignment(self, complaint_id: int) -> Optional[ComplaintAssignment]:
        """Get latest assignment for a complaint"""
        return self.db.query(ComplaintAssignment).filter(
            ComplaintAssignment.complaint_id == complaint_id
        ).order_by(ComplaintAssignment.assigned_at.desc()).first()

    def assign_complaint(
        self,
        complaint_id: int,
        department_id: int,
        assigned_by: int,
        assigned_to: Optional[int] = None,
        remarks: Optional[str] = None
    ) -> ComplaintAssignment:
        """Assign a complaint to a department/user"""
        return self.create(
            complaint_id=complaint_id,
            department_id=department_id,
            assigned_to=assigned_to,
            assigned_by=assigned_by,
            remarks=remarks
        )

    def get_assignments_for_citizen(self, citizen_id: int, db) -> List[dict]:
        """Get assignments for complaints filed by a citizen"""
        from models.complaints import Complaint
        
        complaints = db.query(Complaint).filter(Complaint.citizen_id == citizen_id).all()
        complaint_ids = [c.id for c in complaints]
        
        assignments = self.db.query(ComplaintAssignment).filter(
            ComplaintAssignment.complaint_id.in_(complaint_ids)
        ).all()
        
        return assignments