from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.users import User
from models.citizen_profiles import CitizenProfile
from schemas.citizen_schemas import CitizenProfileResponse, CitizenProfileUpdate
from utils.auth_utils import get_current_user, get_current_admin_user

router = APIRouter(prefix="/citizens", tags=["Citizens"])

@router.get("/", response_model=List[dict])
def get_all_citizens(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    citizens = db.query(User).filter(User.role == "citizen").all()
    result = []
    for user in citizens:
        profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
        result.append({
            "id": profile.id if profile else None,
            "user_id": user.id,
            "phone": profile.phone if profile else "Not provided",
            "address": profile.address if profile else "Not provided",
            "city": profile.city if profile else "Not provided",
            "state": profile.state if profile else "Not provided",
            "pincode": profile.pincode if profile else "Not provided",
            "created_at": profile.created_at if profile else user.created_at,
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role
            }
        })
    return result

@router.get("/{user_id}", response_model=CitizenProfileResponse)
def get_citizen_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()
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
    
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value:
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return profile