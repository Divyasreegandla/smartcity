from sqlalchemy.orm import Session
from typing import List, Optional
from repositories.department_repository import DepartmentRepository
from schemas.department_schemas import DepartmentCreate, DepartmentUpdate


class DepartmentService:
    def __init__(self, db: Session):
        self.db = db
        self.department_repo = DepartmentRepository(db)

    def create_department(self, department_data: DepartmentCreate):
        """Create a new department"""
        existing = self.department_repo.get_by_name(department_data.department_name)
        if existing:
            return None, "Department already exists"
        
        department = self.department_repo.create(**department_data.model_dump())
        return department, None

    def get_all_departments(self, skip: int = 0, limit: int = 100) -> List:
        """Get all departments"""
        return self.department_repo.get_all(skip=skip, limit=limit)

    def get_department_by_id(self, department_id: int):
        """Get department by ID"""
        return self.department_repo.get_by_id(department_id)

    def update_department(self, department_id: int, department_data: DepartmentUpdate):
        """Update a department"""
        department = self.department_repo.get_by_id(department_id)
        if not department:
            return None
        
        update_data = department_data.model_dump(exclude_unset=True)
        updated = self.department_repo.update(department_id, **update_data)
        return updated

    def delete_department(self, department_id: int) -> bool:
        """Delete a department"""
        return self.department_repo.delete(department_id)

    def search_departments(self, search_term: str, skip: int = 0, limit: int = 100) -> List:
        """Search departments by name"""
        return self.department_repo.search_by_name(search_term, skip, limit)