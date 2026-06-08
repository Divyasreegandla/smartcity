from sqlalchemy import Column, Enum, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database.database import Base
import enum

class MaintenanceType(str, enum.Enum):
    ROUTINE = "routine"
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    URGENT = "urgent"

class TransformerMaintenance(Base):
    __tablename__ = "transformer_maintenance"

    id = Column(Integer, primary_key=True, index=True)
    transformer_id = Column(Integer, ForeignKey("transformers.id"), nullable=False)
    maintenance_date = Column(DateTime, nullable=False)
    maintenance_type = Column(Enum(MaintenanceType), default=MaintenanceType.ROUTINE)
    maintenance_cost = Column(Float, default=0)
    technician_name = Column(String(100))
    remarks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())