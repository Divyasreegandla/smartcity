from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.users import User
from models.citizen_profiles import CitizenProfile
from schemas.auth_schemas import UserCreate, UserLogin, Token, UserResponse
from utils.auth_utils import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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
    
    profile = CitizenProfile(user_id=db_user.id)
    db.add(profile)
    db.commit()
    
    token = create_access_token({"id": db_user.id, "email": db_user.email, "role": db_user.role})
    
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"id": user.id, "email": user.email, "role": user.role})
    
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user