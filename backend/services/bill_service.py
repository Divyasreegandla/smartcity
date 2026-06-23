from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.citizen_bill_repository import CitizenBillRepository
from repositories.bill_category_repository import BillCategoryRepository
from schemas.bill_schemas import BillCreate, BillUpdate
from models.citizen_bills import BillStatus

class BillService:
    def __init__(self, db: Session):
        self.db = db
        self.bill_repo = CitizenBillRepository(db)
        self.category_repo = BillCategoryRepository(db)

    def generate_bill(self, data: BillCreate):
        category = self.category_repo.get_by_id(data.category_id)
        if not category:
            return None, "Category not found"
        
        total_amount = data.amount + data.late_fee
        bill_number = self.bill_repo.generate_bill_number()
        
        bill = self.bill_repo.create(
            bill_number=bill_number,
            citizen_id=data.citizen_id,
            category_id=data.category_id,
            bill_month=data.bill_month,
            bill_year=data.bill_year,
            due_date=data.due_date,
            amount=data.amount,
            late_fee=data.late_fee,
            total_amount=total_amount,
            bill_status=BillStatus.PENDING
        )
        return bill, None

    def get_citizen_bills(self, citizen_id: int, skip: int = 0, limit: int = 100) -> List[dict]:
        bills = self.bill_repo.get_by_citizen_id(citizen_id, skip, limit)
        return self._enrich_bills(bills)

    def get_pending_bills(self, citizen_id: int) -> List[dict]:
        bills = self.bill_repo.get_pending_bills(citizen_id)
        return self._enrich_bills(bills)

    def get_bill_history(self, citizen_id: int) -> List[dict]:
        bills = self.bill_repo.get_bill_history(citizen_id)
        return self._enrich_bills(bills)

    def get_bill_by_id(self, bill_id: int, citizen_id: int) -> Optional[dict]:
        bill = self.bill_repo.get_by_id(bill_id)
        if not bill or bill.citizen_id != citizen_id:
            return None
        category = self.category_repo.get_by_id(bill.category_id)
        return {
            **bill.__dict__,
            "category_name": category.category_name if category else None
        }

    # ✅ FIXED: Allow admin to update any bill
    def update_bill_status(self, bill_id: int, status: BillStatus, user_id: int, user_role: str = "citizen") -> Optional[dict]:
        """Update bill status - Admin can update any bill, citizen can only update their own"""
        bill = self.bill_repo.get_by_id(bill_id)
        if not bill:
            return None
        
        # If citizen, check ownership
        if user_role != "admin" and bill.citizen_id != user_id:
            return None
        
        bill = self.bill_repo.update_status(bill_id, status)
        if bill:
            category = self.category_repo.get_by_id(bill.category_id)
            return {
                **bill.__dict__,
                "category_name": category.category_name if category else None
            }
        return None

    def _enrich_bills(self, bills) -> List[dict]:
        result = []
        for bill in bills:
            category = self.category_repo.get_by_id(bill.category_id)
            result.append({
                **bill.__dict__,
                "category_name": category.category_name if category else None
            })
        return result