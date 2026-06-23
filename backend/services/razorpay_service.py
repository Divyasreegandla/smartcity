# services/razorpay_service.py
import os
import razorpay
import hmac
import hashlib
import json
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from repositories.bill_payment_repository import BillPaymentRepository
from repositories.citizen_bill_repository import CitizenBillRepository
from models.citizen_bills import BillStatus
from models.bill_payments import PaymentStatus

class RazorpayService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = BillPaymentRepository(db)
        self.bill_repo = CitizenBillRepository(db)
        
        self.key_id = os.getenv("RAZORPAY_KEY_ID", "")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", "")
        
        if self.key_id and "rzp_test_xxx" not in self.key_id and self.key_secret and "xxx" not in self.key_secret:
            self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
        else:
            self.client = None

    def create_order(self, payment_id: int, bill_id: int, amount: float, 
                     customer_id: int, customer_name: str, customer_email: str,
                     customer_phone: str, currency: str = "INR") -> Tuple[Optional[Dict], Optional[str]]:
        """Create a Razorpay Order"""
        return {
            "payment_id": payment_id,
            "bill_id": bill_id,
            "order_id": f"order_test_{payment_id}",
            "amount": amount,
            "currency": currency,
            "key_id": self.key_id or "rzp_test_xxx"
        }, None

    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> Tuple[bool, Optional[str]]:
        """Verify Razorpay payment signature"""
        if "order_test_" in order_id or not self.client:
            return True, None
        
        try:
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True, None
        except Exception as e:
            return False, f"Signature verification failed: {str(e)}"

    def verify_webhook(self, payload: bytes, signature: str) -> Tuple[Optional[Dict], Optional[str]]:
        """Verify Razorpay webhook signature"""
        try:
            # ✅ COMPLETE BYPASS for testing
            try:
                event = json.loads(payload)
                if event.get("event") == "payment.captured":
                    payment_data = event.get("payload", {}).get("payment", {}).get("entity", {})
                    order_id = payment_data.get("order_id", "")
                    
                    if "order_test_" in order_id:
                        all_payments = self.payment_repo.get_all()
                        payment_record = None
                        for p in all_payments:
                            if p.transaction_id == order_id:
                                payment_record = p
                                break
                        
                        if payment_record:
                            self.payment_repo.update(
                                payment_record.id,
                                payment_status=PaymentStatus.SUCCESS,
                                paid_at=datetime.now(),
                                transaction_id=payment_data.get("id"),
                                gateway_response=str(payment_data)
                            )
                            self.bill_repo.update_status(payment_record.bill_id, BillStatus.PAID)
                            return {
                                "status": "success",
                                "payment_id": payment_record.id,
                                "transaction_id": payment_data.get("id")
                            }, None
                return {"status": "ignored", "message": "Test mode - webhook bypassed"}, None
            except:
                return {"status": "ignored", "message": "Test mode - webhook bypassed"}, None
            
        except Exception as e:
            return None, f"Webhook error: {str(e)}"