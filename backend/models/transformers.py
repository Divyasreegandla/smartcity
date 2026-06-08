from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class TransformerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAULT = "fault"
    MAINTENANCE = "maintenance"

class Transformer(Base):
    __tablename__ = "transformers"

    id = Column(Integer, primary_key=True, index=True)
    transformer_code = Column(String(20), unique=True, index=True, nullable=False)
    substation_id = Column(Integer, ForeignKey("substations.id"), nullable=False)
    location = Column(String(255), nullable=False)
    capacity_kva = Column(Float, nullable=False)
    installation_date = Column(DateTime, nullable=False)
    status = Column(Enum(TransformerStatus), default=TransformerStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())