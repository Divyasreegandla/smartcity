from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from repositories.user_repository import UserRepository
from repositories.citizen_profile_repository import CitizenProfileRepository
from schemas.citizen_schemas import CitizenProfileResponse, CitizenProfileUpdate
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/citizens", tags=["Citizens"])


@router.get("/", response_model=List[dict])
def get_all_citizens(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    return user_repo.get_citizens_with_profiles()


@router.get("/{user_id}", response_model=CitizenProfileResponse)
def get_citizen_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile_repo = CitizenProfileRepository(db)
    profile = profile_repo.get_by_user_id(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile


@router.put("/{user_id}", response_model=CitizenProfileResponse)
def update_citizen_profile(
    user_id: int,
    profile_data: CitizenProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile_repo = CitizenProfileRepository(db)
    profile = profile_repo.get_by_user_id(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_data.model_dump(exclude_unset=True)
    updated_profile = profile_repo.update(profile.id, **update_data)
    
    return updated_profile