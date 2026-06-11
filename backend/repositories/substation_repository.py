from typing import Optional, List
from sqlalchemy.orm import Session
from models.substations import Substation, SubstationStatus
from .base_repository import BaseRepository


class SubstationRepository(BaseRepository[Substation]):
    def __init__(self, db: Session):
        super().__init__(Substation, db)

    def get_by_code(self, substation_code: str) -> Optional[Substation]:
        """Get substation by code"""
        return self.db.query(Substation).filter(Substation.substation_code == substation_code).first()

    def get_by_name(self, substation_name: str) -> Optional[Substation]:
        """Get substation by name"""
        return self.db.query(Substation).filter(Substation.substation_name == substation_name).first()

    def get_by_status(self, status: SubstationStatus, skip: int = 0, limit: int = 100) -> List[Substation]:
        """Get substations by status"""
        return self.db.query(Substation).filter(Substation.status == status).offset(skip).limit(limit).all()

    def get_active_substations(self) -> List[Substation]:
        """Get all active substations"""
        return self.get_by_status(SubstationStatus.ACTIVE)

    def get_total_capacity(self) -> float:
        """Get total capacity of all substations"""
        result = self.db.query(Substation.capacity_mw).all()
        return sum(r[0] for r in result)