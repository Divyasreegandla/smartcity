from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime, timedelta
from repositories.citizen_bill_repository import CitizenBillRepository
from repositories.bill_category_repository import BillCategoryRepository

class PropertyTaxService:
    def __init__(self, db: Session):
        self.db = db
        self.bill_repo = CitizenBillRepository(db)
        self.category_repo = BillCategoryRepository(db)

    def calculate_property_tax(self, property_value: float, property_type: str) -> Dict:
        """Calculate property tax based on property value"""
        # Tax rates based on property type
        tax_rates = {
            "residential": 0.008,  # 0.8%
            "commercial": 0.012,   # 1.2%
            "industrial": 0.010,   # 1.0%
            "agricultural": 0.004  # 0.4%
        }
        
        rate = tax_rates.get(property_type.lower(), 0.008)
        base_tax = property_value * rate
        
        # Add cess (2% of base tax)
        cess = base_tax * 0.02
        
        # Add service charge (1% of base tax)
        service_charge = base_tax * 0.01
        
        total = base_tax + cess + service_charge
        
        return {
            "property_value": property_value,
            "property_type": property_type,
            "tax_rate": rate * 100,
            "base_tax": round(base_tax, 2),
            "cess": round(cess, 2),
            "service_charge": round(service_charge, 2),
            "total_tax": round(total, 2)
        }

    def generate_property_tax_bill(
        self, 
        citizen_id: int, 
        property_value: float,
        property_type: str,
        month: int,
        year: int,
        due_date: Optional[datetime] = None
    ):
        """Generate property tax bill"""
        category = self.category_repo.get_by_name("Property Tax")
        if not category:
            return None, "Property Tax category not found"
        
        # Calculate tax
        tax_details = self.calculate_property_tax(property_value, property_type)
        
        # Set due date (30 days from now if not provided)
        if not due_date:
            due_date = datetime.now() + timedelta(days=30)
        
        # Generate bill number
        bill_number = self.bill_repo.generate_bill_number()
        
        # Create bill
        bill = self.bill_repo.create(
            bill_number=bill_number,
            citizen_id=citizen_id,
            category_id=category.id,
            bill_month=month,
            bill_year=year,
            due_date=due_date,
            amount=tax_details["base_tax"],
            late_fee=0,  # No late fee at generation
            total_amount=tax_details["total_tax"],
            bill_status="pending"
        )
        
        return bill, None

    def get_property_tax_bills(self, citizen_id: int) -> list:
        """Get all property tax bills for a citizen"""
        bills = self.bill_repo.get_by_citizen_id(citizen_id)
        return [b for b in bills if b.category_id == 3]  # Category ID 3 = Property Tax