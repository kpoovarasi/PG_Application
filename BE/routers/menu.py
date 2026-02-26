"""
routers/menu.py — Weekly mess menu management
Serves: admin-menu.tsx, tenant-menu-view.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models import MenuItem
from schemas.menu import MenuItemCreate, MenuItemUpdate, MenuItemOut

router = APIRouter(prefix="/menu", tags=["Menu"])

DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@router.get("", response_model=List[MenuItemOut])
async def get_full_menu(db: AsyncSession = Depends(get_db)):
    """Get the complete weekly menu (tenant-menu-view.tsx)."""
    result = await db.execute(select(MenuItem))
    items = result.scalars().all()
    # Sort by day order
    items.sort(key=lambda x: DAYS_ORDER.index(x.day) if x.day in DAYS_ORDER else 99)
    return items

@router.get("/{day}", response_model=MenuItemOut)
async def get_menu_for_day(day: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MenuItem).where(MenuItem.day == day.capitalize()))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"No menu found for {day}")
    return item

@router.put("/{day}", response_model=MenuItemOut)
async def update_menu_day(day: str, payload: MenuItemUpdate, db: AsyncSession = Depends(get_db)):
    """Admin updates menu for a specific day (admin-menu.tsx)."""
    result = await db.execute(select(MenuItem).where(MenuItem.day == day.capitalize()))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"No menu found for {day}")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(item, k, v)
    await db.commit()
    await db.refresh(item)
    return item

@router.post("", response_model=MenuItemOut, status_code=201)
async def create_menu_item(payload: MenuItemCreate, db: AsyncSession = Depends(get_db)):
    """Create menu for a day (initial seeding)."""
    item = MenuItem(**payload.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item
