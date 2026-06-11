from typing import Optional, List
from sqlalchemy.orm import Session
from models.transformers import Transformer, TransformerStatus
from .base_repository import BaseRepository


class TransformerRepository(BaseRepository[Transformer]):
    def __init__(self, db: Session):
        super().__init__(Transformer, db)

    def get_by_code(self, transformer_code: str) -> Optional[Transformer]:
        """Get transformer by code"""
        return self.db.query(Transformer).filter(Transformer.transformer_code == transformer_code).first()

    def get_by_substation_id(self, substation_id: int, skip: int = 0, limit: int = 100) -> List[Transformer]:
        """Get transformers by substation"""
        return self.db.query(Transformer).filter(
            Transformer.substation_id == substation_id
        ).offset(skip).limit(limit).all()

    def get_by_status(self, status: TransformerStatus, skip: int = 0, limit: int = 100) -> List[Transformer]:
        """Get transformers by status"""
        return self.db.query(Transformer).filter(Transformer.status == status).offset(skip).limit(limit).all()

    def get_faulty_transformers(self) -> List[Transformer]:
        """Get all faulty transformers"""
        return self.get_by_status(TransformerStatus.FAULT)

    def get_active_transformers(self) -> List[Transformer]:
        """Get all active transformers"""
        return self.get_by_status(TransformerStatus.ACTIVE)

    def get_total_capacity_by_substation(self, substation_id: int) -> float:
        """Get total transformer capacity for a substation"""
        result = self.db.query(Transformer.capacity_kva).filter(
            Transformer.substation_id == substation_id
        ).all()
        return sum(r[0] for r in result)