from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database.database import Base

class ElectricityUsage(Base):
    __tablename__ = "electricity_usage"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String(100), nullable=False)
    usage_date = Column(DateTime, nullable=False)
    units_consumed = Column(Float, nullable=False)
    peak_load = Column(Float, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())