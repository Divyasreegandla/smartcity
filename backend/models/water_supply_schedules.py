from sqlalchemy import Column, Integer, String, DateTime, Time, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class SupplyStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class WaterSupplySchedule(Base):
    __tablename__ = "water_supply_schedules"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("water_zones.id"), nullable=False)
    supply_date = Column(DateTime, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    supply_status = Column(Enum(SupplyStatus), default=SupplyStatus.SCHEDULED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())