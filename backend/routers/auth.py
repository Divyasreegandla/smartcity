from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from schemas.auth_schemas import UserCreate, UserLogin, Token, UserResponse
from services.auth_service import AuthService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, error = service.register_user(user_data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {"access_token": user[1] if isinstance(user, tuple) else None, 
            "token_type": "bearer", 
            "user": user[0] if isinstance(user, tuple) else user}


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    service = AuthService(db)
    user, token = service.login_user(user_credentials.email, user_credentials.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user