from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class TankStatus(str, enum.Enum):
    FULL = "full"
    PARTIAL = "partial"
    LOW = "low"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

class WaterTank(Base):
    __tablename__ = "water_tanks"

    id = Column(Integer, primary_key=True, index=True)
    tank_name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    capacity_liters = Column(Float, nullable=False)
    current_level = Column(Float, default=0)
    status = Column(Enum(TankStatus), default=TankStatus.PARTIAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())