"""
main.py — FastAPI application entry point
Registers all routers, configures CORS, and connects to the database.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
import os
from dotenv import load_dotenv

# ── Import all routers ────────────────────────────────────────────────────────
from routers import auth, dashboard, pgs, rooms, tenants, invoices, tickets, messages, menu, holidays

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:3002").split(",")

# ── Lifespan: create tables on startup ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PG Management API",
    description="Backend REST API for the PG Management App",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register all routers under /api ──────────────────────────────────────────
API_PREFIX = "/api"

app.include_router(auth.router,       prefix=API_PREFIX)
app.include_router(dashboard.router,  prefix=API_PREFIX)
app.include_router(pgs.router,        prefix=API_PREFIX)
app.include_router(rooms.router,      prefix=API_PREFIX)
app.include_router(tenants.router,    prefix=API_PREFIX)
app.include_router(invoices.router,   prefix=API_PREFIX)
app.include_router(tickets.router,    prefix=API_PREFIX)
app.include_router(messages.router,   prefix=API_PREFIX)
app.include_router(menu.router,       prefix=API_PREFIX)
app.include_router(holidays.router,   prefix=API_PREFIX)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "PG Management API is running"}

@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
