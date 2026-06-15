from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum


class SignalStatus(str, enum.Enum):
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    FLASHING = "flashing"
    OFF = "off"
    MAINTENANCE = "maintenance"


class TrafficSignal(Base):
    __tablename__ = "traffic_signals"

    id = Column(Integer, primary_key=True, index=True)
    signal_code = Column(String(20), unique=True, index=True, nullable=False)
    junction_name = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    signal_status = Column(Enum(SignalStatus), default=SignalStatus.RED)
    installation_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())