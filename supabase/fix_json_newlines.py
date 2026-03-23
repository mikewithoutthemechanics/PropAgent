#!/usr/bin/env python3
"""Fix JSON files with unescaped newlines inside strings"""

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
    
    # Decode with replacement for invalid UTF-8
    text = raw.decode('utf-8', errors='replace')
    
    # Replace replacement character
    text = text.replace('\ufffd', '')
    
    # The issue is literal newlines/carriage returns inside JSON strings
    # We need to escape them properly
    
    # Pattern: find strings and escape newlines within them
    def escape_newlines_in_string(match):
        s = match.group(0)
        # Replace literal newlines/carriage returns with escaped versions
        s = s.replace('\r\n', '\\n')
        s = s.replace('\r', '\\n')
        s = s.replace('\n', '\\n')
        return s
    
    # Match JSON strings (simplified pattern)
    # This pattern looks for "..." but not \"
    result = []
    in_string = False
    escape_next = False
    
    for char in text:
        if escape_next:
            result.append(char)
            escape_next = False
            continue
            
        if char == '\\':
            result.append(char)
            escape_next = True
            continue
            
        if char == '"':
            in_string = not in_string
            result.append(char)
            continue
            
        if in_string and char in '\r\n':
            # Replace newline with \n
            result.append('\\n')
        else:
            result.append(char)
    
    cleaned_text = ''.join(result)
    
    try:
        data = json.loads(cleaned_text)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: FAILED - {e}')
        # Try to show where error is
        try:
            json.loads(cleaned_text)
        except json.JSONDecodeError as je:
            print(f'  Error at line {je.lineno}, col {je.colno}')
            lines = cleaned_text.split('\n')
            if je.lineno <= len(lines):
                print(f'  Content: {repr(lines[je.lineno-1])}')
