"""schemas/menu.py — Pydantic schemas for Menu Items"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MenuItemBase(BaseModel):
    day:       str
    breakfast: str
    lunch:     str
    dinner:    str

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    breakfast: Optional[str] = None
    lunch:     Optional[str] = None
    dinner:    Optional[str] = None

class MenuItemOut(MenuItemBase):
    id:         int
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
