from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from database.database import Base


ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations"""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def create(self, **kwargs) -> ModelType:
        """Create a new record"""
        instance = self.model(**kwargs)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def create_from_dict(self, data: Dict[str, Any]) -> ModelType:
        """Create from dictionary"""
        instance = self.model(**data)
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def get_by_id(self, id: int) -> Optional[ModelType]:
        """Get record by ID"""
        return self.db.query(self.model).filter(self.model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100, **filters) -> List[ModelType]:
        """Get all records with filters"""
        query = self.db.query(self.model)
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.offset(skip).limit(limit).all()

    def update(self, id: int, **kwargs) -> Optional[ModelType]:
        """Update a record"""
        instance = self.get_by_id(id)
        if instance:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(instance, key, value)
            self.db.commit()
            self.db.refresh(instance)
        return instance

    def update_from_dict(self, id: int, data: Dict[str, Any]) -> Optional[ModelType]:
        """Update from dictionary"""
        return self.update(id, **data)

    def delete(self, id: int) -> bool:
        """Delete a record"""
        instance = self.get_by_id(id)
        if instance:
            self.db.delete(instance)
            self.db.commit()
            return True
        return False

    def count(self, **filters) -> int:
        """Count records with filters"""
        query = self.db.query(func.count(self.model.id))
        for key, value in filters.items():
            if value is not None:
                query = query.filter(getattr(self.model, key) == value)
        return query.scalar() or 0

    def exists(self, **filters) -> bool:
        """Check if record exists"""
        return self.count(**filters) > 0

    def get_or_create(self, defaults: Dict[str, Any] = None, **kwargs) -> tuple[ModelType, bool]:
        """Get or create a record"""
        instance = self.db.query(self.model).filter_by(**kwargs).first()
        if instance:
            return instance, False
        if defaults:
            kwargs.update(defaults)
        return self.create(**kwargs), True