"""
seed.py — Populates the database with initial data for development.

Usage (from the BE/ directory):
    python seed.py

What it inserts (idempotent — skips existing records):
  - 1 Admin user
  - 1 Tenant user
  - 1 PG property
  - 2 Rooms
  - 1 Tenant profile (linked to tenant user + room)
  - Menu items (Mon–Sun)
  - Holidays (2026)
  - Sample invoices + tickets
"""

import asyncio
import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

from models import (
    Base, User, PG, Room, RoomAsset, Tenant, MenuItem, Holiday,
    Invoice, Ticket,
    UserRoleEnum, RoomTypeEnum, RoomStatusEnum, AssetConditionEnum,
    StayTypeEnum, TenantStatusEnum, InvoiceStatusEnum,
    TicketCategoryEnum, TicketStatusEnum, TicketPriorityEnum,
)
from auth import hash_password


def uid():
    return str(uuid.uuid4())[:8]


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # ── 1. Admin User ──────────────────────────────────────────────────────
        existing_admin = await db.execute(select(User).where(User.email == "admin@pgmanager.com"))
        admin = existing_admin.scalar_one_or_none()
        if not admin:
            admin = User(
                uid=uid(),
                name="Rajesh Kumar",
                email="admin@pgmanager.com",
                password_hash=hash_password("demo123"),
                role=UserRoleEnum.admin,
            )
            db.add(admin)
            await db.flush()
            print("✅  Admin user created")
        else:
            print("⏭️  Admin user already exists — skipping")

        # ── 2. Tenant User (login account) ────────────────────────────────────
        existing_tenant_user = await db.execute(select(User).where(User.email == "arjun@email.com"))
        tenant_user = existing_tenant_user.scalar_one_or_none()
        if not tenant_user:
            tenant_user = User(
                uid=uid(),
                name="Arjun Sharma",
                email="arjun@email.com",
                password_hash=hash_password("demo123"),
                role=UserRoleEnum.tenant,
            )
            db.add(tenant_user)
            await db.flush()
            print("✅  Tenant user created")
        else:
            print("⏭️  Tenant user already exists — skipping")

        # ── 3. PG Property ────────────────────────────────────────────────────
        existing_pg = await db.execute(select(PG).where(PG.name == "Sunshine PG"))
        pg = existing_pg.scalar_one_or_none()
        if not pg:
            pg = PG(
                uid=uid(),
                name="Sunshine PG",
                address="123, MG Road, Bangalore",
                total_rooms=20,
                occupied_rooms=2,
                total_beds=40,
                occupied_beds=2,
            )
            db.add(pg)
            await db.flush()
            print("✅  PG created")
        else:
            print("⏭️  PG already exists — skipping")

        # ── 4. Rooms ──────────────────────────────────────────────────────────
        existing_room = await db.execute(select(Room).where(Room.room_number == "101"))
        room101 = existing_room.scalar_one_or_none()
        if not room101:
            room101 = Room(
                uid=uid(),
                pg_id=pg.id,
                room_number="101",
                floor=1,
                type=RoomTypeEnum.AC,
                capacity=2,
                occupants=1,
                rent=Decimal("12000"),
                status=RoomStatusEnum.occupied,
            )
            db.add(room101)
            await db.flush()

            # Room assets
            for asset_name, cond in [
                ("Single Bed", AssetConditionEnum.good),
                ("Study Table", AssetConditionEnum.good),
                ("Wardrobe", AssetConditionEnum.fair),
                ("Chair", AssetConditionEnum.good),
                ("AC Unit", AssetConditionEnum.good),
            ]:
                db.add(RoomAsset(uid=uid(), room_id=room101.id, name=asset_name, condition=cond))
            print("✅  Room 101 created with assets")
        else:
            print("⏭️  Room 101 already exists — skipping")

        existing_room2 = await db.execute(select(Room).where(Room.room_number == "102"))
        room102 = existing_room2.scalar_one_or_none()
        if not room102:
            room102 = Room(
                uid=uid(),
                pg_id=pg.id,
                room_number="102",
                floor=1,
                type=RoomTypeEnum.NonAC,
                capacity=3,
                occupants=0,
                rent=Decimal("8000"),
                status=RoomStatusEnum.available,
            )
            db.add(room102)
            await db.flush()
            print("✅  Room 102 created")
        else:
            print("⏭️  Room 102 already exists — skipping")

        # ── 5. Tenant Profile ─────────────────────────────────────────────────
        existing_tenant = await db.execute(select(Tenant).where(Tenant.email == "arjun@email.com"))
        tenant = existing_tenant.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(
                uid=uid(),
                tenant_code="TEN-2024-001",
                user_id=tenant_user.id,
                room_id=room101.id,
                name="Arjun Sharma",
                email="arjun@email.com",
                phone="+91 98765 43210",
                stay_type=StayTypeEnum.monthly,
                join_date=date(2024, 6, 15),
                rent_amount=Decimal("12000"),
                security_deposit=Decimal("24000"),
                emergency_contact="+91 98765 43211",
                id_proof="Aadhaar - XXXX-XXXX-1234",
                status=TenantStatusEnum.active,
            )
            db.add(tenant)
            await db.flush()
            print("✅  Tenant profile created")
        else:
            print("⏭️  Tenant profile already exists — skipping")

        # ── 6. Menu Items ─────────────────────────────────────────────────────
        existing_menu = await db.execute(select(MenuItem).where(MenuItem.day == "Monday"))
        if not existing_menu.scalar_one_or_none():
            menu_data = [
                ("Monday",    "Poha, Tea/Coffee",      "Dal, Rice, Roti, Sabzi",          "Paneer Butter Masala, Roti, Rice"),
                ("Tuesday",   "Idli Sambar, Coffee",   "Rajma, Rice, Roti, Salad",        "Chole, Rice, Roti, Raita"),
                ("Wednesday", "Aloo Paratha, Curd",    "Kadhi Pakora, Rice, Roti",        "Mix Veg, Dal, Rice, Roti"),
                ("Thursday",  "Upma, Tea/Coffee",      "Dal Fry, Rice, Roti, Sabzi",      "Egg Curry / Paneer, Rice, Roti"),
                ("Friday",    "Bread Toast, Omelette", "Sambar, Rice, Roti, Poriyal",     "Biryani, Raita, Salad"),
                ("Saturday",  "Dosa, Chutney, Sambar", "Aloo Gobi, Dal, Rice, Roti",     "Pasta, Garlic Bread, Soup"),
                ("Sunday",    "Chole Bhature, Lassi",  "Special Thali",                  "Pulao, Paneer Tikka, Dessert"),
            ]
            for day, breakfast, lunch, dinner in menu_data:
                db.add(MenuItem(day=day, breakfast=breakfast, lunch=lunch, dinner=dinner))
            print("✅  Menu items created")
        else:
            print("⏭️  Menu already exists — skipping")

        # ── 7. Holidays ───────────────────────────────────────────────────────
        existing_holiday = await db.execute(select(Holiday).where(Holiday.uid == "h-2026-01"))
        if not existing_holiday.scalar_one_or_none():
            holidays = [
                ("h-2026-01", date(2026, 1, 26), "Republic Day",        "National holiday - office closed"),
                ("h-2026-02", date(2026, 3, 14), "Holi",                "Festival of colors"),
                ("h-2026-03", date(2026, 4, 2),  "Good Friday",         "Public holiday"),
                ("h-2026-04", date(2026, 4, 14), "Ambedkar Jayanti",    "Public holiday"),
                ("h-2026-05", date(2026, 5, 1),  "May Day",             "Workers day"),
                ("h-2026-06", date(2026, 8, 15), "Independence Day",    "National holiday - office closed"),
                ("h-2026-07", date(2026, 10, 2), "Gandhi Jayanti",      "National holiday"),
                ("h-2026-08", date(2026, 10, 20),"Dussehra",            "Festival holiday"),
                ("h-2026-09", date(2026, 11, 9), "Diwali",              "Festival of lights"),
                ("h-2026-10", date(2026, 12, 25),"Christmas",           "Festival holiday"),
            ]
            for h_uid, h_date, name, desc in holidays:
                db.add(Holiday(uid=h_uid, date=h_date, name=name, description=desc))
            print("✅  Holidays created")
        else:
            print("⏭️  Holidays already exist — skipping")

        # ── 8. Sample Invoices ────────────────────────────────────────────────
        existing_inv = await db.execute(select(Invoice).where(Invoice.uid == "inv-seed-01"))
        if not existing_inv.scalar_one_or_none():
            today = date.today()
            first_of_month = today.replace(day=1)

            inv_paid = Invoice(
                uid="inv-seed-01",
                tenant_id=tenant.id,
                room_id=room101.id,
                month="January 2026",
                rent_amount=Decimal("12000"),
                electricity=Decimal("920"),
                water=Decimal("200"),
                maintenance=Decimal("500"),
                total=Decimal("13620"),
                status=InvoiceStatusEnum.paid,
                due_date=date(2026, 1, 5),
                paid_date=date(2026, 1, 4),
            )
            inv_pending = Invoice(
                uid="inv-seed-02",
                tenant_id=tenant.id,
                room_id=room101.id,
                month="February 2026",
                rent_amount=Decimal("12000"),
                electricity=Decimal("850"),
                water=Decimal("200"),
                maintenance=Decimal("500"),
                total=Decimal("13550"),
                status=InvoiceStatusEnum.pending,
                due_date=date(2026, 2, 5),
            )
            db.add(inv_paid)
            db.add(inv_pending)
            print("✅  Sample invoices created")
        else:
            print("⏭️  Sample invoices already exist — skipping")

        # ── 9. Sample Ticket ──────────────────────────────────────────────────
        existing_ticket = await db.execute(select(Ticket).where(Ticket.uid == "tkt-seed-01"))
        if not existing_ticket.scalar_one_or_none():
            db.add(Ticket(
                uid="tkt-seed-01",
                tenant_id=tenant.id,
                room_id=room101.id,
                category=TicketCategoryEnum.plumbing,
                subject="Leaking tap in bathroom",
                description="The bathroom tap has been leaking for 2 days.",
                status=TicketStatusEnum.open,
                priority=TicketPriorityEnum.high,
            ))
            print("✅  Sample ticket created")
        else:
            print("⏭️  Sample ticket already exists — skipping")

        await db.commit()
        print("\n🎉  Seed complete! You can now login with:")
        print("     Admin  → admin@pgmanager.com / demo123")
        print("     Tenant → arjun@email.com / demo123")


if __name__ == "__main__":
    asyncio.run(seed())
