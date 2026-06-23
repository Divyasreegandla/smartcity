from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.database import Base

class BillCategory(Base):
    __tablename__ = "bill_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(50), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())