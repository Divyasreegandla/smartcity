# services/cashfree_service.py
import os
import json
import requests
import hmac
import hashlib
from typing import Dict, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from repositories.bill_payment_repository import BillPaymentRepository
from repositories.citizen_bill_repository import CitizenBillRepository
from models.citizen_bills import BillStatus
from models.bill_payments import PaymentStatus

class CashfreeService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = BillPaymentRepository(db)
        self.bill_repo = CitizenBillRepository(db)
        
        self.app_id = os.getenv("CASHFREE_APP_ID", "")
        self.secret_key = os.getenv("CASHFREE_SECRET_KEY", "")
        self.environment = os.getenv("CASHFREE_ENVIRONMENT", "sandbox")
        
        if self.environment == "production":
            self.base_url = "https://api.cashfree.com"
        else:
            self.base_url = "https://sandbox.cashfree.com"

    def create_order(self, payment_id: int, bill_id: int, amount: float, 
                     customer_id: int, customer_name: str, customer_email: str,
                     customer_phone: str, currency: str = "INR") -> Tuple[Optional[Dict], Optional[str]]:
        """Create a Cashfree Order"""
        
        # ✅ Bypass for testing
        if not self.app_id or "xxx" in self.app_id or not self.secret_key:
            return {
                "payment_id": payment_id,
                "bill_id": bill_id,
                "order_id": f"PAY-{str(payment_id).zfill(6)}",
                "payment_session_id": f"session_{payment_id}",
                "amount": amount,
                "currency": currency,
                "payment_url": f"{self.base_url}/pg/orders/PAY-{str(payment_id).zfill(6)}/pay"
            }, None
        
        try:
            payment_reference = self.payment_repo.generate_payment_reference()
            
            headers = {
                "x-api-version": "2022-09-01",
                "x-client-id": self.app_id,
                "x-client-secret": self.secret_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "order_id": payment_reference,
                "order_amount": amount,
                "order_currency": currency,
                "customer_details": {
                    "customer_id": str(customer_id),
                    "customer_name": customer_name,
                    "customer_email": customer_email,
                    "customer_phone": customer_phone
                },
                "order_meta": {
                    "return_url": f"{os.getenv('FRONTEND_URL')}/payment/callback"
                },
                "order_note": f"Payment for bill {bill_id}"
            }
            
            response = requests.post(
                f"{self.base_url}/pg/orders",
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                
                self.payment_repo.update(payment_id, transaction_id=data["order_id"])
                
                return {
                    "payment_id": payment_id,
                    "bill_id": bill_id,
                    "order_id": data["order_id"],
                    "payment_session_id": data.get("payment_session_id"),
                    "amount": amount,
                    "currency": currency,
                    "payment_url": data.get("payment_url") or f"{self.base_url}/pg/orders/{data['order_id']}/pay"
                }, None
            else:
                return None, f"Cashfree error: {response.text}"
                
        except Exception as e:
            return None, f"Cashfree error: {str(e)}"

    def verify_payment(self, order_id: str) -> Tuple[Optional[Dict], Optional[str]]:
        """Verify Cashfree payment status"""
        # ✅ Bypass for testing
        if not self.app_id or "xxx" in self.app_id or not self.secret_key:
            return {
                "order_id": order_id,
                "transaction_id": f"cf_test_{order_id}",
                "status": "SUCCESS"
            }, None
        
        try:
            headers = {
                "x-api-version": "2022-09-01",
                "x-client-id": self.app_id,
                "x-client-secret": self.secret_key
            }
            
            response = requests.get(
                f"{self.base_url}/pg/orders/{order_id}/payments",
                headers=headers
            )
            
            if response.status_code == 200:
                payments = response.json()
                if payments:
                    latest_payment = payments[0]
                    
                    if latest_payment.get("payment_status") == "SUCCESS":
                        payment_record = self.payment_repo.get_by_transaction_id(order_id)
                        if payment_record:
                            self.payment_repo.update(
                                payment_record.id,
                                payment_status=PaymentStatus.SUCCESS,
                                paid_at=datetime.now(),
                                transaction_id=latest_payment.get("cf_payment_id"),
                                gateway_response=str(latest_payment)
                            )
                            self.bill_repo.update_status(payment_record.bill_id, BillStatus.PAID)
                        
                        return {
                            "payment_id": payment_record.id if payment_record else None,
                            "order_id": order_id,
                            "transaction_id": latest_payment.get("cf_payment_id"),
                            "status": "SUCCESS"
                        }, None
                    else:
                        return {
                            "order_id": order_id,
                            "status": latest_payment.get("payment_status")
                        }, None
                
                return None, "No payments found"
            else:
                return None, f"Verification failed: {response.text}"
                
        except Exception as e:
            return None, f"Verification error: {str(e)}"

    def verify_webhook(self, payload: bytes, signature: str) -> Tuple[Optional[Dict], Optional[str]]:
        """Verify Cashfree webhook signature"""
        try:
            # ✅ Bypass for testing
            if not self.app_id or "xxx" in self.app_id or not self.secret_key:
                try:
                    event = json.loads(payload)
                    if event.get("event") == "PAYMENT_SUCCESS" or event.get("order_id"):
                        order_id = event.get("order_id")
                        payment_record = self.payment_repo.get_by_transaction_id(order_id)
                        
                        if payment_record:
                            self.payment_repo.update(
                                payment_record.id,
                                payment_status=PaymentStatus.SUCCESS,
                                paid_at=datetime.now(),
                                gateway_response=str(event)
                            )
                            self.bill_repo.update_status(payment_record.bill_id, BillStatus.PAID)
                            
                            return {
                                "status": "success",
                                "payment_id": payment_record.id,
                                "order_id": order_id
                            }, None
                except:
                    pass
                return {"status": "ignored", "message": "Test mode - webhook bypassed"}, None
            
            # Real verification for production
            expected_signature = hmac.new(
                self.secret_key.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            if signature != expected_signature:
                return None, "Invalid webhook signature"
            
            event = json.loads(payload)
            
            if event.get("event") == "PAYMENT_SUCCESS":
                order_id = event.get("order_id")
                payment_record = self.payment_repo.get_by_transaction_id(order_id)
                
                if payment_record:
                    self.payment_repo.update(
                        payment_record.id,
                        payment_status=PaymentStatus.SUCCESS,
                        paid_at=datetime.now(),
                        gateway_response=str(event)
                    )
                    self.bill_repo.update_status(payment_record.bill_id, BillStatus.PAID)
                    
                    return {
                        "status": "success",
                        "payment_id": payment_record.id,
                        "order_id": order_id
                    }, None
            
            return {"status": "ignored", "event": event.get("event")}, None
            
        except Exception as e:
            return None, f"Webhook error: {str(e)}"