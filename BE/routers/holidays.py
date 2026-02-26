"""
routers/holidays.py — Holiday calendar management
Serves: admin-holidays.tsx, tenant-holidays.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models import Holiday
from schemas.holiday import HolidayCreate, HolidayOut
import uuid

router = APIRouter(prefix="/holidays", tags=["Holidays"])

@router.get("", response_model=List[HolidayOut])
async def list_holidays(db: AsyncSession = Depends(get_db)):
    """Get all holidays sorted by date (used by both admin and tenant views)."""
    result = await db.execute(select(Holiday).order_by(Holiday.date.asc()))
    return result.scalars().all()

@router.get("/{holiday_id}", response_model=HolidayOut)
async def get_holiday(holiday_id: int, db: AsyncSession = Depends(get_db)):
    h = await db.get(Holiday, holiday_id)
    if not h:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return h

@router.post("", response_model=HolidayOut, status_code=201)
async def create_holiday(payload: HolidayCreate, db: AsyncSession = Depends(get_db)):
    """Admin adds a holiday."""
    data = payload.model_dump()
    if not data.get("uid"):
        data["uid"] = f"h-{str(uuid.uuid4())[:8]}"
    holiday = Holiday(**data)
    db.add(holiday)
    await db.commit()
    await db.refresh(holiday)
    return holiday

@router.delete("/{holiday_id}", status_code=204)
async def delete_holiday(holiday_id: int, db: AsyncSession = Depends(get_db)):
    """Admin removes a holiday."""
    h = await db.get(Holiday, holiday_id)
    if not h:
        raise HTTPException(status_code=404, detail="Holiday not found")
    await db.delete(h)
    await db.commit()
