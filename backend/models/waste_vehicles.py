from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class VehicleStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class VehicleType(str, enum.Enum):
    TRUCK = "truck"
    COMPACTOR = "compactor"
    TIPPER = "tipper"
    DUMPER = "dumper"

class WasteVehicle(Base):
    __tablename__ = "waste_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_number = Column(String(20), unique=True, index=True, nullable=False)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    driver_name = Column(String(100), nullable=False)
    contact_number = Column(String(20), nullable=False)
    status = Column(Enum(VehicleStatus), default=VehicleStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())