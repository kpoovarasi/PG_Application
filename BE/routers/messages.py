"""
routers/messages.py — Admin messages / tenant notifications
Serves: admin-messages.tsx, tenant-notifications.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database import get_db
from models import Message, MessageRecipient, Tenant
from schemas.message import MessageCreate, MessageOut
import uuid

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("", response_model=List[MessageOut])
async def list_messages(db: AsyncSession = Depends(get_db)):
    """Admin: get all messages sent."""
    result = await db.execute(select(Message).order_by(Message.sent_at.desc()))
    return result.scalars().all()

@router.get("/tenant/{tenant_id}", response_model=List[MessageOut])
async def tenant_messages(tenant_id: int, db: AsyncSession = Depends(get_db)):
    """Tenant: get messages addressed to this tenant (sent_to_all OR explicitly included)."""
    # Get all-tenant messages
    all_msgs = await db.execute(
        select(Message).where(Message.sent_to_all == True).order_by(Message.sent_at.desc())
    )
    # Get targeted messages for this tenant
    targeted = await db.execute(
        select(Message)
        .join(MessageRecipient, MessageRecipient.message_id == Message.id)
        .where(MessageRecipient.tenant_id == tenant_id)
        .order_by(Message.sent_at.desc())
    )
    msgs = list(all_msgs.scalars().all()) + list(targeted.scalars().all())
    # Deduplicate by id
    seen, unique = set(), []
    for m in msgs:
        if m.id not in seen:
            seen.add(m.id)
            unique.append(m)
    unique.sort(key=lambda m: m.sent_at, reverse=True)
    return unique

@router.post("", response_model=MessageOut, status_code=201)
async def send_message(payload: MessageCreate, db: AsyncSession = Depends(get_db)):
    """Admin sends a new message / announcement."""
    data = payload.model_dump(exclude={"recipient_uids"})
    if not data.get("uid"):
        data["uid"] = f"msg-{str(uuid.uuid4())[:8]}"
    message = Message(**data)
    db.add(message)
    await db.flush()

    # Add specific recipients if not sent_to_all
    if not payload.sent_to_all and payload.recipient_uids:
        for t_uid in payload.recipient_uids:
            t_result = await db.execute(select(Tenant).where(Tenant.uid == t_uid))
            tenant = t_result.scalar_one_or_none()
            if tenant:
                db.add(MessageRecipient(message_id=message.id, tenant_id=tenant.id))

    await db.commit()
    await db.refresh(message)
    return message

@router.delete("/{message_id}", status_code=204)
async def delete_message(message_id: int, db: AsyncSession = Depends(get_db)):
    msg = await db.get(Message, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(msg)
    await db.commit()
