"""
check_user_tenant_mapping.py — Check user-tenant relationships
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def check_user_tenant_mapping():
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
        print("=== Checking Users Table ===")
        users = await conn.fetch("SELECT id, email, name, role FROM users WHERE role = 'tenant'")
        for user in users:
            print(f"User ID: {user['id']}, Email: {user['email']}, Name: {user['name']}")
        
        print("\n=== Checking Tenants Table ===")
        tenants = await conn.fetch("SELECT id, name, email, user_id FROM tenants")
        for tenant in tenants:
            print(f"Tenant ID: {tenant['id']}, Name: {tenant['name']}, Email: {tenant['email']}, User ID: {tenant['user_id']}")
        
        print("\n=== Checking Mismatches ===")
        # Find users and tenants by email to see relationships
        arjun_user = await conn.fetchrow("SELECT id, email, name FROM users WHERE email = 'arjun@email.com'")
        arjun_tenant = await conn.fetchrow("SELECT id, name, email, user_id FROM tenants WHERE email = 'arjun@email.com'")
        
        if arjun_user and arjun_tenant:
            print(f"Arjun - User ID: {arjun_user['id']}, Tenant User ID: {arjun_tenant['user_id']}")
            if arjun_user['id'] != arjun_tenant['user_id']:
                print("❌ MISMATCH FOUND!")
                print("Fixing tenant user_id to match user table...")
                await conn.execute(
                    "UPDATE tenants SET user_id = $1 WHERE email = 'arjun@email.com'",
                    arjun_user['id']
                )
                print("✅ Fixed!")
            else:
                print("✅ IDs match")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_user_tenant_mapping())
