#!/usr/bin/env python3
"""
Execute Supabase SQL via REST API
Uses stored procedure approach
"""

import requests
import json
import sys
from pathlib import Path

SUPABASE_URL = "https://sehweutpfftnrcbqshsn.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHdldXRwZmZ0bnJjYnFzaHNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDIzMjA4MiwiZXhwIjoyMDg5ODA4MDgyfQ.54tz36tsY--7WPVj4uKC3Ag7FebBAz0uTU3psyhJI10"

def exec_sql(sql):
    """Execute SQL via the exec_sql RPC function"""
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "params=single-object"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    payload = {"query": sql}
    
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 404:
        # exec_sql function doesn't exist
        return False, "exec_sql function not found"
    
    if response.status_code >= 400:
        return False, f"HTTP {response.status_code}: {response.text}"
    
    return True, response.text

def create_exec_sql_function():
    """Create the exec_sql helper function"""
    sql = """
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
"""
    return exec_sql(sql)

def split_sql_statements(sql):
    """Split SQL file into individual statements"""
    # Simple split on semicolons (may not handle all edge cases)
    statements = []
    current = ""
    
    for line in sql.split('\n'):
        line = line.strip()
        
        # Skip comments and empty lines
        if not line or line.startswith('--'):
            continue
            
        current += line + "\n"
        
        if line.endswith(';'):
            statements.append(current.strip())
            current = ""
    
    return statements

def execute_sql_file(filepath):
    """Execute SQL file via API"""
    print(f"Reading SQL file: {filepath}")
    sql = Path(filepath).read_text()
    
    # First, try to create exec_sql function
    print("Creating exec_sql helper function...")
    success, result = create_exec_sql_function()
    
    if not success:
        print(f"Could not create exec_sql function: {result}")
        print("\n" + "="*60)
        print("ALTERNATIVE: Copy this SQL to Supabase SQL Editor:")
        print("="*60)
        print(sql)
        print("="*60)
        return 1
    
    print("exec_sql function ready!")
    
    # Execute SQL statements
    statements = split_sql_statements(sql)
    print(f"Executing {len(statements)} SQL statements...")
    
    for i, stmt in enumerate(statements, 1):
        if not stmt.strip():
            continue
        print(f"  [{i}/{len(statements)}] Executing...", end=" ")
        success, result = exec_sql(stmt)
        if success:
            print("OK")
        else:
            print(f"ERROR: {result}")
    
    print("\nDone!")
    return 0

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sql_file = Path(__file__).parent / "QUICK-SETUP.sql"
    else:
        sql_file = sys.argv[1]
    
    sys.exit(execute_sql_file(sql_file))
