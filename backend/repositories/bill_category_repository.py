from typing import Optional, List
from sqlalchemy.orm import Session
from models.bill_categories import BillCategory
from .base_repository import BaseRepository


class BillCategoryRepository(BaseRepository[BillCategory]):
    def __init__(self, db: Session):
        super().__init__(BillCategory, db)

    def get_by_name(self, name: str) -> Optional[BillCategory]:
        return self.db.query(BillCategory).filter(BillCategory.category_name == name).first()

    def get_all_categories(self) -> List[BillCategory]:
        return self.db.query(BillCategory).all()