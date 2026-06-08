from sqlalchemy import Column, Integer, String, DateTime, Text, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class OutageStatus(str, enum.Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"

class PowerOutage(Base):
    __tablename__ = "power_outages"

    id = Column(Integer, primary_key=True, index=True)
    outage_number = Column(String(20), unique=True, index=True, nullable=False)
    area_name = Column(String(100), nullable=False)
    outage_reason = Column(Text, nullable=False)
    outage_start_time = Column(DateTime, nullable=False)
    outage_end_time = Column(DateTime, nullable=True)
    status = Column(Enum(OutageStatus), default=OutageStatus.REPORTED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())