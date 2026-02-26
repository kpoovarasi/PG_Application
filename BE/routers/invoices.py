"""
routers/invoices.py — Invoice CRUD
Serves: admin-invoices.tsx, tenant-invoices.tsx
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database import get_db
from models import Invoice
from schemas.invoice import InvoiceCreate, InvoiceUpdate, InvoiceOut
import uuid

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceOut])
async def list_invoices(
    tenant_id: Optional[int] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List invoices. Filter by tenant_id or status."""
    query = select(Invoice)
    if tenant_id:
        query = query.where(Invoice.tenant_id == tenant_id)
    if status:
        query = query.where(Invoice.status == status)
    query = query.order_by(Invoice.due_date.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv

@router.post("", response_model=InvoiceOut, status_code=201)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump()
    if not data.get("uid"):
        data["uid"] = f"inv-{str(uuid.uuid4())[:8]}"
    inv = Invoice(**data)
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return inv

@router.put("/{invoice_id}", response_model=InvoiceOut)
async def update_invoice(invoice_id: int, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db)):
    """Mark as paid, update charges, etc."""
    inv = await db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(inv, k, v)
    await db.commit()
    await db.refresh(inv)
    return inv

@router.delete("/{invoice_id}", status_code=204)
async def delete_invoice(invoice_id: int, db: AsyncSession = Depends(get_db)):
    inv = await db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    await db.delete(inv)
    await db.commit()
