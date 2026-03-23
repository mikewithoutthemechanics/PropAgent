#!/usr/bin/env python3
"""
Fix complex workflow JSON files with multiline JavaScript code.
The issue is that jsCode fields contain actual newlines which breaks JSON parsing.
"""
import json
import os

files = [
    ('11-property-matching-engine.json', 'matching-engine-11-xxxx-yyyy-zzzz-111122223333'),
    ('19-property-price-recommendation.json', 'price-rec-19-xxxx-yyyy-zzzz-111122223333'),
    ('21-expense-categorization.json', 'expense-cat-21-xxxx-yyyy-zzzz-111122223333')
]

for filename, new_id in files:
    filepath = os.path.join('n8n-workflows', filename)
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    result_parts = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Check if this line starts a jsCode field
        if '"jsCode":' in line:
            # Find where the string content starts
            js_code_start = line.find('"jsCode":') + len('"jsCode":')
            prefix = line[:js_code_start]
            rest = line[js_code_start:].strip()
            
            if rest.startswith('"'):
                # String starts on this line
                result_parts.append(prefix + ' "')
                content = rest[1:]  # Remove opening quote
                
                # Check if string ends on this line
                if content.endswith('"') and not content.endswith('\\"'):
                    # Single line - just escape and add
                    content = content[:-1]  # Remove closing quote
                    content = content.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')
                    result_parts.append(content)
                    result_parts.append('"')
                else:
                    # Multi-line - need to collect
                    result_parts.append(content.replace('\\', '\\\\').replace('"', '\\"'))
                    i += 1
                    
                    # Collect until we find the closing quote
                    while i < len(lines):
                        current = lines[i]
                        # Check if this line ends the string
                        stripped = current.rstrip()
                        if stripped.endswith('"') and not stripped.endswith('\\"'):
                            # This is the last line
                            content = stripped[:-1]  # Remove closing quote
                            result_parts.append('\\n' + content.replace('\\', '\\\\').replace('"', '\\"'))
                            result_parts.append('"')
                            # Keep any remaining content on this line after the quote
                            remaining = current.rstrip()[:-1]
                            if len(remaining) < len(current):
                                result_parts.append(current[len(remaining)+1:])
                            break
                        else:
                            # Middle of string
                            result_parts.append('\\n' + current.rstrip().replace('\\', '\\\\').replace('"', '\\"'))
                            i += 1
            else:
                result_parts.append(line)
        else:
            result_parts.append(line)
        
        i += 1
    
    cleaned = ''.join(result_parts)
    
    try:
        data = json.loads(cleaned)
        data['id'] = new_id
        if 'tags' in data:
            del data['tags']
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f'{filename}: FIXED')
    except Exception as e:
        print(f'{filename}: {e}')
