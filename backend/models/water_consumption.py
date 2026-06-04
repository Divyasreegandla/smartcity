from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.database import Base

class WaterConsumption(Base):
    __tablename__ = "water_consumption"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("water_zones.id"), nullable=False)
    consumption_date = Column(DateTime, nullable=False)
    total_liters_consumed = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())