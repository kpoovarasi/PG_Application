"""schemas/holiday.py — Pydantic schemas for Holidays"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class HolidayBase(BaseModel):
    date:        date
    name:        str
    description: Optional[str] = None

class HolidayCreate(HolidayBase):
    uid: str

class HolidayOut(HolidayBase):
    id:         int
    uid:        str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
