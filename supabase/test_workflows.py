#!/usr/bin/env python3
"""Test n8n workflows end-to-end"""
import requests
import json

SUPABASE_URL = "https://sehweutpfftnrcbqshsn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHdldXRwZmZ0bnJjYnFzaHNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDIzMjA4MiwiZXhwIjoyMDg5ODA4MDgyfQ.54tz36tsY--7WPVj4uKC3Ag7FebBAz0uTU3psyhJI10"
N8N_URL = "http://localhost:5678"

def test_workflow(name, webhook_path, payload, table_name=None):
    """Test a workflow by sending webhook and checking Supabase"""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"Webhook: {webhook_path}")
    
    # Send webhook
    try:
        response = requests.post(
            f"{N8N_URL}/webhook/{webhook_path}",
            json=payload,
            timeout=30
        )
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text[:200] if response.text else '(empty)'}")
    except Exception as e:
        print(f"Webhook Error: {e}")
        return False
    
    # Check Supabase if table specified
    if table_name:
        try:
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
            response = requests.get(
                f"{SUPABASE_URL}/rest/v1/{table_name}?select=*&order=created_at.desc&limit=1",
                headers=headers
            )
            if response.status_code == 200:
                data = response.json()
                print(f"Supabase Check: ✓ Table '{table_name}' accessible")
                if data:
                    print(f"Latest record ID: {data[0].get('id', 'N/A')[:20]}...")
            else:
                print(f"Supabase Check: ✗ Error {response.status_code}")
        except Exception as e:
            print(f"Supabase Error: {e}")
    
    return True

# Test workflows
print("Starting End-to-End Workflow Tests")
print("=" * 60)

# Test 1: Tenant Inquiry (04)
test_workflow(
    "04 - Tenant Inquiry Auto-Responder",
    "whatsapp-inquiry",
    {
        "from": "27831234567",
        "body": "Hi, is the Sandton property still available?",
        "timestamp": "2026-03-23T10:00:00Z",
        "name": "Test User"
    },
    "inquiries"
)

# Test 2: Property Description Generator (06)
test_workflow(
    "06 - Property Description Generator",
    "generate-description",
    {
        "features": {"bedrooms": 3, "bathrooms": 2, "garage": True, "pool": False},
        "style": "modern",
        "tone": "professional"
    },
    "property_descriptions"
)

print("\n" + "=" * 60)
print("Tests Complete")
