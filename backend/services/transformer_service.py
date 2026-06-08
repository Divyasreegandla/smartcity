from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from models.transformers import Transformer, TransformerStatus
from models.substations import Substation
from models.transformer_maintenance import TransformerMaintenance
from schemas.transformer_schemas import TransformerCreate, TransformerUpdate
from datetime import datetime, timedelta

class TransformerService:
    def __init__(self, db: Session):
        self.db = db

    def create_transformer(self, data: TransformerCreate) -> Transformer:
        """Create a new transformer"""
        db_transformer = Transformer(**data.model_dump())
        self.db.add(db_transformer)
        self.db.commit()
        self.db.refresh(db_transformer)
        return db_transformer

    def get_all_transformers(self, skip: int = 0, limit: int = 100, substation_id: Optional[int] = None, status: Optional[TransformerStatus] = None) -> List[Transformer]:
        """Get all transformers with filters"""
        query = self.db.query(Transformer)
        if substation_id:
            query = query.filter(Transformer.substation_id == substation_id)
        if status:
            query = query.filter(Transformer.status == status)
        return query.offset(skip).limit(limit).all()

    def get_transformer_by_id(self, transformer_id: int) -> Optional[Transformer]:
        """Get transformer by ID"""
        return self.db.query(Transformer).filter(Transformer.id == transformer_id).first()

    def get_transformer_by_code(self, code: str) -> Optional[Transformer]:
        """Get transformer by code"""
        return self.db.query(Transformer).filter(Transformer.transformer_code == code).first()

    def update_transformer(self, transformer_id: int, data: TransformerUpdate) -> Optional[Transformer]:
        """Update transformer"""
        transformer = self.get_transformer_by_id(transformer_id)
        if not transformer:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(transformer, field, value)
        
        self.db.commit()
        self.db.refresh(transformer)
        return transformer

    def get_transformer_maintenance_history(self, transformer_id: int, limit: int = 10) -> List[Dict]:
        """Get maintenance history for a transformer"""
        maintenance_records = self.db.query(TransformerMaintenance).filter(
            TransformerMaintenance.transformer_id == transformer_id
        ).order_by(TransformerMaintenance.maintenance_date.desc()).limit(limit).all()
        
        return [
            {
                "id": m.id,
                "date": m.maintenance_date,
                "type": m.maintenance_type.value,
                "cost": m.maintenance_cost,
                "technician": m.technician_name,
                "remarks": m.remarks
            }
            for m in maintenance_records
        ]

    def get_transformer_health_status(self, transformer_id: int) -> Dict:
        """Calculate transformer health status"""
        transformer = self.get_transformer_by_id(transformer_id)
        if not transformer:
            return {}
        
        # Calculate age of transformer
        years_in_service = (datetime.now() - transformer.installation_date).days / 365.25
        
        # Get maintenance frequency
        maintenance_count = self.db.query(TransformerMaintenance).filter(
            TransformerMaintenance.transformer_id == transformer_id
        ).count()
        
        # Determine health score (0-100)
        health_score = 100
        health_score -= min(years_in_service * 2, 40)  # Age penalty
        health_score += min(maintenance_count * 5, 30)  # Maintenance bonus
        
        health_score = max(0, min(100, health_score))
        
        # Determine health status
        if health_score >= 80:
            health_status = "Good"
            color = "green"
        elif health_score >= 60:
            health_status = "Fair"
            color = "yellow"
        elif health_score >= 40:
            health_status = "Needs Attention"
            color = "orange"
        else:
            health_status = "Critical"
            color = "red"
        
        return {
            "transformer_id": transformer_id,
            "transformer_code": transformer.transformer_code,
            "years_in_service": round(years_in_service, 1),
            "maintenance_count": maintenance_count,
            "health_score": round(health_score),
            "health_status": health_status,
            "status_color": color,
            "current_status": transformer.status.value
        }