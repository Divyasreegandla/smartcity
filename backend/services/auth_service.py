from sqlalchemy.orm import Session
from models.users import User
from models.citizen_profiles import CitizenProfile
from utils.auth_utils import verify_password, get_password_hash, create_access_token

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data):
        # Check if user exists
        existing = self.db.query(User).filter(User.email == user_data.email).first()
        if existing:
            return None, "Email already registered"
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Create citizen profile
        profile = CitizenProfile(user_id=user.id)
        self.db.add(profile)
        self.db.commit()
        
        # Generate token
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token
    
    def login_user(self, email, password):
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            return None, None
        
        token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
        return user, token