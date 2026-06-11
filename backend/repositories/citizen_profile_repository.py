from typing import Optional, List
from sqlalchemy.orm import Session
from models.citizen_profiles import CitizenProfile
from .base_repository import BaseRepository


class CitizenProfileRepository(BaseRepository[CitizenProfile]):
    def __init__(self, db: Session):
        super().__init__(CitizenProfile, db)

    def get_by_user_id(self, user_id: int) -> Optional[CitizenProfile]:
        """Get profile by user ID"""
        return self.db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()

    def update_by_user_id(self, user_id: int, **kwargs) -> Optional[CitizenProfile]:
        """Update profile by user ID"""
        profile = self.get_by_user_id(user_id)
        if profile:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(profile, key, value)
            self.db.commit()
            self.db.refresh(profile)
        return profile