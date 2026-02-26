"""
fix_passwords_simple.py — Updates password hashes for existing users using raw SQL
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os
from auth import hash_password

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def fix_passwords():
    # Parse DATABASE_URL to get connection parameters
    db_url = DATABASE_URL.replace("postgresql://", "")
    parts = db_url.split("@")
    user_pass = parts[0].split(":")
    host_db = parts[1].split("/")
    
    user = user_pass[0]
    password = user_pass[1] if len(user_pass) > 1 else ""
    host_port = host_db[0].split(":")
    host = host_port[0]
    port = int(host_port[1]) if len(host_port) > 1 else 5432
    database = host_db[1]
    
    conn = await asyncpg.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )
    
    try:
        # Get all users
        users = await conn.fetch("SELECT id, email FROM users")
        print(f"Found {len(users)} users")
        
        for user in users:
            user_id = user['id']
            email = user['email']
            print(f"Updating password for {email}")
            
            # Generate new password hash
            new_hash = hash_password("demo123")
            
            # Update password hash
            await conn.execute(
                "UPDATE users SET password_hash = $1 WHERE id = $2",
                new_hash, user_id
            )
        
        print("✅ Password hashes updated successfully!")
        
        # Test the update
        test_user = await conn.fetchrow("SELECT email, password_hash FROM users WHERE email = 'admin@pgmanager.com'")
        if test_user:
            print(f"Test user {test_user['email']} has password hash: {test_user['password_hash'][:50]}...")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_passwords())
