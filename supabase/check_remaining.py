#!/usr/bin/env python3
import json
import os

files = [
    '11-property-matching-engine.json',
    '14-property-photo-tagging.json',
    '15-market-report-generator.json',
    '16-contractor-quote-comparison.json',
    '17-viewing-scheduler-ai.json',
    '18-tenant-screening.json',
    '19-property-price-recommendation.json',
    '21-expense-categorization.json'
]

print('Checking remaining 8 workflows:')
print('=' * 50)

for f in files:
    filepath = os.path.join('n8n-workflows', f)
    try:
        with open(filepath, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
        print(f'{f}: JSON OK')
        print(f"  ID: {data.get('id', 'NO ID')}")
        print(f"  Name: {data.get('name', 'NO NAME')}")
        if 'tags' in data:
            print(f"  Tags: {len(data['tags'])} tags present - NEEDS REMOVAL")
    except json.JSONDecodeError as e:
        print(f'{f}: JSON ERROR - {e}')
    except Exception as e:
        print(f'{f}: ERROR - {e}')
    print()
