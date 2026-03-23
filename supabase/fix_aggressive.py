#!/usr/bin/env python3
"""Aggressive fix for remaining JSON files"""
import json
import os

files = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    # Read as binary
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Replace all control characters with space, except in escaped sequences
    cleaned_bytes = bytearray()
    i = 0
    while i < len(raw):
        b = raw[i]
        
        # Check for escaped sequences (\\n, \\r, \\t)
        if b == ord('\\') and i + 1 < len(raw):
            next_b = raw[i + 1]
            if next_b in (ord('n'), ord('r'), ord('t'), ord('\\'), ord('"')):
                cleaned_bytes.extend(raw[i:i+2])
                i += 2
                continue
        
        # Replace control chars with space
        if b < 32:
            cleaned_bytes.append(ord(' '))
        else:
            cleaned_bytes.append(b)
        i += 1
    
    try:
        text = cleaned_bytes.decode('utf-8')
        data = json.loads(text)
        data['id'] = new_id
        if 'tags' in data:
            del data['tags']
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED (aggressive)')
    except Exception as e:
        print(f'{filename}: {e}')
