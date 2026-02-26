"""schemas/ticket.py — Pydantic schemas for Tickets"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class TicketCategoryEnum(str, Enum):
    plumbing   = "plumbing"
    electrical = "electrical"
    wifi       = "wifi"
    furniture  = "furniture"
    cleaning   = "cleaning"
    other      = "other"

class TicketStatusEnum(str, Enum):
    open        = "open"
    in_progress = "in-progress"
    resolved    = "resolved"
    closed      = "closed"

class TicketPriorityEnum(str, Enum):
    low    = "low"
    medium = "medium"
    high   = "high"

class TicketBase(BaseModel):
    tenant_id:   int
    room_id:     int
    category:    TicketCategoryEnum
    subject:     str
    description: str
    status:      TicketStatusEnum   = TicketStatusEnum.open
    priority:    TicketPriorityEnum = TicketPriorityEnum.medium

class TicketCreate(TicketBase):
    uid: str

class TicketUpdate(BaseModel):
    status:      Optional[TicketStatusEnum]   = None
    priority:    Optional[TicketPriorityEnum] = None
    description: Optional[str]               = None
    resolved_at: Optional[datetime]          = None

class TicketOut(TicketBase):
    id:          int
    uid:         str
    created_at:  Optional[datetime] = None
    updated_at:  Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
