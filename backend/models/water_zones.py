from sqlalchemy import Column, Integer, String, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from database.database import Base
import enum

class ZoneStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class WaterZone(Base):
    __tablename__ = "water_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_code = Column(String(20), unique=True, index=True, nullable=False)
    zone_name = Column(String(100), nullable=False)
    area_name = Column(String(200), nullable=False)
    population = Column(Integer, default=0)
    status = Column(Enum(ZoneStatus), default=ZoneStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())