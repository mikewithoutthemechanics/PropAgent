#!/usr/bin/env python3
"""
Simple fix: Replace CRLF with actual escaped newlines in strings
"""
import json
import os

files = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    # Read as text, replacing CRLF with nothing (remove them)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Simple approach: replace all \r\n with nothing inside the file
    # This will join lines together but should create valid JSON
    content = content.replace('\r\n', '\n')
    
    # Now split by lines and reconstruct
    lines = content.split('\n')
    
    # Join all lines with spaces to create single line JSON
    single_line = ' '.join(lines)
    
    # Fix double spaces
    single_line = ' '.join(single_line.split())
    
    # Fix spaces after/before JSON punctuation
    single_line = single_line.replace('{ ', '{').replace(' }', '}')
    single_line = single_line.replace('[ ', '[').replace(' ]', ']')
    single_line = single_line.replace(': ', ':').replace(', ', ',')
    single_line = single_line.replace('" :', '":').replace('" ,', '",')
    
    # Restore proper spacing after colons and commas in JSON
    single_line = single_line.replace('":', '": ').replace('",', '", ')
    
    try:
        data = json.loads(single_line)
        data['id'] = new_id
        if 'tags' in data:
            del data['tags']
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: {e}')
