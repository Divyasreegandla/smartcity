from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, get_password_hash, create_access_token
from backend.models.citizen_profiles import CitizenProfile

class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.db = db
    
    def register_user(self, user_data):
        # Check if user exists
        existing = self.user_repo.get_by_email(user_data.email)
        if existing:
            return None, "Email already registered"
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = self.user_repo.create({
            "full_name": user_data.full_name,
            "email": user_data.email,
            "password_hash": hashed_password,
            "role": user_data.role
        })
        
        # Create citizen profile
        profile = CitizenProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        
        # Generate token
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token
    
    def login_user(self, email, password):
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None, None
        
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token