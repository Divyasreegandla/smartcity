# routers/otp.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field, validator
import os

from database.database import get_db
from services.otp_service import OTPService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/otp", tags=["OTP Verification"])

# Request/Response schemas
class SendEmailOTPRequest(BaseModel):
    email: str = Field(..., description="Email address to send OTP")

class SendMobileOTPRequest(BaseModel):
    country_code: str = Field(..., min_length=1, max_length=5, description="Country code (e.g., +91)")
    mobile_number: str = Field(..., min_length=10, max_length=15, description="Mobile number without country code")

    @validator('country_code')
    def validate_country_code(cls, v):
        if not v.startswith('+'):
            return f"+{v}"
        return v

class VerifyOTPRequest(BaseModel):
    otp: str = Field(..., min_length=4, max_length=8, description="OTP code")
    email: Optional[str] = Field(None, description="Email for email verification")
    country_code: Optional[str] = Field(None, description="Country code for mobile verification")
    mobile_number: Optional[str] = Field(None, description="Mobile number for mobile verification")

class OTPResponse(BaseModel):
    success: bool
    message: str
    otp: Optional[str] = None

# Email OTP endpoints
@router.post("/email/send", response_model=OTPResponse)
def send_email_otp(
    data: SendEmailOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send OTP to email for verification"""
    service = OTPService(db)
    otp, error = service.send_email_otp(current_user.id, data.email)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    # ✅ Always return OTP for testing
    return {
        "success": True,
        "message": "OTP sent to email",
        "otp": otp  # Always return OTP
    }

@router.post("/email/verify", response_model=OTPResponse)
def verify_email_otp(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify email OTP"""
    if not data.email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    service = OTPService(db)
    verified, error = service.verify_email_otp(current_user.id, data.email, data.otp)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "success": True,
        "message": "Email verified successfully"
    }

@router.post("/email/resend", response_model=OTPResponse)
def resend_email_otp(
    data: SendEmailOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend OTP to email"""
    service = OTPService(db)
    otp, error = service.resend_email_otp(current_user.id, data.email)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "success": True,
        "message": "OTP resent to email",
        "otp": otp  # Always return OTP
    }

@router.get("/email/status")
def check_email_verification(
    email: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if email is verified"""
    service = OTPService(db)
    verified = service.is_email_verified(current_user.id, email)
    
    return {
        "email": email,
        "verified": verified
    }

# Mobile OTP endpoints
@router.post("/mobile/send", response_model=OTPResponse)
def send_mobile_otp(
    data: SendMobileOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send OTP to mobile number for verification"""
    service = OTPService(db)
    otp, error = service.send_mobile_otp(
        current_user.id,
        data.country_code,
        data.mobile_number
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "success": True,
        "message": "OTP sent to mobile number",
        "otp": otp  # Always return OTP
    }

@router.post("/mobile/verify", response_model=OTPResponse)
def verify_mobile_otp(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify mobile OTP"""
    if not data.country_code or not data.mobile_number:
        raise HTTPException(status_code=400, detail="Country code and mobile number are required")
    
    service = OTPService(db)
    verified, error = service.verify_mobile_otp(
        current_user.id,
        data.country_code,
        data.mobile_number,
        data.otp
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "success": True,
        "message": "Mobile number verified successfully"
    }

@router.post("/mobile/resend", response_model=OTPResponse)
def resend_mobile_otp(
    data: SendMobileOTPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Resend OTP to mobile number"""
    service = OTPService(db)
    otp, error = service.resend_mobile_otp(
        current_user.id,
        data.country_code,
        data.mobile_number
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "success": True,
        "message": "OTP resent to mobile number",
        "otp": otp  # Always return OTP
    }

@router.get("/mobile/status")
def check_mobile_verification(
    country_code: str,
    mobile_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if mobile number is verified"""
    service = OTPService(db)
    verified = service.is_mobile_verified(current_user.id, country_code, mobile_number)
    
    return {
        "country_code": country_code,
        "mobile_number": mobile_number,
        "verified": verified
    }