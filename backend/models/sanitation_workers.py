from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class ShiftType(str, enum.Enum):
    MORNING = "morning"
    EVENING = "evening"
    NIGHT = "night"

class WorkerStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"

class SanitationWorker(Base):
    __tablename__ = "sanitation_workers"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    assigned_area = Column(String(100), nullable=False)
    shift_type = Column(Enum(ShiftType), nullable=False)
    status = Column(Enum(WorkerStatus), default=WorkerStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())