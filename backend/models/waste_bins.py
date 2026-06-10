from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class BinStatus(str, enum.Enum):
    EMPTY = "empty"
    PARTIAL = "partial"
    FULL = "full"
    OVERFLOWING = "overflowing"
    MAINTENANCE = "maintenance"

class WasteBin(Base):
    __tablename__ = "waste_bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(20), unique=True, index=True, nullable=False)
    location = Column(String(255), nullable=False)
    bin_capacity = Column(Float, nullable=False)
    fill_level = Column(Float, default=0)
    status = Column(Enum(BinStatus), default=BinStatus.EMPTY)
    installed_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())