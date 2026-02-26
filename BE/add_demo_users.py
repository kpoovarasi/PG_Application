"""
add_demo_users.py — Adds the demo admin and tenant users that the frontend expects
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os
from auth import hash_password

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def add_demo_users():
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
        # Check if admin user exists
        admin_exists = await conn.fetchval("SELECT id FROM users WHERE email = 'admin@pgmanager.com'")
        
        if not admin_exists:
            print("Creating admin user...")
            admin_hash = hash_password("demo123")
            await conn.execute(
                """
                INSERT INTO users (uid, name, email, password_hash, role, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5::user_role, NOW(), NOW())
                """,
                "admin-001", "Rajesh Kumar", "admin@pgmanager.com", admin_hash, "admin"
            )
            print("✅ Admin user created")
        else:
            print("⏭️ Admin user already exists")
        
        # Check if tenant user exists
        tenant_exists = await conn.fetchval("SELECT id FROM users WHERE email = 'arjun@email.com'")
        
        if not tenant_exists:
            print("Creating tenant user...")
            tenant_hash = hash_password("demo123")
            await conn.execute(
                """
                INSERT INTO users (uid, name, email, password_hash, role, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5::user_role, NOW(), NOW())
                """,
                "tenant-001", "Arjun Sharma", "arjun@email.com", tenant_hash, "tenant"
            )
            print("✅ Tenant user created")
        else:
            print("⏭️ Tenant user already exists")
        
        print("\n🎉 Demo users ready! You can now login with:")
        print("     Admin  → admin@pgmanager.com / demo123")
        print("     Tenant → arjun@email.com / demo123")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(add_demo_users())
