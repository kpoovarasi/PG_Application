"""
fix_passwords.py — Updates password hashes for existing users
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

from auth import hash_password

async def fix_passwords():
    async with AsyncSessionLocal() as db:
        # Get all users
        result = await db.execute(select("SELECT id, email FROM users"))
        users = result.fetchall()
        
        print(f"Found {len(users)} users")
        
        for user in users:
            user_id, email = user
            print(f"Updating password for {email}")
            
            # Generate new password hash
            new_hash = hash_password("demo123")
            
            # Update password hash
            await db.execute(
                update("users").where("users.id == :user_id").values(password_hash=new_hash)
            )
        
        await db.commit()
        print("✅ Password hashes updated successfully!")

if __name__ == "__main__":
    asyncio.run(fix_passwords())
