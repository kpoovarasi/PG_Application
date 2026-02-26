"""
reset_passwords.py — Resets all user passwords to 'demo123' with a fresh bcrypt hash.
Usage (from the BE/ directory):
    python reset_passwords.py
"""
import asyncio
from sqlalchemy import select, update
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
from auth import hash_password, verify_password


async def reset():
    new_hash = hash_password("demo123")
    print(f"🔑  New bcrypt hash: {new_hash}\n")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User))
        users = result.scalars().all()

        if not users:
            print("⚠️  No users found in the database.")
            return

        print(f"📋  Resetting passwords for {len(users)} user(s)...\n")
        for u in users:
            u.password_hash = new_hash
            print(f"  ✅  [{u.role.value:<6}] {u.email}")

        await db.commit()

        # Verify
        print("\n🔍  Verifying passwords after reset...\n")
        result2 = await db.execute(select(User))
        users2 = result2.scalars().all()
        all_ok = True
        for u in users2:
            ok = verify_password("demo123", u.password_hash)
            status = "✅" if ok else "❌"
            print(f"  {status}  [{u.role.value:<6}] {u.email}  → verify='demo123': {ok}")
            if not ok:
                all_ok = False

        if all_ok:
            print("\n🎉  All passwords reset successfully!")
            print("     Login credentials:")
            print("       Admin  → admin@pgmanager.com / demo123")
            print("       Tenant → arjun@email.com     / demo123")
        else:
            print("\n❌  Some passwords failed verification. Check the output above.")


if __name__ == "__main__":
    asyncio.run(reset())
