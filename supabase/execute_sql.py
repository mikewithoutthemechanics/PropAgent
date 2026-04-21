#!/usr/bin/env python3
"""
Agent Loop Supabase SQL Executor
Uses psycopg2 to execute migration SQL directly
"""

import psycopg2
import ssl
import sys
from pathlib import Path

# Supabase connection details
SUPABASE_HOST = "db.sehweutpfftnrcbqshsn.supabase.co"
SUPABASE_PORT = "5432"
SUPABASE_DB = "postgres"
SUPABASE_USER = "postgres"
# Note: This is the service_role JWT, but for direct DB connection we need the DB password
# which should be obtained from Supabase Dashboard > Settings > Database
SUPABASE_PASSWORD = "your-database-password-here"  # TODO: Get from Supabase Dashboard

def execute_sql_file(filepath):
    """Execute SQL from a file"""
    # Create SSL context
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    conn = None
    try:
        print(f"Connecting to Supabase ({SUPABASE_HOST})...")
        conn = psycopg2.connect(
            host=SUPABASE_HOST,
            port=SUPABASE_PORT,
            database=SUPABASE_DB,
            user=SUPABASE_USER,
            password=SUPABASE_PASSWORD,
            sslmode="require"
        )
        
        cursor = conn.cursor()
        
        # Read SQL file
        sql = Path(filepath).read_text()
        
        print(f"Executing: {filepath}")
        cursor.execute(sql)
        conn.commit()
        
        print(f"Success! SQL executed.")
        
        # Check tables created
        cursor.execute("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        """)
        tables = cursor.fetchall()
        
        print("\nTables in database:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    finally:
        if conn:
            conn.close()
            print("\nConnection closed.")
    
    return 0

if __name__ == "__main__":
    print("Agent Loop Supabase SQL Executor")
    print("=" * 50)
    print("")
    print("NOTE: Direct database connection requires the database password")
    print("from Supabase Dashboard > Settings > Database > Connection string")
    print("")
    print("Alternatively, copy the SQL from QUICK-SETUP.sql and paste into:")
    print("https://app.supabase.com/project/sehweutpfftnrcbqshsn/sql-editor")
    print("")
