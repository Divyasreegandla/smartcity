from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class SubstationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class Substation(Base):
    __tablename__ = "substations"

    id = Column(Integer, primary_key=True, index=True)
    substation_code = Column(String(20), unique=True, index=True, nullable=False)
    substation_name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    capacity_mw = Column(Float, nullable=False)
    status = Column(Enum(SubstationStatus), default=SubstationStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())