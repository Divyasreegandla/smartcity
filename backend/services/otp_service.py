# services/otp_service.py
import random
import os
from datetime import datetime, timedelta
from typing import Tuple, Optional
from sqlalchemy.orm import Session

from models.email_verifications import EmailVerification
from models.mobile_verifications import MobileVerification
from models.users import User

class OTPService:
    def __init__(self, db: Session):
        self.db = db
        self.otp_expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", 10))
        self.otp_length = int(os.getenv("OTP_LENGTH", 6))
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

    def generate_otp(self) -> str:
        """Generate a numeric OTP"""
        return ''.join([str(random.randint(0, 9)) for _ in range(self.otp_length)])

    def send_email_otp(self, user_id: int, email: str) -> Tuple[Optional[str], Optional[str]]:
        """Send OTP to email - ALWAYS RETURNS OTP"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, "User not found"

        otp = self.generate_otp()
        expires_at = datetime.now() + timedelta(minutes=self.otp_expiry_minutes)

        verification = self.db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.email == email
        ).first()

        if verification:
            verification.otp_code = otp
            verification.expires_at = expires_at
            verification.verified = False
            verification.updated_at = datetime.now()
        else:
            verification = EmailVerification(
                user_id=user_id,
                email=email,
                otp_code=otp,
                expires_at=expires_at
            )
            self.db.add(verification)

        self.db.commit()
        
        # ✅ ALWAYS return OTP for testing
        print(f"📧 OTP sent to {email}: {otp}")  # Log to console
        return otp, None

    def verify_email_otp(self, user_id: int, email: str, otp: str) -> Tuple[bool, Optional[str]]:
        """Verify email OTP"""
        verification = self.db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.email == email,
            EmailVerification.otp_code == otp,
            EmailVerification.expires_at > datetime.now(),
            EmailVerification.verified == False
        ).first()

        if not verification:
            return False, "Invalid or expired OTP"

        verification.verified = True
        verification.updated_at = datetime.now()
        self.db.commit()
        return True, None

    def resend_email_otp(self, user_id: int, email: str) -> Tuple[Optional[str], Optional[str]]:
        """Resend OTP to email"""
        self.db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.email == email
        ).delete()
        self.db.commit()
        return self.send_email_otp(user_id, email)

    def send_mobile_otp(self, user_id: int, country_code: str, mobile_number: str) -> Tuple[Optional[str], Optional[str]]:
        """Send OTP to mobile number"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, "User not found"

        full_number = f"{country_code}{mobile_number}"
        if not self._validate_e164(full_number):
            return None, "Invalid mobile number format. Use E.164 format."

        otp = self.generate_otp()
        expires_at = datetime.now() + timedelta(minutes=self.otp_expiry_minutes)

        verification = self.db.query(MobileVerification).filter(
            MobileVerification.user_id == user_id,
            MobileVerification.country_code == country_code,
            MobileVerification.mobile_number == mobile_number
        ).first()

        if verification:
            verification.otp_code = otp
            verification.expires_at = expires_at
            verification.verified = False
            verification.updated_at = datetime.now()
        else:
            verification = MobileVerification(
                user_id=user_id,
                country_code=country_code,
                mobile_number=mobile_number,
                otp_code=otp,
                expires_at=expires_at
            )
            self.db.add(verification)

        self.db.commit()
        
        # ✅ ALWAYS return OTP for testing
        print(f"📱 OTP sent to {full_number}: {otp}")  # Log to console
        return otp, None

    def verify_mobile_otp(self, user_id: int, country_code: str, mobile_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        """Verify mobile OTP"""
        verification = self.db.query(MobileVerification).filter(
            MobileVerification.user_id == user_id,
            MobileVerification.country_code == country_code,
            MobileVerification.mobile_number == mobile_number,
            MobileVerification.otp_code == otp,
            MobileVerification.expires_at > datetime.now(),
            MobileVerification.verified == False
        ).first()

        if not verification:
            return False, "Invalid or expired OTP"

        verification.verified = True
        verification.updated_at = datetime.now()
        self.db.commit()
        return True, None

    def resend_mobile_otp(self, user_id: int, country_code: str, mobile_number: str) -> Tuple[Optional[str], Optional[str]]:
        """Resend OTP to mobile"""
        self.db.query(MobileVerification).filter(
            MobileVerification.user_id == user_id,
            MobileVerification.country_code == country_code,
            MobileVerification.mobile_number == mobile_number
        ).delete()
        self.db.commit()
        return self.send_mobile_otp(user_id, country_code, mobile_number)

    def is_email_verified(self, user_id: int, email: str) -> bool:
        """Check if email is verified"""
        verification = self.db.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.email == email,
            EmailVerification.verified == True
        ).first()
        return verification is not None

    def is_mobile_verified(self, user_id: int, country_code: str, mobile_number: str) -> bool:
        """Check if mobile is verified"""
        verification = self.db.query(MobileVerification).filter(
            MobileVerification.user_id == user_id,
            MobileVerification.country_code == country_code,
            MobileVerification.mobile_number == mobile_number,
            MobileVerification.verified == True
        ).first()
        return verification is not None

    def _validate_e164(self, number: str) -> bool:
        """Validate E.164 phone number format"""
        import re
        pattern = r'^\+[1-9]\d{1,14}$'
        return bool(re.match(pattern, number))