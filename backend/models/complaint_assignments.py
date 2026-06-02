from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.sql import func
from database.database import Base

class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)  # Can be null if assigned to department only
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Who made the assignment
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    remarks = Column(String(500), nullable=True)