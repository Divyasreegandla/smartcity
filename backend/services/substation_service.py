from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from models.substations import Substation, SubstationStatus
from models.transformers import Transformer
from schemas.substation_schemas import SubstationCreate, SubstationUpdate
from datetime import datetime

class SubstationService:
    def __init__(self, db: Session):
        self.db = db

    def create_substation(self, data: SubstationCreate) -> Substation:
        """Create a new substation"""
        db_substation = Substation(**data.model_dump())
        self.db.add(db_substation)
        self.db.commit()
        self.db.refresh(db_substation)
        return db_substation

    def get_all_substations(self, skip: int = 0, limit: int = 100, status: Optional[SubstationStatus] = None) -> List[Substation]:
        """Get all substations with filters"""
        query = self.db.query(Substation)
        if status:
            query = query.filter(Substation.status == status)
        return query.offset(skip).limit(limit).all()

    def get_substation_by_id(self, substation_id: int) -> Optional[Substation]:
        """Get substation by ID"""
        return self.db.query(Substation).filter(Substation.id == substation_id).first()

    def get_substation_by_code(self, code: str) -> Optional[Substation]:
        """Get substation by code"""
        return self.db.query(Substation).filter(Substation.substation_code == code).first()

    def update_substation(self, substation_id: int, data: SubstationUpdate) -> Optional[Substation]:
        """Update substation"""
        substation = self.get_substation_by_id(substation_id)
        if not substation:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(substation, field, value)
        
        self.db.commit()
        self.db.refresh(substation)
        return substation

    def delete_substation(self, substation_id: int) -> bool:
        """Delete substation"""
        substation = self.get_substation_by_id(substation_id)
        if not substation:
            return False
        
        # Check if there are transformers linked
        transformers = self.db.query(Transformer).filter(Transformer.substation_id == substation_id).count()
        if transformers > 0:
            return False  # Cannot delete substation with transformers
        
        self.db.delete(substation)
        self.db.commit()
        return True

    def get_substation_statistics(self, substation_id: int) -> Dict:
        """Get detailed statistics for a substation"""
        substation = self.get_substation_by_id(substation_id)
        if not substation:
            return {}
        
        transformers = self.db.query(Transformer).filter(Transformer.substation_id == substation_id).all()
        
        total_transformers = len(transformers)
        active_transformers = len([t for t in transformers if t.status.value == "active"])
        total_capacity = sum(t.capacity_kva for t in transformers)
        
        return {
            "substation_id": substation.id,
            "substation_name": substation.substation_name,
            "substation_code": substation.substation_code,
            "capacity_mw": substation.capacity_mw,
            "status": substation.status.value,
            "total_transformers": total_transformers,
            "active_transformers": active_transformers,
            "total_transformer_capacity_kva": total_capacity,
            "utilization_percentage": (total_capacity / (substation.capacity_mw * 1000)) * 100 if substation.capacity_mw > 0 else 0
        }