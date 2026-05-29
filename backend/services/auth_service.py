from sqlalchemy.orm import Session
from models.users import User
from models.citizen_profiles import CitizenProfile
from schemas.auth_schemas import UserCreate
from utils.auth_utils import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status

class AuthService:
    """
    Service class for authentication-related operations
    """
    
    @staticmethod
    def register_user(db: Session, user_data: UserCreate):
        """
        Register a new user
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            password_hash=hashed_password,
            role=user_data.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create empty citizen profile
        citizen_profile = CitizenProfile(
            user_id=db_user.id,
            phone="",
            address="",
            city="",
            state="",
            pincode=""
        )
        db.add(citizen_profile)
        db.commit()
        
        # Generate token
        access_token = create_access_token(
            data={"id": db_user.id, "email": db_user.email, "role": db_user.role}
        )
        
        return db_user, access_token
    
    @staticmethod
    def login_user(db: Session, email: str, password: str):
        """
        Authenticate user and return token
        """
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is deactivated. Please contact administrator."
            )
        
        # Generate token
        access_token = create_access_token(
            data={"id": user.id, "email": user.email, "role": user.role}
        )
        
        return user, access_token