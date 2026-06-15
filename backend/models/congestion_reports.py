from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum


class CongestionLevel(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class CongestionReport(Base):
    __tablename__ = "congestion_reports"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(100), nullable=False)
    congestion_level = Column(Enum(CongestionLevel), nullable=False)
    vehicle_count = Column(Integer, default=0)
    report_time = Column(DateTime, nullable=False, server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())