from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class PaymentGateway(str, Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"
    CASHFREE = "cashfree"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentInitiateRequest(BaseModel):
    bill_id: int = Field(..., description="Bill ID to pay")
    gateway: PaymentGateway = Field(..., description="Payment gateway to use")
    success_url: Optional[str] = Field(None, description="Success redirect URL")
    cancel_url: Optional[str] = Field(None, description="Cancel redirect URL")

class PaymentInitiateResponse(BaseModel):
    payment_id: int
    bill_id: int
    bill_number: str
    amount: float
    gateway: PaymentGateway
    payment_status: PaymentStatus
    order_id: Optional[str] = None
    payment_url: Optional[str] = None
    client_secret: Optional[str] = None
    created_at: datetime

class PaymentVerifyRequest(BaseModel):
    payment_id: int
    gateway: PaymentGateway
    transaction_id: str
    signature: Optional[str] = None
    order_id: Optional[str] = None

class PaymentVerifyResponse(BaseModel):
    payment_id: int
    bill_id: int
    bill_number: str
    amount: float
    gateway: PaymentGateway
    payment_status: PaymentStatus
    transaction_id: str
    paid_at: datetime

class PaymentWebhookRequest(BaseModel):
    gateway: PaymentGateway
    payload: dict
    signature: Optional[str] = None

class PaymentWebhookResponse(BaseModel):
    received: bool
    status: str
    message: str

class PaymentReceiptResponse(BaseModel):
    payment_id: int
    receipt_number: str
    pdf_url: str
    generated_at: datetime

class PaymentHistoryResponse(BaseModel):
    id: int
    bill_number: str
    category_name: str
    amount: float
    gateway: PaymentGateway
    payment_status: PaymentStatus
    transaction_id: Optional[str]
    paid_at: Optional[datetime]
    created_at: datetime

class PaymentStatusUpdateRequest(BaseModel):
    payment_id: int
    status: PaymentStatus
    transaction_id: Optional[str] = None
    gateway_response: Optional[str] = None