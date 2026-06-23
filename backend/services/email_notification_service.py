# services/email_notification_service.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Optional, Tuple
from datetime import datetime

class EmailNotificationService:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        self.debug = os.getenv("DEBUG", "false").lower() == "true"

    def send_payment_confirmation(self, to_email: str, payment_data: dict, 
                                  invoice_path: Optional[str] = None) -> Tuple[bool, Optional[str]]:
        """Send payment confirmation email with invoice attachment"""
        
        # ✅ Skip email sending in debug mode
        if self.debug or not self.smtp_username:
            print(f"📧 [DEBUG] Payment confirmation email would be sent to: {to_email}")
            print(f"📧 [DEBUG] Payment data: {payment_data}")
            return True, None
        
        try:
            msg = MIMEMultipart()
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Subject"] = "Payment Successful – Smart City Services"

            html_content = f"""
            <html>
            <body>
                <h2>Payment Confirmation</h2>
                <p>Dear {payment_data.get('citizen_name', 'Citizen')},</p>
                <p>Your payment has been successfully processed.</p>
                <hr>
                <p><strong>Invoice Number:</strong> {payment_data.get('invoice_number', 'N/A')}</p>
                <p><strong>Bill Number:</strong> {payment_data.get('bill_number', 'N/A')}</p>
                <p><strong>Service Type:</strong> {payment_data.get('category', 'Utility Bill')}</p>
                <p><strong>Amount Paid:</strong> ₹{payment_data.get('paid_amount', 0):.2f}</p>
                <p><strong>Payment Date:</strong> {payment_data.get('paid_at', datetime.now()).strftime('%B %d, %Y at %H:%M')}</p>
                <p><strong>Transaction ID:</strong> {payment_data.get('transaction_id', 'N/A')}</p>
                <hr>
                <p>Thank you for using Smart City Services.</p>
            </body>
            </html>
            """

            msg.attach(MIMEText(html_content, "html"))

            if invoice_path and os.path.exists(invoice_path):
                with open(invoice_path, "rb") as f:
                    attachment = MIMEApplication(f.read(), _subtype="pdf")
                    attachment.add_header(
                        "Content-Disposition",
                        "attachment",
                        filename=os.path.basename(invoice_path)
                    )
                    msg.attach(attachment)

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            return True, None

        except Exception as e:
            return False, f"Email sending failed: {str(e)}"

    def send_otp_email(self, to_email: str, otp: str, purpose: str = "verification") -> Tuple[bool, Optional[str]]:
        """Send OTP via email"""
        
        if self.debug or not self.smtp_username:
            print(f"📧 [DEBUG] OTP email would be sent to: {to_email}")
            print(f"📧 [DEBUG] OTP: {otp}")
            return True, None
        
        try:
            msg = MIMEMultipart()
            msg["From"] = self.from_email
            msg["To"] = to_email
            msg["Subject"] = f"Your OTP for {purpose} - Smart City Services"

            html_content = f"""
            <html>
            <body>
                <h2>OTP Verification</h2>
                <p>Your OTP for {purpose} is:</p>
                <h1 style="font-size: 32px; letter-spacing: 8px;">{otp}</h1>
                <p>This OTP is valid for {os.getenv('OTP_EXPIRY_MINUTES', 10)} minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </body>
            </html>
            """

            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if self.use_tls:
                    server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)

            return True, None

        except Exception as e:
            return False, f"Email sending failed: {str(e)}"

    def send_sms_otp(self, to_number: str, otp: str) -> Tuple[bool, Optional[str]]:
        """Send OTP via SMS (placeholder)"""
        if self.debug:
            print(f"📱 [DEBUG] SMS OTP would be sent to: {to_number}")
            print(f"📱 [DEBUG] OTP: {otp}")
            return True, None
        return True, None