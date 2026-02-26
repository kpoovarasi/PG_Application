"""schemas/message.py — Pydantic schemas for Messages"""
from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class MessageTypeEnum(str, Enum):
    rent_reminder  = "rent_reminder"
    holiday_notice = "holiday_notice"
    announcement   = "announcement"

class MessageBase(BaseModel):
    type:        MessageTypeEnum
    title:       str
    content:     str
    sent_to_all: bool = True

class MessageCreate(MessageBase):
    uid:          str
    recipient_uids: Optional[List[str]] = []  # tenant uids when not sent_to_all

class MessageOut(MessageBase):
    id:         int
    uid:        str
    sent_by:    Optional[int] = None
    sent_at:    Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
