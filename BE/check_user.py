"""
check_user.py — Verify login credentials against the database.
Usage: python check_user.py
"""
import asyncio
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

from models import User
from auth import verify_password, hash_password


async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()
        print(f"\n📋  Found {len(users)} user(s) in the database:\n")
        for u in users:
            match = verify_password("demo123", u.password_hash)
            print(f"  [{u.role.value:<6}] {u.email:<30}  password='demo123' matches hash: {match}")
            if not match:
                print(f"           ↳ Hash stored: {u.password_hash[:60]}...")
        
        if not users:
            print("  ⚠️  No users found! Run seed.py first.")
        else:
            print(f"\n🔑  New bcrypt hash for 'demo123': {hash_password('demo123')}\n")


if __name__ == "__main__":
    asyncio.run(check())
