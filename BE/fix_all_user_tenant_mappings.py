"""
fix_all_user_tenant_mappings.py — Fix all user-tenant relationships
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def fix_all_user_tenant_mappings():
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
        print("=== Fixing All User-Tenant Mappings ===")
        
        # Get all tenant users
        tenant_users = await conn.fetch("SELECT id, email, name FROM users WHERE role = 'tenant'")
        tenants = await conn.fetch("SELECT id, name, email, user_id FROM tenants")
        
        fixes_made = 0
        
        for user in tenant_users:
            user_email = user['email']
            user_id = user['id']
            
            # Find corresponding tenant
            tenant = await conn.fetchrow("SELECT id, user_id FROM tenants WHERE email = $1", user_email)
            
            if tenant:
                if tenant['user_id'] != user_id:
                    print(f"Fixing {user_email}: User ID {user_id} -> Tenant User ID {tenant['user_id']}")
                    await conn.execute(
                        "UPDATE tenants SET user_id = $1 WHERE email = $2",
                        user_id, user_email
                    )
                    fixes_made += 1
                else:
                    print(f"✅ {user_email}: IDs already match")
            else:
                print(f"⚠️  No tenant found for user {user_email}")
        
        print(f"\n✅ Fixed {fixes_made} user-tenant mappings!")
        
        # Verify fixes
        print("\n=== Verification ===")
        updated_tenants = await conn.fetch("SELECT t.name, t.email, t.user_id as tenant_user_id, u.id as user_id FROM tenants t JOIN users u ON t.email = u.email WHERE u.role = 'tenant'")
        for tenant in updated_tenants:
            status = "✅" if tenant['tenant_user_id'] == tenant['user_id'] else "❌"
            print(f"{status} {tenant['email']}: User ID {tenant['user_id']}, Tenant User ID {tenant['tenant_user_id']}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_all_user_tenant_mappings())
