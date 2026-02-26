"""
update_database_data.py — Updates database data to match Python enum values
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def update_database_data():
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
        print("=== Updating database enum definitions to match Python models ===")
        
        # First, let's add the new enum values to the database
        print("Adding 'NonAC' to room_type enum...")
        try:
            await conn.execute("ALTER TYPE room_type ADD VALUE 'NonAC'")
            print("✅ Added 'NonAC' to room_type enum")
        except Exception as e:
            if "already exists" in str(e):
                print("⏭️ 'NonAC' already exists in room_type enum")
            else:
                print(f"❌ Error adding 'NonAC': {e}")
        
        print("Adding 'rent_reminder' to message_type enum...")
        try:
            await conn.execute("ALTER TYPE message_type ADD VALUE 'rent_reminder'")
            print("✅ Added 'rent_reminder' to message_type enum")
        except Exception as e:
            if "already exists" in str(e):
                print("⏭️ 'rent_reminder' already exists in message_type enum")
            else:
                print(f"❌ Error adding 'rent_reminder': {e}")
        
        print("Adding 'holiday_notice' to message_type enum...")
        try:
            await conn.execute("ALTER TYPE message_type ADD VALUE 'holiday_notice'")
            print("✅ Added 'holiday_notice' to message_type enum")
        except Exception as e:
            if "already exists" in str(e):
                print("⏭️ 'holiday_notice' already exists in message_type enum")
            else:
                print(f"❌ Error adding 'holiday_notice': {e}")
        
        print("\n=== Updating existing data to use new enum values ===")
        
        # Update rooms data
        print("Updating rooms with 'Non-AC' to use 'NonAC'...")
        await conn.execute("UPDATE rooms SET type = 'NonAC' WHERE type = 'Non-AC'")
        updated_rooms = await conn.fetchval("SELECT COUNT(*) FROM rooms WHERE type = 'NonAC'")
        print(f"✅ Updated {updated_rooms} rooms to use 'NonAC'")
        
        # Update messages data
        print("Updating messages with 'rent-reminder' to use 'rent_reminder'...")
        await conn.execute("UPDATE messages SET type = 'rent_reminder' WHERE type = 'rent-reminder'")
        updated_rent_messages = await conn.fetchval("SELECT COUNT(*) FROM messages WHERE type = 'rent_reminder'")
        print(f"✅ Updated {updated_rent_messages} messages to use 'rent_reminder'")
        
        print("Updating messages with 'holiday-notice' to use 'holiday_notice'...")
        await conn.execute("UPDATE messages SET type = 'holiday_notice' WHERE type = 'holiday-notice'")
        updated_holiday_messages = await conn.fetchval("SELECT COUNT(*) FROM messages WHERE type = 'holiday_notice'")
        print(f"✅ Updated {updated_holiday_messages} messages to use 'holiday_notice'")
        
        print("\n=== Verification ===")
        
        # Check room types
        room_types = await conn.fetch("SELECT DISTINCT type FROM rooms")
        print("Room types in database:")
        for rt in room_types:
            print(f"  - {rt['type']}")
        
        # Check message types
        message_types = await conn.fetch("SELECT DISTINCT type FROM messages")
        print("Message types in database:")
        for mt in message_types:
            print(f"  - {mt['type']}")
        
        print("\n✅ Database data updated successfully!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(update_database_data())
