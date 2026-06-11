from sqlalchemy.orm import Session
from repositories.user_repository import UserRepository
from utils.auth_utils import get_password_hash, create_access_token, verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def register_user(self, user_data):
        """Register a new user"""
        # Check if user exists
        existing = self.user_repo.get_by_email(user_data.email)
        if existing:
            return None, "Email already registered"

        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = self.user_repo.create_citizen_with_profile(
            user_data={
                "full_name": user_data.full_name,
                "email": user_data.email,
                "password_hash": hashed_password,
                "role": user_data.role or "citizen"
            }
        )

        # Generate token
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token

    def login_user(self, email, password):
        """Login user"""
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None, None

        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token

    def get_user_profile(self, user_id: int):
        """Get user profile"""
        return self.user_repo.get_by_id(user_id)