from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(100), unique=True, nullable=False)
    department_head = Column(String(100))
    contact_number = Column(String(20))
    created_at = Column(DateTime(timezone=True), server_default=func.now())