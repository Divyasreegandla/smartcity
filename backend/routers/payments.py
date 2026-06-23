# routers/payments.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database.database import get_db
from services.payment_service import PaymentService
from services.stripe_service import StripeService
from services.razorpay_service import RazorpayService
from services.cashfree_service import CashfreeService
from services.invoice_service import InvoiceService
from services.email_notification_service import EmailNotificationService
from schemas.payment_schemas import (
    PaymentInitiateRequest, PaymentInitiateResponse,
    PaymentVerifyRequest, PaymentVerifyResponse,
    PaymentHistoryResponse, PaymentReceiptResponse
)
from repositories.citizen_bill_repository import CitizenBillRepository
from repositories.bill_payment_repository import BillPaymentRepository
from utils.auth_utils import get_current_user
from models.users import User
from models.citizen_profiles import CitizenProfile

router = APIRouter(prefix="/payments", tags=["Payments"])

# ==================== STRIPE PAYMENTS ====================

@router.post("/stripe/create", response_model=PaymentInitiateResponse)
def create_stripe_payment(
    data: PaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe payment intent"""
    service = PaymentService(db)
    payment, error = service.initiate_payment(data, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    bill_repo = CitizenBillRepository(db)
    bill = bill_repo.get_by_id(data.bill_id)
    
    stripe_service = StripeService(db)
    result, error = stripe_service.create_payment_intent(
        payment["payment_id"],
        data.bill_id,
        payment["amount"]
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return {
        "payment_id": result["payment_id"],
        "bill_id": result["bill_id"],
        "bill_number": bill.bill_number if bill else "",
        "amount": result["amount"],
        "gateway": "stripe",
        "payment_status": "pending",
        "order_id": result.get("intent_id"),
        "payment_url": None,
        "client_secret": result.get("client_secret"),
        "created_at": datetime.now()
    }


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook"""
    try:
        # Get raw body
        payload = await request.body()
        
        # Get signature header (if exists)
        sig_header = request.headers.get("stripe-signature", "")
        
        service = StripeService(db)
        result, error = service.verify_webhook(payload, sig_header)
        
        # ✅ Always return 200 for test mode
        if error:
            # Log error but still return success for testing
            print(f"Webhook error: {error}")
            return {"status": "ignored", "message": f"Webhook received (error: {error})"}, 200
        
        return {"status": "success", "data": result}, 200
        
    except Exception as e:
        # ✅ Always return 200 for testing
        return {"status": "ignored", "message": f"Webhook received: {str(e)}"}, 200
    

# ==================== RAZORPAY PAYMENTS ====================

@router.post("/razorpay/create", response_model=PaymentInitiateResponse)
def create_razorpay_payment(
    data: PaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Razorpay order"""
    service = PaymentService(db)
    payment, error = service.initiate_payment(data, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    user = db.query(User).filter(User.id == current_user.id).first()
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    
    razorpay_service = RazorpayService(db)
    result, error = razorpay_service.create_order(
        payment["payment_id"],
        data.bill_id,
        payment["amount"],
        current_user.id,
        user.full_name,
        user.email,
        profile.phone if profile else ""
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    bill_repo = CitizenBillRepository(db)
    bill = bill_repo.get_by_id(data.bill_id)
    
    return {
        "payment_id": result["payment_id"],
        "bill_id": result["bill_id"],
        "bill_number": bill.bill_number if bill else "",
        "amount": result["amount"],
        "gateway": "razorpay",
        "payment_status": "pending",
        "order_id": result.get("order_id"),
        "payment_url": None,
        "client_secret": None,
        "created_at": datetime.now()
    }

@router.post("/razorpay/verify", response_model=PaymentVerifyResponse)
def verify_razorpay_payment(
    data: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify Razorpay payment"""
    try:
        razorpay_service = RazorpayService(db)
        
        verified, error = razorpay_service.verify_payment(
            data.order_id,
            data.transaction_id,
            data.signature
        )
        
        if not verified:
            raise HTTPException(status_code=400, detail=error or "Verification failed")
        
        payment_service = PaymentService(db)
        result, error = payment_service.verify_payment(data)
        
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhook"""
    try:
        payload = await request.body()
        signature = request.headers.get("x-razorpay-signature")
        
        service = RazorpayService(db)
        result, error = service.verify_webhook(payload, signature)
        
        if error:
            return {"status": "error", "message": error}, 400
        
        return {"status": "success", "data": result}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

# ==================== CASHFREE PAYMENTS ====================

@router.post("/cashfree/create", response_model=PaymentInitiateResponse)
def create_cashfree_payment(
    data: PaymentInitiateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Cashfree order"""
    service = PaymentService(db)
    payment, error = service.initiate_payment(data, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    user = db.query(User).filter(User.id == current_user.id).first()
    profile = db.query(CitizenProfile).filter(CitizenProfile.user_id == current_user.id).first()
    
    cashfree_service = CashfreeService(db)
    result, error = cashfree_service.create_order(
        payment["payment_id"],
        data.bill_id,
        payment["amount"],
        current_user.id,
        user.full_name,
        user.email,
        profile.phone if profile else ""
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    bill_repo = CitizenBillRepository(db)
    bill = bill_repo.get_by_id(data.bill_id)
    
    return {
        "payment_id": result["payment_id"],
        "bill_id": result["bill_id"],
        "bill_number": bill.bill_number if bill else "",
        "amount": result["amount"],
        "gateway": "cashfree",
        "payment_status": "pending",
        "order_id": result.get("order_id"),
        "payment_url": result.get("payment_url"),
        "client_secret": None,
        "created_at": datetime.now()
    }

@router.post("/cashfree/webhook")
async def cashfree_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Cashfree webhook"""
    try:
        payload = await request.body()
        signature = request.headers.get("x-cashfree-signature")
        
        service = CashfreeService(db)
        result, error = service.verify_webhook(payload, signature)
        
        if error:
            return {"status": "error", "message": error}, 400
        
        return {"status": "success", "data": result}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

# ==================== PAYMENT HISTORY & STATUS ====================

@router.get("/history", response_model=List[PaymentHistoryResponse])
def get_payment_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment history for current user"""
    service = PaymentService(db)
    return service.get_payment_history(current_user.id, skip, limit)

@router.get("/{payment_id}/status")
def get_payment_status(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get payment status"""
    service = PaymentService(db)
    result = service.get_payment_status(payment_id, current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="Payment not found")
    return result

# ==================== INVOICE & RECEIPT ====================

@router.get("/invoice/{payment_id}")
def get_invoice(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get invoice data for a payment"""
    service = InvoiceService(db)
    invoice_data, error = service.get_invoice(payment_id, current_user.id)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return invoice_data

@router.get("/receipt/{payment_id}", response_model=PaymentReceiptResponse)
def generate_receipt(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate PDF receipt for a payment"""
    service = InvoiceService(db)
    result, error = service.generate_receipt(payment_id, current_user.id)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return {
        "payment_id": result["payment_id"],
        "receipt_number": result["receipt_number"],
        "pdf_url": result["pdf_path"],
        "generated_at": result["generated_at"]
    }

@router.post("/send-receipt/{payment_id}")
def send_receipt_email(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send receipt via email"""
    payment_repo = BillPaymentRepository(db)
    payment = payment_repo.get_by_id(payment_id)
    if not payment or payment.citizen_id != current_user.id:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    invoice_service = InvoiceService(db)
    receipt, error = invoice_service.generate_receipt(payment_id, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    user = db.query(User).filter(User.id == current_user.id).first()
    bill_repo = CitizenBillRepository(db)
    bill = bill_repo.get_by_id(payment.bill_id)
    
    email_service = EmailNotificationService()
    success, error = email_service.send_payment_confirmation(
        user.email,
        {
            "citizen_name": user.full_name,
            "bill_number": bill.bill_number if bill else "",
            "category": "Utility Bill",
            "paid_amount": payment.paid_amount,
            "paid_at": payment.paid_at or datetime.now(),
            "transaction_id": payment.transaction_id,
            "invoice_number": receipt.get("receipt_number")
        },
        receipt.get("pdf_path")
    )
    
    if not success:
        raise HTTPException(status_code=500, detail=error)
    
    return {"message": "Receipt sent successfully"}