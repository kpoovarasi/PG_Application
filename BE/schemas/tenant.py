"""schemas/tenant.py — Pydantic schemas for Tenants"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from enum import Enum

class StayTypeEnum(str, Enum):
    monthly = "monthly"
    daily = "daily"

class TenantStatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"

class TenantBase(BaseModel):
    name: str
    email: str
    phone: str
    room_id: int
    stay_type: StayTypeEnum = StayTypeEnum.monthly
    join_date: date
    rent_amount: float
    security_deposit: float = 0
    emergency_contact: str
    id_proof: str
    status: TenantStatusEnum = TenantStatusEnum.active

class TenantCreate(TenantBase):
    uid: str
    tenant_code: str
    user_id: Optional[int] = None

class TenantUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    room_id: Optional[int] = None
    stay_type: Optional[StayTypeEnum] = None
    rent_amount: Optional[float] = None
    security_deposit: Optional[float] = None
    emergency_contact: Optional[str] = None
    id_proof: Optional[str] = None
    status: Optional[TenantStatusEnum] = None

class TenantOut(TenantBase):
    id: int
    uid: str
    tenant_code: str
    user_id: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
