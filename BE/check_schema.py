"""
check_schema.py — Check database schema
"""
import asyncio
import asyncpg
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

async def check_schema():
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
        print("=== Database Schema ===")
        
        # Check pgs table structure
        pgs_columns = await conn.fetch("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'pgs' 
            ORDER BY ordinal_position
        """)
        
        print("\nPGS Table Columns:")
        for col in pgs_columns:
            print(f"  {col['column_name']}: {col['data_type']} ({'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'})")
        
        # Check rooms table structure
        rooms_columns = await conn.fetch("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'rooms' 
            ORDER BY ordinal_position
        """)
        
        print("\nROOMS Table Columns:")
        for col in rooms_columns:
            print(f"  {col['column_name']}: {col['data_type']} ({'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'})")
        
        # Check current data
        print("\nCurrent PG Data:")
        pgs_data = await conn.fetch("SELECT id, name, address FROM pgs LIMIT 3")
        for pg in pgs_data:
            print(f"  PG {pg['id']}: {pg['name']} - {pg['address']}")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_schema())
