#!/usr/bin/env python3
"""Test n8n workflows end-to-end"""
import requests
import json

SUPABASE_URL = "https://sehweutpfftnrcbqshsn.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHdldXRwZmZ0bnJjYnFzaHNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDIzMjA4MiwiZXhwIjoyMDg5ODA4MDgyfQ.54tz36tsY--7WPVj4uKC3Ag7FebBAz0uTU3psyhJI10"
N8N_URL = "http://localhost:5678"

print("Testing n8n Workflows")
print("=" * 60)

# Test 1: Tenant Inquiry
print("\nTest 1: Tenant Inquiry Auto-Responder")
print("-" * 60)
try:
    response = requests.post(
        f"{N8N_URL}/webhook/whatsapp-inquiry",
        json={"from": "27831234567", "body": "Is property available?", "timestamp": "2026-03-23T10:00:00Z"},
        timeout=30
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

# Test 2: Property Description
print("\nTest 2: Property Description Generator")
print("-" * 60)
try:
    response = requests.post(
        f"{N8N_URL}/webhook/generate-description",
        json={"features": {"bedrooms": 3, "bathrooms": 2}, "style": "modern", "tone": "professional"},
        timeout=30
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")

# Check n8n health
print("\nChecking n8n health...")
try:
    response = requests.get(f"{N8N_URL}/healthz", timeout=5)
    print(f"n8n Health: {response.status_code}")
except Exception as e:
    print(f"n8n Health Check Error: {e}")
