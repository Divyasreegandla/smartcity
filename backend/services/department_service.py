from sqlalchemy.orm import Session
from typing import List, Optional
from backend.models.departments import Department
from backend.models.complaint_assignments import ComplaintAssignment
from backend.models.complaints import Complaint
from schemas.department_schemas import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    """Service class for department-related operations"""
    
    @staticmethod
    def get_all_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        """Get all departments with pagination"""
        return db.query(Department).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_department_by_id(db: Session, department_id: int) -> Optional[Department]:
        """Get department by ID"""
        return db.query(Department).filter(Department.id == department_id).first()
    
    @staticmethod
    def get_department_by_name(db: Session, department_name: str) -> Optional[Department]:
        """Get department by name"""
        return db.query(Department).filter(Department.department_name == department_name).first()
    
    @staticmethod
    def create_department(db: Session, department_data: DepartmentCreate) -> Department:
        """Create a new department"""
        db_department = Department(
            department_name=department_data.department_name,
            department_head=department_data.department_head,
            contact_number=department_data.contact_number
        )
        db.add(db_department)
        db.commit()
        db.refresh(db_department)
        return db_department
    
    @staticmethod
    def update_department(
        db: Session, 
        department_id: int, 
        department_data: DepartmentUpdate
    ) -> Optional[Department]:
        """Update an existing department"""
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            return None
        
        update_data = department_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(department, field, value)
        
        db.commit()
        db.refresh(department)
        return department
    
    @staticmethod
    def delete_department(db: Session, department_id: int) -> bool:
        """Delete a department"""
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            return False
        
        db.delete(department)
        db.commit()
        return True
    
    @staticmethod
    def get_department_complaints(
        db: Session, 
        department_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Complaint]:
        """Get all complaints assigned to a department"""
        assignments = db.query(ComplaintAssignment).filter(
            ComplaintAssignment.department_id == department_id
        ).all()
        
        complaint_ids = [a.complaint_id for a in assignments]
        complaints = db.query(Complaint).filter(
            Complaint.id.in_(complaint_ids)
        ).offset(skip).limit(limit).all()
        
        return complaints
    
    @staticmethod
    def get_department_stats(db: Session, department_id: int) -> dict:
        """Get statistics for a department"""
        assignments = db.query(ComplaintAssignment).filter(
            ComplaintAssignment.department_id == department_id
        ).all()
        
        complaint_ids = [a.complaint_id for a in assignments]
        
        total = len(complaint_ids)
        
        if total == 0:
            return {
                "total_assigned": 0,
                "pending": 0,
                "in_progress": 0,
                "resolved": 0,
                "rejected": 0
            }
        
        # Get complaint status counts
        from backend.models.complaints import ComplaintStatus
        
        pending = db.query(Complaint).filter(
            Complaint.id.in_(complaint_ids),
            Complaint.status == ComplaintStatus.PENDING
        ).count()
        
        in_progress = db.query(Complaint).filter(
            Complaint.id.in_(complaint_ids),
            Complaint.status == ComplaintStatus.IN_PROGRESS
        ).count()
        
        resolved = db.query(Complaint).filter(
            Complaint.id.in_(complaint_ids),
            Complaint.status == ComplaintStatus.RESOLVED
        ).count()
        
        rejected = db.query(Complaint).filter(
            Complaint.id.in_(complaint_ids),
            Complaint.status == ComplaintStatus.REJECTED
        ).count()
        
        return {
            "total_assigned": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected
        }
    
    @staticmethod
    def search_departments(db: Session, search_term: str) -> List[Department]:
        """Search departments by name or head"""
        return db.query(Department).filter(
            (Department.department_name.ilike(f"%{search_term}%")) |
            (Department.department_head.ilike(f"%{search_term}%"))
        ).all()
    
    @staticmethod
    def get_department_contact_info(db: Session, department_id: int) -> Optional[dict]:
        """Get department contact information"""
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            return None
        
        return {
            "department_name": department.department_name,
            "department_head": department.department_head,
            "contact_number": department.contact_number,
            "total_assigned": DepartmentService.get_department_stats(db, department_id)["total_assigned"]
        }