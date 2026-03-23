#!/usr/bin/env python3
"""
Fix JSON files with literal newlines inside strings.
These occur in JavaScript code nodes where the code has actual line breaks.
"""
import json
import os

files_to_fix = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('19-property-price-recommendation.json', 'price-rec-19-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files_to_fix:
    filepath = os.path.join('n8n-workflows', filename)
    
    # Read as binary to preserve exact bytes
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Decode with replacement for invalid sequences
    text = raw.decode('utf-8', errors='replace')
    text = text.replace('\ufffd', '')
    
    # The issue is literal \r\n inside JSON strings
    # We need to escape these properly
    
    result = []
    in_string = False
    escape_next = False
    
    i = 0
    while i < len(text):
        char = text[i]
        
        if escape_next:
            result.append(char)
            escape_next = False
            i += 1
            continue
        
        if char == '\\':
            result.append(char)
            escape_next = True
            i += 1
            continue
        
        if char == '"':
            in_string = not in_string
            result.append(char)
            i += 1
            continue
        
        if in_string:
            if char == '\r':
                # Check if next is \n
                if i + 1 < len(text) and text[i + 1] == '\n':
                    result.append('\\n')
                    i += 2  # Skip both \r and \n
                else:
                    result.append('\\n')
                    i += 1
            elif char == '\n':
                result.append('\\n')
                i += 1
            else:
                result.append(char)
                i += 1
        else:
            result.append(char)
            i += 1
    
    cleaned_text = ''.join(result)
    
    try:
        data = json.loads(cleaned_text)
        
        # Assign new ID
        data['id'] = new_id
        
        # Remove tags if present
        if 'tags' in data:
            del data['tags']
        
        # Save
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: FAILED - {e}')
        # Save cleaned version for debugging
        debug_path = filepath + '.debug'
        with open(debug_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_text)
        print(f'  Saved debug version to {debug_path}')
