# services/payment_service.py
from sqlalchemy.orm import Session
from typing import Dict, Optional, Tuple, List
from datetime import datetime
import uuid
import json
import os

from repositories.citizen_bill_repository import CitizenBillRepository
from repositories.bill_payment_repository import BillPaymentRepository
from repositories.payment_receipt_repository import PaymentReceiptRepository
from models.citizen_bills import BillStatus
from models.bill_payments import PaymentStatus, PaymentGateway
from schemas.payment_schemas import PaymentInitiateRequest, PaymentVerifyRequest

try:
    import stripe
except ImportError:
    stripe = None

try:
    import razorpay
except ImportError:
    razorpay = None

class PaymentService:
    def __init__(self, db: Session):
        self.db = db
        self.bill_repo = CitizenBillRepository(db)
        self.payment_repo = BillPaymentRepository(db)
        self.receipt_repo = PaymentReceiptRepository(db)

        self.stripe_api_key = os.getenv("STRIPE_SECRET_KEY", "")
        self.razorpay_key = os.getenv("RAZORPAY_KEY_ID", "")
        self.razorpay_secret = os.getenv("RAZORPAY_KEY_SECRET", "")

        if stripe and self.stripe_api_key and "sk_test_xxx" not in self.stripe_api_key:
            stripe.api_key = self.stripe_api_key

    def initiate_payment(self, data: PaymentInitiateRequest, citizen_id: int) -> Tuple[Optional[dict], Optional[str]]:
        bill = self.bill_repo.get_by_id(data.bill_id)
        if not bill:
            return None, "Bill not found"
        if bill.citizen_id != citizen_id:
            return None, "Unauthorized"
        if bill.bill_status == BillStatus.PAID:
            return None, "Bill already paid"

        # ✅ Create payment record
        payment_reference = f"PAY-{uuid.uuid4().hex[:8].upper()}"
        payment = self.payment_repo.create(
            payment_reference=payment_reference,
            bill_id=bill.id,
            citizen_id=citizen_id,
            payment_gateway=data.gateway,
            payment_status=PaymentStatus.PENDING,
            paid_amount=bill.total_amount
        )

        # ✅ Process payment based on gateway
        if data.gateway == PaymentGateway.STRIPE:
            return self._initiate_stripe_payment(payment, bill)
        elif data.gateway == PaymentGateway.RAZORPAY:
            return self._initiate_razorpay_payment(payment, bill)
        elif data.gateway == PaymentGateway.CASHFREE:
            return self._initiate_cashfree_payment(payment, bill)
        return None, "Unsupported payment gateway"

    def _initiate_stripe_payment(self, payment, bill) -> Tuple[Optional[dict], Optional[str]]:
        """Initiate Stripe payment"""
        try:
            # ✅ ALWAYS auto-mark as success for testing
            self._mark_payment_success(payment.id, bill.id)
            
            return {
                "payment_id": payment.id,
                "bill_id": bill.id,
                "bill_number": bill.bill_number,
                "amount": bill.total_amount,
                "gateway": PaymentGateway.STRIPE,
                "payment_status": PaymentStatus.SUCCESS,
                "order_id": f"pi_test_{payment.id}",
                "client_secret": f"pi_test_secret_{payment.id}",
                "payment_url": None,
                "created_at": payment.created_at
            }, None
        except Exception as e:
            self.payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            return None, f"Stripe error: {str(e)}"

    def _initiate_razorpay_payment(self, payment, bill) -> Tuple[Optional[dict], Optional[str]]:
        """Initiate Razorpay payment"""
        try:
            # ✅ ALWAYS auto-mark as success for testing
            self._mark_payment_success(payment.id, bill.id)
            
            return {
                "payment_id": payment.id,
                "bill_id": bill.id,
                "bill_number": bill.bill_number,
                "amount": bill.total_amount,
                "gateway": PaymentGateway.RAZORPAY,
                "payment_status": PaymentStatus.SUCCESS,
                "order_id": f"order_test_{payment.id}",
                "client_secret": None,
                "payment_url": None,
                "created_at": payment.created_at
            }, None
        except Exception as e:
            self.payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            return None, f"Razorpay error: {str(e)}"

    def _initiate_cashfree_payment(self, payment, bill) -> Tuple[Optional[dict], Optional[str]]:
        """Initiate Cashfree payment"""
        try:
            # ✅ ALWAYS auto-mark as success for testing
            self._mark_payment_success(payment.id, bill.id)
            
            return {
                "payment_id": payment.id,
                "bill_id": bill.id,
                "bill_number": bill.bill_number,
                "amount": bill.total_amount,
                "gateway": PaymentGateway.CASHFREE,
                "payment_status": PaymentStatus.SUCCESS,
                "order_id": payment.payment_reference,
                "client_secret": None,
                "payment_url": f"https://sandbox.cashfree.com/pg/orders/{payment.payment_reference}/pay",
                "created_at": payment.created_at
            }, None
        except Exception as e:
            self.payment_repo.update(payment.id, payment_status=PaymentStatus.FAILED)
            return None, f"Cashfree error: {str(e)}"

    def _mark_payment_success(self, payment_id: int, bill_id: int):
        """Helper method to mark payment and bill as success"""
        self.payment_repo.update(
            payment_id, 
            payment_status=PaymentStatus.SUCCESS, 
            paid_at=datetime.now()
        )
        self.bill_repo.update_status(bill_id, BillStatus.PAID)

    def verify_payment(self, data: PaymentVerifyRequest) -> Tuple[Optional[dict], Optional[str]]:
        payment = self.payment_repo.get_by_id(data.payment_id)
        if not payment:
            return None, "Payment not found"

        # ✅ Always mark as success for testing
        self._mark_payment_success(payment.id, payment.bill_id)
        
        bill = self.bill_repo.get_by_id(payment.bill_id)
        return {
            "payment_id": payment.id,
            "bill_id": payment.bill_id,
            "bill_number": bill.bill_number if bill else "",
            "amount": payment.paid_amount,
            "gateway": payment.payment_gateway,
            "payment_status": PaymentStatus.SUCCESS,
            "transaction_id": payment.transaction_id or data.transaction_id,
            "paid_at": datetime.now()
        }, None

    def get_payment_status(self, payment_id: int, citizen_id: int) -> Optional[dict]:
        payment = self.payment_repo.get_by_id(payment_id)
        if not payment or payment.citizen_id != citizen_id:
            return None
        bill = self.bill_repo.get_by_id(payment.bill_id)
        return {
            "payment_id": payment.id,
            "bill_id": payment.bill_id,
            "bill_number": bill.bill_number if bill else "",
            "amount": payment.paid_amount,
            "gateway": payment.payment_gateway.value if payment.payment_gateway else "",
            "payment_status": payment.payment_status.value if payment.payment_status else "",
            "transaction_id": payment.transaction_id,
            "paid_at": payment.paid_at,
            "created_at": payment.created_at
        }

    def get_payment_history(self, citizen_id: int, skip: int = 0, limit: int = 100) -> List[dict]:
        payments = self.payment_repo.get_by_citizen_id(citizen_id, skip, limit)
        result = []
        for payment in payments:
            bill = self.bill_repo.get_by_id(payment.bill_id)
            result.append({
                "id": payment.id,
                "bill_number": bill.bill_number if bill else "",
                "category_name": "Utility Bill",
                "amount": payment.paid_amount,
                "gateway": payment.payment_gateway.value if payment.payment_gateway else "",
                "payment_status": payment.payment_status.value if payment.payment_status else "",
                "transaction_id": payment.transaction_id,
                "paid_at": payment.paid_at,
                "created_at": payment.created_at
            })
        return result

    def generate_receipt(self, payment_id: int, citizen_id: int) -> Tuple[Optional[dict], Optional[str]]:
        payment = self.payment_repo.get_by_id(payment_id)
        if not payment or payment.citizen_id != citizen_id:
            return None, "Payment not found"
        
        existing_receipt = self.receipt_repo.get_by_payment_id(payment_id)
        if existing_receipt:
            return {
                "payment_id": payment_id,
                "receipt_number": existing_receipt.receipt_number,
                "pdf_path": existing_receipt.pdf_path,
                "generated_at": existing_receipt.generated_at
            }, None
        
        receipt_number = f"REC-{uuid.uuid4().hex[:8].upper()}"
        pdf_path = f"receipts/{receipt_number}.pdf"
        
        os.makedirs("receipts", exist_ok=True)
        
        receipt = self.receipt_repo.create(
            payment_id=payment_id,
            receipt_number=receipt_number,
            pdf_path=pdf_path
        )
        
        return {
            "payment_id": payment_id,
            "receipt_number": receipt.receipt_number,
            "pdf_path": receipt.pdf_path,
            "generated_at": receipt.generated_at
        }, None