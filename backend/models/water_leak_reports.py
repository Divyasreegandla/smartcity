from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class LeakStatus(str, enum.Enum):
    REPORTED = "reported"
    UNDER_REVIEW = "under_review"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class WaterLeakReport(Base):
    __tablename__ = "water_leak_reports"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("water_zones.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(LeakStatus), default=LeakStatus.REPORTED)
    resolved_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())