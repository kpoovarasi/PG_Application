"""
debug_auth.py — Debug authentication issues
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os
from auth import verify_password, hash_password

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def debug_auth():
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
        # Check all users
        users = await conn.fetch("SELECT id, email, password_hash, role FROM users")
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"  - {user['email']} (role: {user['role']})")
            print(f"    Password hash: {user['password_hash'][:50]}...")
        
        # Test admin login
        print("\n=== Testing Admin Login ===")
        admin_user = await conn.fetchrow("SELECT * FROM users WHERE email = 'admin@pgmanager.com'")
        if admin_user:
            print(f"Admin user found: {admin_user['email']}")
            print(f"Password hash: {admin_user['password_hash']}")
            
            # Test password verification
            test_password = "demo123"
            is_valid = verify_password(test_password, admin_user['password_hash'])
            print(f"Password verification result: {is_valid}")
            
            if not is_valid:
                print("Password verification failed. Let's try updating the hash...")
                new_hash = hash_password(test_password)
                print(f"New hash: {new_hash}")
                
                # Update the password
                await conn.execute(
                    "UPDATE users SET password_hash = $1 WHERE email = $2",
                    new_hash, "admin@pgmanager.com"
                )
                print("Password hash updated")
                
                # Test again
                updated_user = await conn.fetchrow("SELECT password_hash FROM users WHERE email = 'admin@pgmanager.com'")
                is_valid_now = verify_password(test_password, updated_user['password_hash'])
                print(f"Password verification after update: {is_valid_now}")
        else:
            print("Admin user not found!")
        
        # Test tenant login
        print("\n=== Testing Tenant Login ===")
        tenant_user = await conn.fetchrow("SELECT * FROM users WHERE email = 'arjun@email.com'")
        if tenant_user:
            print(f"Tenant user found: {tenant_user['email']}")
            print(f"Password hash: {tenant_user['password_hash']}")
            
            # Test password verification
            test_password = "demo123"
            is_valid = verify_password(test_password, tenant_user['password_hash'])
            print(f"Password verification result: {is_valid}")
            
            if not is_valid:
                print("Password verification failed. Let's try updating the hash...")
                new_hash = hash_password(test_password)
                print(f"New hash: {new_hash}")
                
                # Update the password
                await conn.execute(
                    "UPDATE users SET password_hash = $1 WHERE email = $2",
                    new_hash, "arjun@email.com"
                )
                print("Password hash updated")
                
                # Test again
                updated_user = await conn.fetchrow("SELECT password_hash FROM users WHERE email = 'arjun@email.com'")
                is_valid_now = verify_password(test_password, updated_user['password_hash'])
                print(f"Password verification after update: {is_valid_now}")
        else:
            print("Tenant user not found!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(debug_auth())
