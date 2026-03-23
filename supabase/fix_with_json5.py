#!/usr/bin/env python3
"""Fix JSON files with json5 parser which is more lenient"""
import json5
import json
import os
import re

files_to_fix = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('19-property-price-recommendation.json', 'price-rec-19-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files_to_fix:
    filepath = os.path.join('n8n-workflows', filename)
    
    # Read file
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Remove replacement characters
    content = content.replace('\ufffd', '')
    
    try:
        # Parse with json5 (more lenient)
        data = json5.loads(content)
        
        # Assign new ID
        data['id'] = new_id
        
        # Remove tags if present
        if 'tags' in data:
            del data['tags']
        
        # Save as proper JSON
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f'{filename}: FIXED with json5')
    except Exception as e:
        print(f'{filename}: FAILED - {e}')
        # Show more details
        try:
            json5.loads(content)
        except Exception as e2:
            print(f'  Error details: {e2}')
