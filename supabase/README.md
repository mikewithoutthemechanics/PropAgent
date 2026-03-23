# PropAgent Supabase Database Setup

## Quick Setup

### Option 1: SQL Editor (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com/project/sehweutpfftnrcbqshsn)
2. Navigate to **SQL Editor** → **New Query**
3. Copy contents of `setup-complete.sql`
4. Paste and click **Run**

### Option 2: Run Migrations via PowerShell
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIs..."
.\execute-migrations.ps1
```

## Database Schema

### Core Tables

| Table | Purpose | Workflow |
|-------|---------|----------|
| `properties` | Property listings | 06-property-description |
| `tenants` | Tenant information | 05-rent-reminder |
| `inquiries` | WhatsApp/email inquiries | 04-tenant-inquiry |
| `rent_reminders` | Rent reminder tracking | 05-rent-reminder |
| `property_descriptions` | AI-generated descriptions | 06-property-description |
| `fica_documents` | FICA compliance docs | 10-fica-document-ocr |
| `lead_scores` | AI lead scoring | 07-lead-scoring-engine |

### Key Features
- **UUID Primary Keys**: All tables use `gen_random_uuid()`
- **RLS Enabled**: Row Level Security with service_role access
- **Indexes**: Optimized for common queries
- **Foreign Keys**: Proper relationships between tables
- **Check Constraints**: Data integrity enforcement

## Sample Data

The seed data includes:
- 4 properties (available, rented, maintenance)
- 4 tenants (active, prospect, overdue)
- 3 sample inquiries (with AI responses)
- 3 rent reminders (upcoming, overdue, due today)
- 2 AI-generated property descriptions

## Supabase Connection Details

```
URL: https://sehweutpfftnrcbqshsn.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaHdldXRwZmZ0bnJjYnFzaHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzIwODIsImV4cCI6MjA4OTgwODA4Mn0.B3dHLw3CWdL7QKqgCl4n85lyT1tMQraBPzHDvLWB0L4
Service Role: (in credential file)
```

## Testing Queries

```sql
-- View all active tenants with properties
SELECT t.first_name, t.last_name, p.address, t.monthly_rent, t.payment_status
FROM tenants t
LEFT JOIN properties p ON t.property_id = p.id
WHERE t.status = 'active';

-- Recent inquiries with AI responses
SELECT source, intent_classified, sentiment, ai_confidence, created_at
FROM inquiries
ORDER BY created_at DESC
LIMIT 10;

-- Rent reminders due soon
SELECT t.first_name, r.reminder_type, r.days_until_due, r.ai_message
FROM rent_reminders r
JOIN tenants t ON r.tenant_id = t.id
WHERE r.status = 'pending'
ORDER BY r.scheduled_for;

-- Properties with AI descriptions
SELECT address, ai_description IS NOT NULL as has_description, ai_description_generated_at
FROM properties
WHERE status = 'available';
```

## n8n Integration

The Supabase credential is already configured in n8n:
- **Host**: `https://sehweutpfftnrcbqshsn.supabase.co`
- **Service Role Secret**: (imported via credential file)

All 3 active workflows (04, 05, 06) can now read/write to these tables.
