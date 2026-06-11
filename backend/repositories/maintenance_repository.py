from typing import Optional, List
from sqlalchemy.orm import Session
from models.transformer_maintenance import TransformerMaintenance, MaintenanceType
from .base_repository import BaseRepository


class MaintenanceRepository(BaseRepository[TransformerMaintenance]):
    def __init__(self, db: Session):
        super().__init__(TransformerMaintenance, db)

    def get_by_transformer_id(self, transformer_id: int, skip: int = 0, limit: int = 100) -> List[TransformerMaintenance]:
        """Get maintenance records by transformer"""
        return self.db.query(TransformerMaintenance).filter(
            TransformerMaintenance.transformer_id == transformer_id
        ).order_by(TransformerMaintenance.maintenance_date.desc()).offset(skip).limit(limit).all()

    def get_by_type(self, maintenance_type: MaintenanceType, skip: int = 0, limit: int = 100) -> List[TransformerMaintenance]:
        """Get maintenance records by type"""
        return self.db.query(TransformerMaintenance).filter(
            TransformerMaintenance.maintenance_type == maintenance_type
        ).order_by(TransformerMaintenance.maintenance_date.desc()).offset(skip).limit(limit).all()

    def get_by_date_range(self, start_date, end_date) -> List[TransformerMaintenance]:
        """Get maintenance records within date range"""
        return self.db.query(TransformerMaintenance).filter(
            TransformerMaintenance.maintenance_date >= start_date,
            TransformerMaintenance.maintenance_date <= end_date
        ).order_by(TransformerMaintenance.maintenance_date.desc()).all()

    def get_total_maintenance_cost(self, transformer_id: Optional[int] = None) -> float:
        """Get total maintenance cost"""
        query = self.db.query(TransformerMaintenance.maintenance_cost)
        if transformer_id:
            query = query.filter(TransformerMaintenance.transformer_id == transformer_id)
        result = query.all()
        return sum(r[0] for r in result) if result else 0