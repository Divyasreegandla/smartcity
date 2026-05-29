from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.users import User
from models.citizen_profiles import CitizenProfile
from schemas.citizen_schemas import (
    CitizenProfileResponse, 
    CitizenProfileUpdate,
    CitizenWithUserResponse
)
from utils.auth_utils import get_current_user, get_current_admin_user

router = APIRouter(prefix="/citizens", tags=["Citizens"])

@router.get("/", response_model=List[CitizenWithUserResponse])
def get_all_citizens(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get all citizens (Admin only)"""
    # Get only users with role='citizen'
    citizens = db.query(User).filter(User.role == "citizen").all()
    result = []
    
    for user in citizens:
        profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user.id).first()
        
        if profile:
            result.append({
                "id": profile.id,
                "user_id": profile.user_id,
                "phone": profile.phone or "",
                "address": profile.address or "",
                "city": profile.city or "",
                "state": profile.state or "",
                "pincode": profile.pincode or "",
                "created_at": profile.created_at,
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role
                }
            })
        else:
            # Create profile on the fly if missing
            new_profile = CitizenProfile(
                user_id=user.id,
                phone="Not provided",
                address="Not provided",
                city="Not provided",
                state="Not provided",
                pincode="00000"
            )
            db.add(new_profile)
            db.commit()
            db.refresh(new_profile)
            
            result.append({
                "id": new_profile.id,
                "user_id": new_profile.user_id,
                "phone": new_profile.phone,
                "address": new_profile.address,
                "city": new_profile.city,
                "state": new_profile.state,
                "pincode": new_profile.pincode,
                "created_at": new_profile.created_at,
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
    """Get citizen profile by user ID"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permission
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get or create profile
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()
    if not profile:
        # Create profile if doesn't exist
        profile = CitizenProfile(
            user_id=user_id,
            phone="Not provided",
            address="Not provided",
            city="Not provided",
            state="Not provided",
            pincode="00000"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

@router.put("/{user_id}", response_model=CitizenProfileResponse)
def update_citizen_profile(
    user_id: int,
    profile_data: CitizenProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update citizen profile"""
    # Check permission
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get or create profile
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == user_id).first()
    if not profile:
        profile = CitizenProfile(
            user_id=user_id,
            phone="Not provided",
            address="Not provided",
            city="Not provided",
            state="Not provided",
            pincode="00000"
        )
        db.add(profile)
    
    # Update fields
    update_data = profile_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile