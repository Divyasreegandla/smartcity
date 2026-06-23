# services/invoice_service.py
import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Tuple
from sqlalchemy.orm import Session
import json

from repositories.bill_payment_repository import BillPaymentRepository
from repositories.citizen_bill_repository import CitizenBillRepository
from repositories.bill_category_repository import BillCategoryRepository
from repositories.payment_receipt_repository import PaymentReceiptRepository
from models.citizen_bills import BillStatus

class InvoiceService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = BillPaymentRepository(db)
        self.bill_repo = CitizenBillRepository(db)
        self.category_repo = BillCategoryRepository(db)
        self.receipt_repo = PaymentReceiptRepository(db)

    def generate_invoice_data(self, payment_id: int, citizen_id: int) -> Tuple[Optional[Dict], Optional[str]]:
        """Generate invoice data for a payment"""
        payment = self.payment_repo.get_by_id(payment_id)
        if not payment:
            return None, "Payment not found"

        if payment.citizen_id != citizen_id:
            return None, "Access denied"

        bill = self.bill_repo.get_by_id(payment.bill_id)
        if not bill:
            return None, "Bill not found"

        category = self.category_repo.get_by_id(bill.category_id)
        if not category:
            return None, "Category not found"

        # Generate QR code (placeholder)
        qr_base64 = self._generate_qr_code(json.dumps({
            "invoice": payment.payment_reference,
            "bill": bill.bill_number,
            "amount": payment.paid_amount,
            "date": payment.paid_at.isoformat() if payment.paid_at else None
        }))

        invoice_data = {
            "invoice_number": payment.payment_reference,
            "bill_number": bill.bill_number,
            "payment_id": payment.id,
            "citizen_id": citizen_id,
            "category": category.category_name,
            "bill_month": bill.bill_month,
            "bill_year": bill.bill_year,
            "due_date": bill.due_date,
            "amount": bill.amount,
            "late_fee": bill.late_fee,
            "total_amount": bill.total_amount,
            "paid_amount": payment.paid_amount,
            "gateway": payment.payment_gateway.value if payment.payment_gateway else "Unknown",
            "transaction_id": payment.transaction_id or "N/A",
            "payment_status": payment.payment_status.value if payment.payment_status else "Unknown",
            "paid_at": payment.paid_at or datetime.now(),
            "qr_code": qr_base64
        }

        return invoice_data, None

    def generate_receipt(self, payment_id: int, citizen_id: int) -> Tuple[Optional[Dict], Optional[str]]:
        """Generate PDF receipt for payment"""
        existing_receipt = self.receipt_repo.get_by_payment_id(payment_id)
        if existing_receipt:
            return {
                "payment_id": payment_id,
                "receipt_number": existing_receipt.receipt_number,
                "pdf_path": existing_receipt.pdf_path,
                "generated_at": existing_receipt.generated_at
            }, None

        invoice_data, error = self.generate_invoice_data(payment_id, citizen_id)
        if error:
            return None, error

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

    def get_invoice(self, payment_id: int, citizen_id: int) -> Tuple[Optional[Dict], Optional[str]]:
        """Get invoice data for a payment"""
        return self.generate_invoice_data(payment_id, citizen_id)

    def _generate_qr_code(self, data: str) -> str:
        """Generate QR code as base64 string (placeholder)"""
        # In production, use qrcode library
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="