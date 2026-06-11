from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.waste_bins import WasteBin, BinStatus
from .base_repository import BaseRepository


class WasteBinRepository(BaseRepository[WasteBin]):
    def __init__(self, db: Session):
        super().__init__(WasteBin, db)

    def get_by_bin_code(self, bin_code: str) -> Optional[WasteBin]:
        """Get bin by bin code"""
        return self.db.query(WasteBin).filter(WasteBin.bin_code == bin_code.upper()).first()

    def get_by_status(self, status: BinStatus, skip: int = 0, limit: int = 100) -> List[WasteBin]:
        """Get bins by status"""
        return self.db.query(WasteBin).filter(
            WasteBin.status == status
        ).offset(skip).limit(limit).all()

    def get_full_bins(self) -> List[WasteBin]:
        """Get full or overflowing bins"""
        return self.db.query(WasteBin).filter(
            WasteBin.status.in_([BinStatus.FULL, BinStatus.OVERFLOWING])
        ).all()

    def get_bins_needing_attention(self) -> List[WasteBin]:
        """Get bins that need collection (full or overflowing)"""
        return self.get_full_bins()

    def update_fill_level(self, bin_id: int, fill_level: float) -> Optional[WasteBin]:
        """Update bin fill level and auto-update status"""
        bin = self.get_by_id(bin_id)
        if bin:
            bin.fill_level = fill_level
            fill_percentage = (bin.fill_level / bin.bin_capacity) * 100
            if fill_percentage >= 100:
                bin.status = BinStatus.OVERFLOWING
            elif fill_percentage >= 80:
                bin.status = BinStatus.FULL
            elif fill_percentage >= 30:
                bin.status = BinStatus.PARTIAL
            else:
                bin.status = BinStatus.EMPTY
            self.db.commit()
            self.db.refresh(bin)
        return bin

    def get_total_capacity(self) -> float:
        """Get total capacity of all bins"""
        result = self.db.query(WasteBin.bin_capacity).all()
        return sum(r[0] for r in result)

    def get_total_fill_level(self) -> float:
        """Get total current fill level"""
        result = self.db.query(WasteBin.fill_level).all()
        return sum(r[0] for r in result)

    def get_bin_status_summary(self) -> dict:
        """Get summary of bin statuses"""
        summary = {}
        for status in BinStatus:
            count = self.db.query(WasteBin).filter(WasteBin.status == status).count()
            summary[status.value] = count
        return summary