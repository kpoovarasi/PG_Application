"""
routers/pgs.py — PG property CRUD
Serves: admin-portal.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database import get_db
from models import PG
from schemas.pg import PGCreate, PGUpdate, PGOut
import uuid

router = APIRouter(prefix="/pgs", tags=["PGs"])

@router.get("", response_model=List[PGOut])
async def list_pgs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PG))
    return result.scalars().all()

@router.get("/{pg_id}", response_model=PGOut)
async def get_pg(pg_id: int, db: AsyncSession = Depends(get_db)):
    pg = await db.get(PG, pg_id)
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    return pg

@router.post("", response_model=PGOut, status_code=201)
async def create_pg(payload: PGCreate, db: AsyncSession = Depends(get_db)):
    pg = PG(**payload.model_dump())
    if not pg.uid:
        pg.uid = f"pg-{str(uuid.uuid4())[:8]}"
    db.add(pg)
    await db.commit()
    await db.refresh(pg)
    return pg

@router.put("/{pg_id}", response_model=PGOut)
async def update_pg(pg_id: int, payload: PGUpdate, db: AsyncSession = Depends(get_db)):
    pg = await db.get(PG, pg_id)
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(pg, k, v)
    await db.commit()
    await db.refresh(pg)
    return pg

@router.delete("/{pg_id}", status_code=204)
async def delete_pg(pg_id: int, db: AsyncSession = Depends(get_db)):
    pg = await db.get(PG, pg_id)
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    await db.delete(pg)
    await db.commit()
