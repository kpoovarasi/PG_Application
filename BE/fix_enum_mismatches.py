"""
fix_enum_mismatches.py — Fixes enum value mismatches in database
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def fix_enum_mismatches():
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
        print("=== Fixing RoomTypeEnum mismatches ===")
        
        # Check current room types
        rooms = await conn.fetch("SELECT id, room_number, type FROM rooms")
        print(f"Found {len(rooms)} rooms")
        
        for room in rooms:
            room_id = room['id']
            room_number = room['room_number']
            current_type = room['type']
            print(f"Room {room_number} has type: {current_type}")
            
            if current_type == 'Non-AC':
                print(f"  Updating room {room_number} type from 'Non-AC' to 'NonAC'")
                await conn.execute(
                    "UPDATE rooms SET type = $1 WHERE id = $2",
                    'NonAC', room_id
                )
        
        print("\n=== Fixing MessageTypeEnum mismatches ===")
        
        # Check current message types
        messages = await conn.fetch("SELECT id, type FROM messages")
        print(f"Found {len(messages)} messages")
        
        for message in messages:
            message_id = message['id']
            current_type = message['type']
            print(f"Message {message_id} has type: {current_type}")
            
            if current_type == 'holiday-notice':
                print(f"  Updating message {message_id} type from 'holiday-notice' to 'holiday_notice'")
                await conn.execute(
                    "UPDATE messages SET type = $1 WHERE id = $2",
                    'holiday_notice', message_id
                )
            elif current_type == 'rent-reminder':
                print(f"  Updating message {message_id} type from 'rent-reminder' to 'rent_reminder'")
                await conn.execute(
                    "UPDATE messages SET type = $1 WHERE id = $2",
                    'rent_reminder', message_id
                )
        
        print("\n✅ Enum mismatches fixed successfully!")
        
        # Verify fixes
        print("\n=== Verification ===")
        
        # Check room types
        updated_rooms = await conn.fetch("SELECT room_number, type FROM rooms")
        print("Room types after fix:")
        for room in updated_rooms:
            print(f"  {room['room_number']}: {room['type']}")
        
        # Check message types
        updated_messages = await conn.fetch("SELECT id, type FROM messages")
        print("Message types after fix:")
        for message in updated_messages:
            print(f"  {message['id']}: {message['type']}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_enum_mismatches())
