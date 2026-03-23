#!/usr/bin/env python3
"""Fix JSON files with control character issues"""

import json
import re
import os

files = [
    '11-property-matching-engine.json',
    '13-rent-collection-followup.json',
    '19-property-price-recommendation.json',
    '21-expense-categorization.json'
]

for filename in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Method 1: Remove all control chars except \t, \n, \r
    cleaned = bytearray()
    for b in raw:
        if b >= 32 or b in (9, 10, 13):  # Keep printable + tab/LF/CR
            cleaned.append(b)
    
    try:
        data = json.loads(cleaned.decode('utf-8'))
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED (method 1)')
        continue
    except:
        pass
    
    # Method 2: More aggressive - try to extract just valid text
    try:
        text = raw.decode('utf-8', errors='ignore')
        # Remove all control characters
        text = ''.join(c for c in text if ord(c) >= 32 or c in '\t\n\r')
        data = json.loads(text)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED (method 2)')
        continue
    except Exception as e:
        print(f'{filename}: FAILED - {e}')
