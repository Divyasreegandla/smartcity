from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from database.database import Base

class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    remarks = Column(Text)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())