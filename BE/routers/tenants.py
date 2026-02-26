"""
routers/tenants.py — Tenant CRUD
Serves: admin-tenants.tsx, tenant-profile.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models import Tenant
from schemas.tenant import TenantCreate, TenantUpdate, TenantOut
import uuid

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.get("", response_model=List[TenantOut])
async def list_tenants(
    status: Optional[str] = None,
    pg_name: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all tenants. Optionally filter by status."""
    query = select(Tenant)
    if status:
        query = query.where(Tenant.status == status)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{tenant_id}", response_model=TenantOut)
async def get_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.get("/by-room/{room_id}", response_model=List[TenantOut])
async def tenants_by_room(room_id: int, db: AsyncSession = Depends(get_db)):
    """Get all current tenants in a specific room (for tenant-room.tsx)."""
    result = await db.execute(
        select(Tenant).where(Tenant.room_id == room_id, Tenant.status == "active")
    )
    return result.scalars().all()

@router.get("/by-user/{user_id}", response_model=TenantOut)
async def tenant_by_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get tenant by user_id (for tenant dashboard)."""
    result = await db.execute(select(Tenant).where(Tenant.user_id == user_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.post("", response_model=TenantOut, status_code=201)
async def create_tenant(payload: TenantCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    if not data.get("uid"):
        data["uid"] = f"tenant-{str(uuid.uuid4())[:8]}"
    tenant = Tenant(**data)
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant

@router.put("/{tenant_id}", response_model=TenantOut)
async def update_tenant(tenant_id: int, payload: TenantUpdate, db: AsyncSession = Depends(get_db)):
    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(tenant, k, v)
    await db.commit()
    await db.refresh(tenant)
    return tenant

@router.delete("/{tenant_id}", status_code=204)
async def delete_tenant(tenant_id: int, db: AsyncSession = Depends(get_db)):
    tenant = await db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    await db.delete(tenant)
    await db.commit()
