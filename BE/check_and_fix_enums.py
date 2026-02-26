"""
check_and_fix_enums.py — Checks and fixes enum definitions in database
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def check_and_fix_enums():
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
        print("=== Checking current enum definitions ===")
        
        # Check room_type enum
        room_type_enum = await conn.fetch("SELECT unnest(enum_range(NULL::room_type))")
        print("room_type enum values:")
        for value in room_type_enum:
            print(f"  '{value['unnest']}'")
        
        # Check message_type enum
        message_type_enum = await conn.fetch("SELECT unnest(enum_range(NULL::message_type))")
        print("\nmessage_type enum values:")
        for value in message_type_enum:
            print(f"  '{value['unnest']}'")
        
        print("\n=== Updating Python models to match database enum values ===")
        
        # Update RoomTypeEnum in models.py to match database
        print("Updating RoomTypeEnum to use 'Non-AC' instead of 'NonAC'")
        
        # Read current models.py
        with open('models.py', 'r') as f:
            content = f.read()
        
        # Replace NonAC with Non-AC
        updated_content = content.replace('NonAC = "NonAC"', 'NonAC = "Non-AC"')
        
        with open('models.py', 'w') as f:
            f.write(updated_content)
        
        print("Updated RoomTypeEnum in models.py")
        
        # Update MessageTypeEnum in models.py to match database
        print("Updating MessageTypeEnum to use 'holiday-notice' instead of 'holiday_notice'")
        
        # Read current models.py again
        with open('models.py', 'r') as f:
            content = f.read()
        
        # Replace enum values
        updated_content = content.replace('rent_reminder = "rent_reminder"', 'rent_reminder = "rent-reminder"')
        updated_content = updated_content.replace('holiday_notice = "holiday_notice"', 'holiday_notice = "holiday-notice"')
        
        with open('models.py', 'w') as f:
            f.write(updated_content)
        
        print("Updated MessageTypeEnum in models.py")
        
        print("\n✅ Python models updated to match database enum values!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_and_fix_enums())
