"""schemas/room.py — Pydantic schemas for Rooms and Room Assets"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoomTypeEnum(str, Enum):
    AC = "AC"
    NonAC = "NonAC"

class RoomStatusEnum(str, Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"

class AssetConditionEnum(str, Enum):
    good = "good"
    fair = "fair"
    needs_repair = "needs-repair"

class RoomAssetOut(BaseModel):
    id: int
    uid: str
    name: str
    condition: AssetConditionEnum
    is_common: bool
    model_config = {"from_attributes": True}

class RoomBase(BaseModel):
    room_number: str
    pg_id: int
    floor: int = 1
    type: RoomTypeEnum
    capacity: int = 1
    occupants: int = 0
    rent: float
    status: RoomStatusEnum = RoomStatusEnum.available

class RoomCreate(RoomBase):
    uid: str

class RoomUpdate(BaseModel):
    floor: Optional[int] = None
    type: Optional[RoomTypeEnum] = None
    capacity: Optional[int] = None
    occupants: Optional[int] = None
    rent: Optional[float] = None
    status: Optional[RoomStatusEnum] = None

class RoomOut(RoomBase):
    id: int
    uid: str
    assets: List[RoomAssetOut] = []
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
