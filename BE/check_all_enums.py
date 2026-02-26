"""
check_all_enums.py — Checks all enum definitions in database vs Python models
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def check_all_enums():
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
        print("=== Checking all database enum definitions ===")
        
        # Check all relevant enums
        enums_to_check = [
            'user_role',
            'room_type', 
            'room_status',
            'asset_condition',
            'stay_type',
            'tenant_status',
            'message_type',
            'invoice_status',
            'ticket_category',
            'ticket_status',
            'ticket_priority'
        ]
        
        for enum_name in enums_to_check:
            try:
                enum_values = await conn.fetch(f"SELECT unnest(enum_range(NULL::{enum_name}))")
                print(f"\n{enum_name} enum values:")
                for value in enum_values:
                    print(f"  '{value['unnest']}'")
            except Exception as e:
                print(f"\n{enum_name}: ERROR - {e}")
        
        print("\n=== Checking current data in tickets table ===")
        try:
            tickets = await conn.fetch("SELECT id, status FROM tickets LIMIT 5")
            print("Sample ticket statuses:")
            for ticket in tickets:
                print(f"  Ticket {ticket['id']}: status='{ticket['status']}'")
        except Exception as e:
            print(f"Error checking tickets: {e}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_all_enums())
