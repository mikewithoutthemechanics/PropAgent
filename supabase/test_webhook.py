#!/usr/bin/env python3
"""Test webhooks directly"""
import requests
import json
import time

N8N_URL = "http://localhost:5678"

# Test 1: whatsapp-inquiry (04)
print("Test 1: POST /webhook/whatsapp-inquiry")
resp = requests.post(
    f"{N8N_URL}/webhook/whatsapp-inquiry",
    json={"from": "27831234567", "body": "Is property available?", "timestamp": "2026-03-23T12:00:00Z"}
)
print(f"  Status: {resp.status_code}")
print(f"  Response: {resp.text}")

# Test 2: generate-description (06) 
print("\nTest 2: POST /webhook/generate-description")
resp = requests.post(
    f"{N8N_URL}/webhook/generate-description",
    json={"features": {"bedrooms": 3, "bathrooms": 2}, "style": "modern", "tone": "professional"}
)
print(f"  Status: {resp.status_code}")
print(f"  Response: {resp.text}")

# Test 3: new-lead (07)
print("\nTest 3: POST /webhook/new-lead")
resp = requests.post(
    f"{N8N_URL}/webhook/new-lead",
    json={"name": "John Doe", "email": "john@test.com", "phone": "27831234567", "budget": 15000}
)
print(f"  Status: {resp.status_code}")
print(f"  Response: {resp.text}")

# Test 4: email-received (08)
print("\nTest 4: POST /webhook/email-received")
resp = requests.post(
    f"{N8N_URL}/webhook/email-received",
    json={"from": "test@example.com", "subject": "Property inquiry", "body": "Hi, I'm interested in your listing"}
)
print(f"  Status: {resp.status_code}")
print(f"  Response: {resp.text}")

# Test 5: maintenance-request (09)
print("\nTest 5: POST /webhook/maintenance-request")
resp = requests.post(
    f"{N8N_URL}/webhook/maintenance-request",
    json={"tenant_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "issue": "Leaking tap", "urgency": "high"}
)
print(f"  Status: {resp.status_code}")
print(f"  Response: {resp.text}")

# Wait for processing
print("\nWaiting 5 seconds for workflow execution...")
time.sleep(5)
print("Done!")
