from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.sql import func
from database.database import Base
import enum


class RoadMaintenanceType(str, enum.Enum):
    ROUTINE = "routine"
    REPAIR = "repair"
    RESURFACING = "resurfacing"
    RECONSTRUCTION = "reconstruction"
    EMERGENCY = "emergency"


class RoadMaintenanceStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RoadMaintenance(Base):
    __tablename__ = "road_maintenance"

    id = Column(Integer, primary_key=True, index=True)
    road_name = Column(String(200), nullable=False)
    area_name = Column(String(100), nullable=False)
    maintenance_type = Column(Enum(RoadMaintenanceType), nullable=False)
    start_date = Column(DateTime, nullable=False)
    expected_completion_date = Column(DateTime, nullable=False)
    status = Column(Enum(RoadMaintenanceStatus), nullable=False, default=RoadMaintenanceStatus.PLANNED)
    estimated_cost = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())