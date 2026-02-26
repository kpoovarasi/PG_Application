"""
routers/tickets.py — Maintenance ticket CRUD
Serves: admin-tickets.tsx, tenant-tickets.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.sql import func
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Ticket
from schemas.ticket import TicketCreate, TicketUpdate, TicketOut
import uuid

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketOut])
async def list_tickets(
    tenant_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List tickets with optional filters."""
    from models import TicketStatusEnum, TicketPriorityEnum
    
    query = select(Ticket).order_by(Ticket.created_at.desc())
    if tenant_id:
        query = query.where(Ticket.tenant_id == tenant_id)
    if status:
        try:
            status_enum = TicketStatusEnum(status)
            query = query.where(Ticket.status == status_enum)
        except ValueError:
            # If invalid status, return empty result
            return []
    if priority:
        try:
            priority_enum = TicketPriorityEnum(priority)
            query = query.where(Ticket.priority == priority_enum)
        except ValueError:
            # If invalid priority, return empty result
            return []
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.post("", response_model=TicketOut, status_code=201)
async def create_ticket(payload: TicketCreate, db: AsyncSession = Depends(get_db)):
    """Tenant raises a new maintenance ticket."""
    data = payload.model_dump()
    if not data.get("uid"):
        data["uid"] = f"tkt-{str(uuid.uuid4())[:8]}"
    ticket = Ticket(**data)
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.put("/{ticket_id}", response_model=TicketOut)
async def update_ticket(ticket_id: int, payload: TicketUpdate, db: AsyncSession = Depends(get_db)):
    """Admin updates ticket status / priority."""
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    updates = payload.model_dump(exclude_none=True)
    # Auto-set resolved_at when status becomes resolved/closed
    if updates.get("status") in ("resolved", "closed") and not ticket.resolved_at:
        updates["resolved_at"] = datetime.utcnow()
    updates["updated_at"] = datetime.utcnow()
    for k, v in updates.items():
        setattr(ticket, k, v)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.delete("/{ticket_id}", status_code=204)
async def delete_ticket(ticket_id: int, db: AsyncSession = Depends(get_db)):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    await db.delete(ticket)
    await db.commit()
