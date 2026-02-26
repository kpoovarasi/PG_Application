"""
fix_ticket_enums.py — Updates ticket enum data to match Python models
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def fix_ticket_enums():
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
        print("=== Adding underscore enum values to database ===")
        
        # Add underscore versions to ticket_status enum
        print("Adding 'in_progress' to ticket_status enum...")
        try:
            await conn.execute("ALTER TYPE ticket_status ADD VALUE 'in_progress'")
            print("✅ Added 'in_progress' to ticket_status enum")
        except Exception as e:
            if "already exists" in str(e):
                print("⏭️ 'in_progress' already exists in ticket_status enum")
            else:
                print(f"❌ Error adding 'in_progress': {e}")
        
        print("\n=== Updating ticket data to use underscore values ===")
        
        # Update tickets with hyphen status to use underscore
        print("Updating tickets with 'in-progress' to use 'in_progress'...")
        result = await conn.execute("UPDATE tickets SET status = 'in_progress' WHERE status = 'in-progress'")
        print(f"✅ Updated ticket statuses")
        
        # Check updated data
        updated_tickets = await conn.fetch("SELECT id, status FROM tickets LIMIT 10")
        print("Sample ticket statuses after update:")
        for ticket in updated_tickets:
            print(f"  Ticket {ticket['id']}: status='{ticket['status']}'")
        
        print("\n✅ Ticket enum data fixed successfully!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_ticket_enums())
