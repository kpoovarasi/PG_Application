"""
routers/rooms.py — Room CRUD + Room Assets
Serves: admin-rooms.tsx, tenant-room.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database import get_db
from models import Room, RoomAsset
from schemas.room import RoomCreate, RoomUpdate, RoomOut
import uuid

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=List[RoomOut])
async def list_rooms(pg_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    """List all rooms. Optionally filter by PG."""
    query = select(Room).options(selectinload(Room.assets))
    if pg_id:
        query = query.where(Room.pg_id == pg_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{room_id}", response_model=RoomOut)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Room).where(Room.id == room_id).options(selectinload(Room.assets))
    )
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("", response_model=RoomOut, status_code=201)
async def create_room(payload: RoomCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    if not data.get("uid"):
        data["uid"] = f"room-{str(uuid.uuid4())[:8]}"
    room = Room(**data)
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room

@router.put("/{room_id}", response_model=RoomOut)
async def update_room(room_id: int, payload: RoomUpdate, db: AsyncSession = Depends(get_db)):
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(room, k, v)
    await db.commit()
    await db.refresh(room)
    return room

@router.delete("/{room_id}", status_code=204)
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db)):
    room = await db.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.delete(room)
    await db.commit()

# ── Room Assets ──────────────────────────────────────────────────────────────

@router.get("/{room_id}/assets")
async def get_room_assets(room_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RoomAsset).where(RoomAsset.room_id == room_id))
    return result.scalars().all()

@router.get("/assets/common")
async def get_common_assets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RoomAsset).where(RoomAsset.is_common == True))
    return result.scalars().all()
