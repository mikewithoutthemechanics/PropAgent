#!/usr/bin/env python3
import json

workflows = [
    '07-lead-scoring-engine.json',
    '08-email-intent-classifier.json',
    '09-maintenance-ticket-router.json',
    '10-fica-document-ocr.json',
    '13-rent-collection-followup.json',
    '20-social-media-content-generator.json'
]

tables_needed = {}

for wf in workflows:
    with open(f'n8n-workflows/{wf}') as f:
        data = json.load(f)
    
    tables = []
    for node in data.get('nodes', []):
        node_type = node.get('type', '')
        if 'supabase' in node_type.lower():
            params = node.get('parameters', {})
            table = params.get('table', {})
            if isinstance(table, dict):
                table_name = table.get('value', 'unknown')
            else:
                table_name = str(table)
            tables.append((node.get('name'), table_name))
    
    if tables:
        tables_needed[wf] = tables

print("Tables needed by new workflows:")
print("=" * 50)
for wf, tables in tables_needed.items():
    print(f"{wf}:")
    for node_name, table_name in tables:
        print(f"  - {node_name}: {table_name}")
    print()
