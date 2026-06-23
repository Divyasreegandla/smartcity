# init_bill_categories.py
from database.database import SessionLocal
from models.bill_categories import BillCategory

def init_categories():
    db = SessionLocal()
    categories = [
        "Electricity",
        "Water", 
        "Property Tax",
        "Fiber Internet",
        "Waste Management"
    ]
    
    for category in categories:
        existing = db.query(BillCategory).filter(BillCategory.category_name == category).first()
        if not existing:
            db.add(BillCategory(category_name=category))
            print(f"✅ Added category: {category}")
    
    db.commit()
    db.close()
    print("✅ Bill categories initialized!")

if __name__ == "__main__":
    init_categories()