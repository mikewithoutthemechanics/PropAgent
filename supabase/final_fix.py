#!/usr/bin/env python3
import json
import os

files = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    text = raw.decode('utf-8', errors='replace')
    
    # Escape newlines inside strings
    result = []
    in_string = False
    escape = False
    
    for char in text:
        if escape:
            result.append(char)
            escape = False
            continue
            
        if char == '\\':
            result.append(char)
            escape = True
            continue
            
        if char == '"':
            in_string = not in_string
            result.append(char)
            continue
            
        if in_string and char in '\r\n':
            result.append('\\n')
        else:
            result.append(char)
    
    fixed = ''.join(result)
    
    try:
        data = json.loads(fixed)
        data['id'] = new_id
        if 'tags' in data:
            del data['tags']
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: {e}')
