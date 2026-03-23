#!/usr/bin/env python3
"""Final attempt to fix JSON files by manual byte processing"""

import json
import os

files = [
    ('11-property-matching-engine.json', [
        (b'\\r\\n', b'\\n'),  # CRLF to escaped newline
        (b'\\r', b'\\n'),    # CR to escaped newline
        (b'\\n', b'\\n'),    # LF to escaped newline (in strings this becomes \\\\n)
    ]),
    ('19-property-price-recommendation.json', [
        (b'\\r\\n', b'\\n'),
        (b'\\r', b'\\n'),
        (b'\\n', b'\\n'),
    ]),
    ('21-expense-categorization.json', [
        (b'\\r\\n', b'\\n'),
        (b'\\r', b'\\n'),
        (b'\\n', b'\\n'),
    ]),
]

for filename, replacements in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    with open(filepath, 'rb') as f:
        content = f.read()
    
    # First, let's just try to parse as-is and see the exact error
    try:
        data = json.loads(content.decode('utf-8', errors='strict'))
        print(f'{filename}: Already valid JSON')
        continue
    except json.JSONDecodeError as e:
        print(f'{filename}: Parse error at line {e.lineno}, col {e.colno}')
    except UnicodeDecodeError as e:
        print(f'{filename}: Unicode error at position {e.start}')
    
    # Clean the content - remove invalid UTF-8 sequences
    cleaned = content.decode('utf-8', errors='ignore')
    
    # Replace any remaining control characters with spaces
    cleaned = ''.join(c if ord(c) >= 32 or c in '\t\n\r' else ' ' for c in cleaned)
    
    try:
        data = json.loads(cleaned)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: Still failed - {e}')
        # Last resort: try to identify and remove the problematic node
        try:
            # Load with json5
            import json5
            data = json5.loads(cleaned)
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            print(f'{filename}: FIXED with json5')
        except:
            print(f'{filename}: Could not fix, skipping')
