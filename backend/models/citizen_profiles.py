from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func

from database.database import Base


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String(15), default="")
    address = Column(String(255), default="")
    city = Column(String(50), default="")
    state = Column(String(50), default="")
    pincode = Column(String(10), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())