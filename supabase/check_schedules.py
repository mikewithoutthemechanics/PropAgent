#!/usr/bin/env python3
import json
import os

for f in sorted(os.listdir('n8n-workflows')):
    if f.endswith('.json') and f[0:2].isdigit():
        with open(f'n8n-workflows/{f}') as fp:
            data = json.load(fp)
        
        for node in data.get('nodes', []):
            if 'schedule' in node.get('type', '').lower():
                print(f'{f}: Schedule trigger found')
                params = node.get('parameters', {})
                rule = params.get('rule', {})
                print(f'  Rule: {rule}')
