from typing import Optional, List
from sqlalchemy.orm import Session
from models.users import User
from models.citizen_profiles import CitizenProfile
from .base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Get users by role"""
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

    def get_citizens_with_profiles(self, skip: int = 0, limit: int = 100) -> List[dict]:
        """Get all citizens with their profiles"""
        citizens = self.db.query(User).filter(User.role == "citizen").offset(skip).limit(limit).all()
        result = []
        for user in citizens:
            profile = self.db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
            result.append({
                "id": profile.id if profile else None,
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone": profile.phone if profile else "Not provided",
                "address": profile.address if profile else "Not provided",
                "city": profile.city if profile else "Not provided",
                "state": profile.state if profile else "Not provided",
                "pincode": profile.pincode if profile else "Not provided",
                "created_at": profile.created_at if profile else user.created_at,
                "is_active": user.is_active
            })
        return result

    def create_citizen_with_profile(self, user_data: dict, profile_data: dict = None) -> User:
        """Create citizen with profile"""
        user = self.create(**user_data)
        if profile_data is None:
            profile_data = {}
        profile = CitizenProfile(user_id=user.id, **profile_data)
        self.db.add(profile)
        self.db.commit()
        return user

    def update_user_status(self, user_id: int, is_active: bool) -> Optional[User]:
        """Update user active status"""
        return self.update(user_id, is_active=is_active)