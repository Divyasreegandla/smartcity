from sqlalchemy.orm import Session
from typing import List, Optional
from models.departments import Department
from models.complaint_assignments import ComplaintAssignment
from models.complaints import Complaint
from schemas.department_schemas import DepartmentCreate, DepartmentUpdate

class DepartmentService:
    """Service class for department-related operations"""
    
    @staticmethod
    def get_all_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
        return db.query(Department).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_department_by_id(db: Session, department_id: int) -> Optional[Department]:
        return db.query(Department).filter(Department.id == department_id).first()
    
    @staticmethod
    def get_department_by_name(db: Session, department_name: str) -> Optional[Department]:
        return db.query(Department).filter(Department.department_name == department_name).first()
    
    @staticmethod
    def create_department(db: Session, department_data: DepartmentCreate) -> Department:
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
    def update_department(db: Session, department_id: int, department_data: DepartmentUpdate) -> Optional[Department]:
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
        department = db.query(Department).filter(Department.id == department_id).first()
        if not department:
            return False
        
        db.delete(department)
        db.commit()
        return True