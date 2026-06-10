from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database.database import Base

class WasteCollectionLog(Base):
    __tablename__ = "waste_collection_logs"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("collection_routes.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("waste_vehicles.id"), nullable=False)
    collection_date = Column(DateTime, nullable=False)
    collected_weight_kg = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())