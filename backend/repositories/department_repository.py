from typing import Optional, List
from sqlalchemy.orm import Session
from models.departments import Department
from .base_repository import BaseRepository


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self, db: Session):
        super().__init__(Department, db)

    def get_by_name(self, name: str) -> Optional[Department]:
        """Get department by name"""
        return self.db.query(Department).filter(Department.department_name == name).first()

    def search_by_name(self, search_term: str, skip: int = 0, limit: int = 100) -> List[Department]:
        """Search departments by name"""
        return self.db.query(Department).filter(
            Department.department_name.ilike(f"%{search_term}%")
        ).offset(skip).limit(limit).all()