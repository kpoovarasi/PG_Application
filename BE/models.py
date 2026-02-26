"""
models.py — SQLAlchemy ORM models matching the PostgreSQL schema
"""
import enum
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Date, Numeric,
    ForeignKey, TIMESTAMP, Enum as SAEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


# ── Enums ────────────────────────────────────────────────────────────────────

class UserRoleEnum(str, enum.Enum):
    admin = "admin"
    tenant = "tenant"

class RoomTypeEnum(str, enum.Enum):
    AC = "AC"
    NonAC = "NonAC"

class RoomStatusEnum(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"

class AssetConditionEnum(str, enum.Enum):
    good = "good"
    fair = "fair"
    needs_repair = "needs-repair"

class StayTypeEnum(str, enum.Enum):
    monthly = "monthly"
    daily = "daily"

class TenantStatusEnum(str, enum.Enum):
    active = "active"
    inactive = "inactive"

class MessageTypeEnum(str, enum.Enum):
    rent_reminder = "rent_reminder"
    holiday_notice = "holiday_notice"
    announcement = "announcement"

class InvoiceStatusEnum(str, enum.Enum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"

class TicketCategoryEnum(str, enum.Enum):
    plumbing = "plumbing"
    electrical = "electrical"
    wifi = "wifi"
    furniture = "furniture"
    cleaning = "cleaning"
    other = "other"

class TicketStatusEnum(str, enum.Enum):
    open = "open"
    in_progress = "in-progress"
    resolved = "resolved"
    closed = "closed"

class TicketPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    uid           = Column(String(50), unique=True, nullable=False)
    name          = Column(String(150), nullable=False)
    email         = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role          = Column(SAEnum(UserRoleEnum), nullable=False, default=UserRoleEnum.tenant)
    avatar_url    = Column(Text)
    created_at    = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at    = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    tenants  = relationship("Tenant", back_populates="user")
    messages = relationship("Message", back_populates="sender")


class PG(Base):
    __tablename__ = "pgs"

    id             = Column(Integer, primary_key=True, index=True)
    uid            = Column(String(50), unique=True, nullable=False)
    name           = Column(String(200), nullable=False)
    address        = Column(Text, nullable=False)
    total_rooms    = Column(Integer, default=0)
    occupied_rooms = Column(Integer, default=0)
    total_beds     = Column(Integer, default=0)
    occupied_beds  = Column(Integer, default=0)
    created_at     = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at     = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    rooms = relationship("Room", back_populates="pg")


class Room(Base):
    __tablename__ = "rooms"

    id          = Column(Integer, primary_key=True, index=True)
    uid         = Column(String(50), unique=True, nullable=False)
    pg_id       = Column(Integer, ForeignKey("pgs.id", ondelete="CASCADE"), nullable=False)
    room_number = Column(String(20), nullable=False)
    floor       = Column(Integer, default=1)
    type        = Column(SAEnum(RoomTypeEnum), nullable=False)
    capacity    = Column(Integer, default=1)
    occupants   = Column(Integer, default=0)
    rent        = Column(Numeric(10, 2), nullable=False)
    status      = Column(SAEnum(RoomStatusEnum), default=RoomStatusEnum.available)
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at  = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (UniqueConstraint("pg_id", "room_number"),)

    pg       = relationship("PG", back_populates="rooms")
    assets   = relationship("RoomAsset", back_populates="room")
    tenants  = relationship("Tenant", back_populates="room")
    invoices = relationship("Invoice", back_populates="room")
    tickets  = relationship("Ticket", back_populates="room")


class RoomAsset(Base):
    __tablename__ = "room_assets"

    id         = Column(Integer, primary_key=True, index=True)
    uid        = Column(String(50), unique=True, nullable=False)
    room_id    = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    name       = Column(String(200), nullable=False)
    condition  = Column(SAEnum(AssetConditionEnum), default=AssetConditionEnum.good)
    is_common  = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    room = relationship("Room", back_populates="assets")


class Tenant(Base):
    __tablename__ = "tenants"

    id                = Column(Integer, primary_key=True, index=True)
    uid               = Column(String(50), unique=True, nullable=False)
    tenant_code       = Column(String(30), unique=True, nullable=False)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    room_id           = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    name              = Column(String(150), nullable=False)
    email             = Column(String(255), nullable=False)
    phone             = Column(String(20), nullable=False)
    stay_type         = Column(SAEnum(StayTypeEnum), default=StayTypeEnum.monthly)
    join_date         = Column(Date, nullable=False)
    rent_amount       = Column(Numeric(10, 2), nullable=False)
    security_deposit  = Column(Numeric(10, 2), default=0)
    emergency_contact = Column(String(20), nullable=False)
    id_proof          = Column(String(100), nullable=False)
    status            = Column(SAEnum(TenantStatusEnum), default=TenantStatusEnum.active)
    created_at        = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at        = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    user                = relationship("User", back_populates="tenants")
    room                = relationship("Room", back_populates="tenants")
    invoices            = relationship("Invoice", back_populates="tenant")
    tickets             = relationship("Ticket", back_populates="tenant")
    message_recipients  = relationship("MessageRecipient", back_populates="tenant")


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    uid         = Column(String(50), unique=True, nullable=False)
    type        = Column(SAEnum(MessageTypeEnum), nullable=False)
    title       = Column(String(300), nullable=False)
    content     = Column(Text, nullable=False)
    sent_by     = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sent_to_all = Column(Boolean, default=True)
    sent_at     = Column(TIMESTAMP(timezone=True), server_default=func.now())
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())

    sender     = relationship("User", back_populates="messages")
    recipients = relationship("MessageRecipient", back_populates="message")


class MessageRecipient(Base):
    __tablename__ = "message_recipients"

    id         = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    tenant_id  = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("message_id", "tenant_id"),)

    message = relationship("Message", back_populates="recipients")
    tenant  = relationship("Tenant", back_populates="message_recipients")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id         = Column(Integer, primary_key=True, index=True)
    day        = Column(String(10), unique=True, nullable=False)
    breakfast  = Column(Text, nullable=False)
    lunch      = Column(Text, nullable=False)
    dinner     = Column(Text, nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Holiday(Base):
    __tablename__ = "holidays"

    id          = Column(Integer, primary_key=True, index=True)
    uid         = Column(String(20), unique=True, nullable=False)
    date        = Column(Date, unique=True, nullable=False)
    name        = Column(String(200), nullable=False)
    description = Column(Text)
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id          = Column(Integer, primary_key=True, index=True)
    uid         = Column(String(50), unique=True, nullable=False)
    tenant_id   = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    room_id     = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    month       = Column(String(30), nullable=False)
    rent_amount = Column(Numeric(10, 2), nullable=False)
    electricity = Column(Numeric(10, 2), default=0)
    water       = Column(Numeric(10, 2), default=0)
    maintenance = Column(Numeric(10, 2), default=0)
    total       = Column(Numeric(10, 2), nullable=False)
    status      = Column(SAEnum(InvoiceStatusEnum), default=InvoiceStatusEnum.pending)
    due_date    = Column(Date, nullable=False)
    paid_date   = Column(Date, nullable=True)
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at  = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant", back_populates="invoices")
    room   = relationship("Room", back_populates="invoices")


class Ticket(Base):
    __tablename__ = "tickets"

    id          = Column(Integer, primary_key=True, index=True)
    uid         = Column(String(50), unique=True, nullable=False)
    tenant_id   = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    room_id     = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    category    = Column(SAEnum(TicketCategoryEnum), nullable=False)
    subject     = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    status      = Column(SAEnum(TicketStatusEnum), default=TicketStatusEnum.open)
    priority    = Column(SAEnum(TicketPriorityEnum), default=TicketPriorityEnum.medium)
    created_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at  = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(TIMESTAMP(timezone=True), nullable=True)

    tenant = relationship("Tenant", back_populates="tickets")
    room   = relationship("Room", back_populates="tickets")
