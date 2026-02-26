"""schemas/invoice.py — Pydantic schemas for Invoices"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from enum import Enum

class InvoiceStatusEnum(str, Enum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"

class InvoiceBase(BaseModel):
    tenant_id: int
    room_id: int
    month: str
    rent_amount: float
    electricity: float = 0
    water: float = 0
    maintenance: float = 0
    total: float
    status: InvoiceStatusEnum = InvoiceStatusEnum.pending
    due_date: date
    paid_date: Optional[date] = None

class InvoiceCreate(InvoiceBase):
    uid: str

class InvoiceUpdate(BaseModel):
    status: Optional[InvoiceStatusEnum] = None
    electricity: Optional[float] = None
    water: Optional[float] = None
    maintenance: Optional[float] = None
    total: Optional[float] = None
    paid_date: Optional[date] = None

class InvoiceOut(InvoiceBase):
    id: int
    uid: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
