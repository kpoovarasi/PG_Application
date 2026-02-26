"""
populate_realistic_data.py — Populates the database with comprehensive realistic data
"""
import asyncio
import asyncpg
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def populate_realistic_data():
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
        print("=== Populating Realistic Data ===")
        
        # 1. Update PG Properties with realistic details
        print("\n1. Updating PG Properties...")
        pg_updates = [
            (1, "Sunshine PG", "123, MG Road, Koramangala, Bangalore - 560034", 8, 6, 16, 13),
            (2, "Green Valley PG", "45, 5th Block, Koramangala, Bangalore - 560095", 6, 4, 12, 9),
            (3, "City Heights PG", "78, 14th Main, HSR Layout, Bangalore - 560102", 4, 2, 8, 5)
        ]
        
        for pg_id, name, address, total_rooms, occupied_rooms, total_beds, occupied_beds in pg_updates:
            await conn.execute("""
                UPDATE pgs SET 
                    name = $1, 
                    address = $2,
                    total_rooms = $3,
                    occupied_rooms = $4,
                    total_beds = $5,
                    occupied_beds = $6,
                    updated_at = NOW()
                WHERE id = $7
            """, name, address, total_rooms, occupied_rooms, total_beds, occupied_beds, pg_id)
            print(f"✅ Updated {name}")
        
        # 2. Update Rooms with realistic details
        print("\n2. Updating Rooms...")
        room_updates = [
            (1, 101, 1, "AC", 2, 2, 12000, "occupied"),
            (2, 102, 1, "AC", 2, 1, 12000, "occupied"),
            (3, 103, 1, "NonAC", 3, 3, 8000, "occupied"),
            (4, 201, 2, "AC", 2, 0, 13000, "available"),
            (5, 202, 2, "NonAC", 3, 2, 7500, "occupied"),
            (6, 203, 2, "NonAC", 3, 1, 7500, "occupied"),
            (7, G-101, 1, "AC", 1, 1, 15000, "occupied"),
            (8, G-102, 1, "NonAC", 2, 2, 9000, "occupied"),
            (9, C-101, 1, "AC", 2, 0, 11000, "maintenance"),
        ]
        
        for room_id, room_number, floor, room_type, capacity, occupants, rent, status in room_updates:
            await conn.execute("""
                UPDATE rooms SET 
                    room_number = $1,
                    floor = $2,
                    type = $3,
                    capacity = $4,
                    occupants = $5,
                    rent = $6,
                    status = $7,
                    updated_at = NOW()
                WHERE id = $8
            """, str(room_number), floor, room_type, capacity, occupants, rent, status, room_id)
            print(f"✅ Updated Room {room_number}")
        
        # 3. Add Room Assets
        print("\n3. Adding Room Assets...")
        assets = [
            # Room 101 Assets
            ("asset-101-1", 1, "Bed", "good", False, "Double bed with mattress"),
            ("asset-101-2", 1, "Wardrobe", "good", False, "3-door wooden wardrobe"),
            ("asset-101-3", 1, "Study Table", "fair", False, "Study table with chair"),
            ("asset-101-4", 1, "AC", "good", False, "1.5 ton split AC"),
            
            # Room 102 Assets  
            ("asset-102-1", 2, "Bed", "good", False, "Double bed with mattress"),
            ("asset-102-2", 2, "Wardrobe", "good", False, "3-door wooden wardrobe"),
            ("asset-102-3", 2, "Study Table", "good", False, "Study table with chair"),
            ("asset-102-4", 2, "AC", "good", False, "1.5 ton split AC"),
            
            # Room 103 Assets
            ("asset-103-1", 3, "Bed", "fair", False, "Triple bunk bed"),
            ("asset-103-2", 3, "Wardrobe", "needs-repair", False, "3-door wardrobe with broken lock"),
            ("asset-103-3", 3, "Study Table", "fair", False, "Large study table"),
            
            # Common Assets
            ("common-1", None, "WiFi Router", "good", True, "High-speed WiFi router"),
            ("common-2", None, "Refrigerator", "good", True, "Double door refrigerator"),
            ("common-3", None, "Washing Machine", "fair", True, "Fully automatic washing machine"),
            ("common-4", None, "TV", "good", True, "43 inch Smart TV"),
            ("common-5", None, "Water Purifier", "good", True, "RO water purifier"),
        ]
        
        for asset_uid, room_id, name, condition, is_common, description in assets:
            # Check if asset exists
            existing = await conn.fetchrow("SELECT id FROM room_assets WHERE uid = $1", asset_uid)
            if not existing:
                await conn.execute("""
                    INSERT INTO room_assets (uid, room_id, name, condition, is_common, description, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW())
                """, asset_uid, room_id, name, condition, is_common, description)
                print(f"✅ Added Asset: {name}")
        
        # 4. Update Tenant Profiles
        print("\n4. Updating Tenant Profiles...")
        tenant_updates = [
            (7, "Arjun Sharma", "arjun@email.com", "+91 98765 43210", 1, "monthly", "2024-06-15", 12000, 24000, "+91 98765 43211", "Aadhaar - XXXX-XXXX-1234", "active", "TEN-2024-001", 13),
            (8, "Priya Patel", "priya@email.com", "+91 87654 32109", 2, "monthly", "2024-08-01", 12000, 24000, "+91 87654 32100", "Aadhaar - XXXX-XXXX-5678", "active", "TEN-2024-002", 3),
            (9, "Vikram Singh", "vikram@email.com", "+91 76543 21098", 3, "monthly", "2024-03-10", 8000, 16000, "+91 76543 21099", "PAN - ABCDE1234F", "active", "TEN-2024-003", 4),
            (10, "Neha Gupta", "neha@email.com", "+91 65432 10987", 6, "daily", "2025-01-20", 800, 5000, "+91 65432 10988", "Passport - J1234567", "active", "TEN-2024-004", 5),
            (11, "Rahul Verma", "rahul@email.com", "+91 54321 09876", 5, "monthly", "2024-11-01", 7500, 15000, "+91 54321 09877", "Aadhaar - XXXX-XXXX-9012", "active", "TEN-2024-005", 6),
            (12, "Anjali Rao", "anjali@email.com", "+91 43210 98765", 7, "monthly", "2023-09-15", 9000, 18000, "+91 43210 98766", "Aadhaar - XXXX-XXXX-3456", "inactive", "TEN-2023-010", 7),
        ]
        
        for tenant_id, name, email, phone, room_id, stay_type, join_date, rent_amount, security_deposit, emergency_contact, id_proof, status, tenant_code, user_id in tenant_updates:
            await conn.execute("""
                UPDATE tenants SET 
                    name = $1,
                    email = $2,
                    phone = $3,
                    room_id = $4,
                    stay_type = $5,
                    join_date = $6,
                    rent_amount = $7,
                    security_deposit = $8,
                    emergency_contact = $9,
                    id_proof = $10,
                    status = $11,
                    tenant_code = $12,
                    user_id = $13,
                    updated_at = NOW()
                WHERE id = $14
            """, name, email, phone, room_id, stay_type, join_date, rent_amount, security_deposit, emergency_contact, id_proof, status, tenant_code, user_id, tenant_id)
            print(f"✅ Updated Tenant: {name}")
        
        # 5. Add Realistic Messages
        print("\n5. Adding Realistic Messages...")
        messages = [
            ("msg-7", 1, "rent_reminder", "Rent Due - March 2026", "Dear Tenants, this is a reminder that rent for March 2026 is due by the 5th. Please ensure timely payment to avoid late fees. Payment methods: UPI, Bank Transfer, or Cash at office.", True, None, "2026-03-01 09:00:00"),
            ("msg-8", 1, "announcement", "New Housekeeping Schedule", "Effective from next week, housekeeping will be done daily from 11 AM to 2 PM. Please ensure your rooms are accessible during this time. Thank you for your cooperation.", True, None, "2026-02-26 16:30:00"),
            ("msg-9", 1, "holiday_notice", "Weekend Maintenance", "This weekend (Feb 28-29), we will be conducting maintenance work on the water tank and electrical systems. Water supply may be interrupted from 9 AM to 5 PM on Saturday. Please store water in advance.", True, None, "2026-02-24 14:00:00"),
            ("msg-10", 1, "announcement", "New Security Measures", "For enhanced security, we've installed new CCTV cameras at all entry points. Also, please ensure you carry your access cards at all times. Visitors must be registered at the security desk.", True, None, "2026-02-20 10:00:00"),
            ("msg-11", 1, "rent_reminder", "Late Payment Notice", "Attention: Several tenants have outstanding rent payments for January 2026. Please clear your dues immediately to avoid penalty charges and potential legal action.", False, [7, 8, 9], "2026-02-15 11:00:00"),
        ]
        
        for msg_uid, sent_by, msg_type, title, content, sent_to_all, recipient_uids, sent_at in messages:
            existing = await conn.fetchrow("SELECT id FROM messages WHERE uid = $1", msg_uid)
            if not existing:
                await conn.execute("""
                    INSERT INTO messages (uid, sent_by, type, title, content, sent_to_all, recipient_uids, sent_at, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                """, msg_uid, sent_by, msg_type, title, content, sent_to_all, recipient_uids, sent_at)
                print(f"✅ Added Message: {title}")
        
        # 6. Add Comprehensive Tickets
        print("\n6. Adding Comprehensive Tickets...")
        tickets = [
            ("tkt-7", 7, 1, "electrical", "Power outage in room", "Room 101 experienced frequent power cuts yesterday. The circuit breaker seems to be faulty. Please check the electrical wiring.", "open", "high", "2026-02-26 08:30:00"),
            ("tkt-8", 8, 2, "plumbing", "Low water pressure", "Water pressure in the bathroom tap is very low. Takes forever to fill a bucket. Other rooms seem to have normal pressure.", "in-progress", "medium", "2026-02-25 19:45:00"),
            ("tkt-9", 9, 3, "wifi", "WiFi not working", "WiFi connection keeps disconnecting. Unable to work from home. Other tenants in the same floor are facing similar issues.", "resolved", "high", "2026-02-24 14:20:00", "2026-02-25 10:30:00"),
            ("tkt-10", 10, 6, "furniture", "Broken chair", "One of the dining chairs in the common area is broken. Someone might get hurt if they sit on it.", "closed", "low", "2026-02-23 12:15:00", "2026-02-24 16:45:00"),
            ("tkt-11", 11, 5, "cleaning", "Garbage not collected", "Garbage in the common area hasn't been collected for 2 days. It's starting to smell and attract insects.", "in-progress", "medium", "2026-02-22 09:00:00"),
            ("tkt-12", 7, 1, "other", "Noise complaint", "The tenants in room 102 play loud music after 11 PM. This has been happening for the past week. Please address this issue.", "open", "medium", "2026-02-21 23:30:00"),
        ]
        
        for ticket_uid, tenant_id, room_id, category, subject, description, status, priority, created_at, resolved_at in tickets:
            existing = await conn.fetchrow("SELECT id FROM tickets WHERE uid = $1", ticket_uid)
            if not existing:
                resolved_at = resolved_at if len(tickets) > 8 and 'resolved_at' in locals() else None
                await conn.execute("""
                    INSERT INTO tickets (uid, tenant_id, room_id, category, subject, description, status, priority, created_at, updated_at, resolved_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                """, ticket_uid, tenant_id, room_id, category, subject, description, status, priority, created_at, created_at, resolved_at)
                print(f"✅ Added Ticket: {subject}")
        
        print("\n✅ All realistic data populated successfully!")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(populate_realistic_data())
