"""
routers/dashboard.py — Admin dashboard summary stats
Serves: admin-dashboard.tsx
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_db
from models import PG, Room, Tenant, Ticket, Invoice, RoomStatusEnum, TenantStatusEnum, TicketStatusEnum, InvoiceStatusEnum

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    """Returns all stats shown on the admin dashboard."""

    # PG count
    pg_count = (await db.execute(select(func.count(PG.id)))).scalar()

    # Room stats
    total_rooms    = (await db.execute(select(func.count(Room.id)))).scalar()
    occupied_rooms = (await db.execute(select(func.count(Room.id)).where(Room.status == "occupied"))).scalar()
    maintenance_rooms = (await db.execute(select(func.count(Room.id)).where(Room.status == "maintenance"))).scalar()

    # Bed counts from PGs
    beds = (await db.execute(select(func.sum(PG.total_beds), func.sum(PG.occupied_beds)))).one()
    total_beds, occupied_beds = (beds[0] or 0), (beds[1] or 0)

    # Active tenants
    active_tenants = (await db.execute(
        select(func.count(Tenant.id)).where(Tenant.status == "active")
    )).scalar()

    # Open tickets (open + in-progress)
    open_tickets = (await db.execute(
        select(func.count(Ticket.id)).where(Ticket.status.in_(["open", "in-progress"]))
    )).scalar()

    # Overdue invoices
    overdue_invoices = (await db.execute(
        select(func.count(Invoice.id)).where(Invoice.status == "overdue")
    )).scalar()

    occupancy_rate = round((occupied_rooms / total_rooms * 100) if total_rooms else 0)

    return {
        "total_pgs":          pg_count,
        "total_rooms":        total_rooms,
        "occupied_rooms":     occupied_rooms,
        "vacant_rooms":       total_rooms - occupied_rooms,
        "maintenance_rooms":  maintenance_rooms,
        "total_beds":         total_beds,
        "occupied_beds":      occupied_beds,
        "occupancy_rate":     occupancy_rate,
        "active_tenants":     active_tenants,
        "open_tickets":       open_tickets,
        "overdue_invoices":   overdue_invoices,
    }

@router.get("/pgs-overview")
async def pgs_overview(db: AsyncSession = Depends(get_db)):
    """Per-PG occupancy breakdown shown on admin dashboard."""
    result = await db.execute(select(PG))
    pgs = result.scalars().all()
    return [
        {
            "id":             pg.id,
            "name":           pg.name,
            "address":        pg.address,
            "total_rooms":    pg.total_rooms,
            "occupied_rooms": pg.occupied_rooms,
            "total_beds":     pg.total_beds,
            "occupied_beds":  pg.occupied_beds,
            "occupancy_rate": round((pg.occupied_rooms / pg.total_rooms * 100) if pg.total_rooms else 0),
        }
        for pg in pgs
    ]
