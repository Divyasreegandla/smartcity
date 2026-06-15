from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from database.database import Base
import enum


class IncidentType(str, enum.Enum):
    ACCIDENT = "accident"
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    ROAD_CLOSURE = "road_closure"
    PROTEST = "protest"
    CONSTRUCTION = "construction"
    OTHER = "other"

class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str, enum.Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class TrafficIncident(Base):
    __tablename__ = "traffic_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(20), unique=True, index=True, nullable=False)
    incident_type = Column(Enum(IncidentType), nullable=False)
    location = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(IncidentSeverity), default=IncidentSeverity.MEDIUM)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    incident_time = Column(DateTime, nullable=False)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.REPORTED)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())