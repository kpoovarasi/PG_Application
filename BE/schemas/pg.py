"""schemas/pg.py — Pydantic schemas for PG properties"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PGBase(BaseModel):
    name: str
    address: str
    total_rooms: int = 0
    occupied_rooms: int = 0
    total_beds: int = 0
    occupied_beds: int = 0

class PGCreate(PGBase):
    uid: str

class PGUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    total_rooms: Optional[int] = None
    occupied_rooms: Optional[int] = None
    total_beds: Optional[int] = None
    occupied_beds: Optional[int] = None

class PGOut(PGBase):
    id: int
    uid: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
