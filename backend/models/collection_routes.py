from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Time
from sqlalchemy.sql import func
from database.database import Base
import enum

class RouteStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CANCELLED = "cancelled"

class CollectionRoute(Base):
    __tablename__ = "collection_routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(20), unique=True, index=True, nullable=False)
    route_name = Column(String(100), nullable=False)
    area_name = Column(String(100), nullable=False)
    assigned_vehicle_id = Column(Integer, ForeignKey("waste_vehicles.id"), nullable=True)
    collection_schedule = Column(String(100), nullable=False)
    status = Column(Enum(RouteStatus), default=RouteStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())