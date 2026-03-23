# Workflow #17: Viewing Scheduler AI

**Project:** PropAgent - South African Real Estate Platform  
**Purpose:** AI-powered property viewing appointment scheduling  
**Pattern:** Webhook → AI parsing → Calendar check → Confirmation

---

## Overview

This n8n workflow automates property viewing scheduling using Groq AI to parse natural language requests and Supabase to manage agent availability and viewing records.

### Key Features

- **Natural Language Parsing:** Understands requests like "I'd like to see the house in Bryanston this weekend, preferably morning"
- **Smart Date Resolution:** Converts relative dates ("today", "tomorrow", "next week") to actual dates
- **Agent Availability Matching:** Checks calendar and suggests 3 available time slots
- **Multi-Channel Confirmation:** Sends confirmations via WhatsApp, SMS, or Email
- **Conflict Handling:** Requests alternatives when preferred times are unavailable

---

## Workflow Flow

```
Webhook Trigger
      ↓
Prepare Groq Prompt (build AI prompt from input)
      ↓
Groq AI Parse (llama-3.1-8b-instant)
      ↓
Parse AI Response (extract JSON, resolve dates)
      ↓
Query Agent Availability (check Supabase)
      ↓
Match Slots (find 3 best matching slots)
      ↓
[IF] Slots Available?
      ↓ YES                              ↓ NO
Save Viewing Request              Request Alternatives
      ↓                                    ↓
Prepare Confirmation              Send Email (Alt)
      ↓                                    ↓
Send WhatsApp/Twilio              Respond (Alt Needed)
      ↓
Respond to Webhook
```

---

## Input Format

Send a POST request to the webhook URL:

```json
{
  "name": "John Smith",
  "phone": "+27821234567",
  "email": "john@example.com",
  "message": "Hi, I'm interested in viewing the 3 bedroom house in Sea Point. Would tomorrow afternoon or Saturday morning work? It's quite urgent as we're moving from Jhb next week."
}
```

---

## AI-Parsed Output

Groq AI extracts:

```json
{
  "intent": "schedule",
  "property_reference": "3 bedroom house in Sea Point",
  "property_confidence": 0.85,
  "preferred_dates": [
    {
      "date": "tomorrow",
      "time_preference": "afternoon",
      "flexibility": "flexible"
    },
    {
      "date": "Saturday",
      "time_preference": "morning",
      "flexibility": "strict"
    }
  ],
  "urgency": "high",
  "party_size": 2,
  "special_requirements": ["moving from Johannesburg"],
  "client_type": "serious_buyer",
  "suggested_response": "Hi John, I can help you schedule a viewing..."
}
```

---

## Response Format

### Success (slots found):
```json
{
  "status": "pending_confirmation",
  "suggested_slots": [
    {"time": "14:00", "date": "2024-01-16", "confidence": 0.9},
    {"time": "15:00", "date": "2024-01-16", "confidence": 0.9},
    {"time": "09:00", "date": "2024-01-20", "confidence": 0.9}
  ],
  "message": "Hi John,\n\nGreat! I've found 3 available time slots..."
}
```

### Alternative Requested (no matching slots):
```json
{
  "status": "alternative_requested",
  "message": "Hi John,\n\nI couldn't find availability for your preferred time..."
}
```

---

## Setup Instructions

### 1. Create Supabase Tables

Run the SQL in `17-viewing-scheduler-ai-tables.sql` to create:
- `viewing_requests` - Stores all viewing requests
- `agent_availability` - Agent calendar data
- `viewing_feedback` - Post-viewing feedback
- `viewing_reminders` - Reminder logs

### 2. Configure n8n Credentials

Create these credentials in n8n:

| Credential | Type | Purpose |
|------------|------|---------|
| `groq-api-key` | HTTP Header Auth | Groq AI API |
| `supabase-credentials` | Supabase API | Database access |
| `twilio-credentials` | HTTP Basic Auth | WhatsApp/SMS |
| `sendgrid-api-key` | HTTP Header Auth | Email fallback |

### 3. Environment Variables

Add to n8n environment or workflow settings:

```bash
GROQ_API_KEY=gsk_xxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
WHATSAPP_FROM_NUMBER=whatsapp:+1415xxxxxx
SENDGRID_API_KEY=SG.xxx
```

### 4. Import Workflow

1. Go to n8n → Workflows → Import
2. Select `17-viewing-scheduler-ai.json`
3. Activate the workflow
4. Note the webhook URL

---

## Groq AI Configuration

**Model:** `llama-3.1-8b-instant` (Free Tier)

**Rate Limits:**
- 20 requests per minute
- 1,000,000 tokens per day
- 6,000 requests per day

**Cost:** FREE (within limits)

**Temperature:** 0.2 (deterministic output for structured JSON)

---

## Supabase Integration

### Tables Created

#### viewing_requests
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| client_name | TEXT | Client name |
| client_phone | TEXT | Phone number |
| client_email | TEXT | Email address |
| property_id | UUID | Property reference |
| property_address | TEXT | Property address/area |
| parsed_preferences | JSONB | AI-extracted preferences |
| urgency | TEXT | high/medium/low |
| suggested_slots | JSONB | Available time slots |
| confirmed_slot | TIMESTAMP | Final confirmed time |
| agent_id | UUID | Assigned agent |
| status | TEXT | pending/confirmed/cancelled |
| created_at | TIMESTAMP | Request timestamp |

#### agent_availability
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| agent_id | UUID | Agent reference |
| date | DATE | Calendar date |
| available_slots | JSONB | Array of time strings |
| booked_slots | JSONB | Array of booked times |
| is_working_day | BOOLEAN | Working day flag |

### Helper Functions

- `book_viewing_slot(request_id, slot_datetime)` - Books a confirmed slot
- `cancel_viewing(request_id)` - Cancels and frees slot
- `get_available_slots(agent_id, start_date, end_date)` - Gets availability range

---

## Supported Date Formats

The AI can understand and resolve:

| Input | Resolved To |
|-------|-------------|
| "today" | Current date |
| "tomorrow" | Next day |
| "this weekend" | Next Saturday |
| "next week" | Next Monday |
| "next Tuesday" | Following Tuesday |
| "2024-01-15" | As-is |
| "15 January" | Resolved to current/next year |

---

## Time Preference Mapping

| Preference | Suggested Slots |
|------------|-----------------|
| morning | 09:00, 10:30, 11:30 |
| afternoon | 13:00, 14:30, 16:00 |
| evening | 17:00, 17:30, 18:00 |
| (unspecified) | 10:00, 14:00, 16:00 |

---

## Error Handling

### AI Parse Failures
- Returns error response with raw AI output
- Logs to webhook for debugging

### No Availability
- Sends alternative request message
- Suggests checking next available day

### Database Errors
- Workflow continues with default slots
- Logs error for manual review

---

## Testing

### Test Webhook (cURL)

```bash
curl -X POST https://your-n8n.app/webhook/viewing-scheduler \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "phone": "+27821234567",
    "email": "test@example.com",
    "message": "I want to see the house in Sandton tomorrow morning if possible"
  }'
```

### Expected Response

```json
{
  "status": "pending_confirmation",
  "suggested_slots": [
    {"time": "09:00", "date": "2024-XX-XX", "datetime": "2024-XX-XXT09:00:00"},
    {"time": "10:00", "date": "2024-XX-XX", "datetime": "2024-XX-XXT10:00:00"},
    {"time": "11:00", "date": "2024-XX-XX", "datetime": "2024-XX-XXT11:00:00"}
  ]
}
```

---

## South African Context

The AI prompt includes context for:
- Cape Town, Johannesburg, Durban property markets
- Local date formats
- South African phone number formats
- Working hours (9 AM - 5 PM typical)

---

## Future Enhancements

- [ ] Google Calendar integration for agent schedules
- [ ] Property matching from database
- [ ] Multi-agent load balancing
- [ ] Client preference learning
- [ ] Automated reminder system
- [ ] Rescheduling workflow
- [ ] Property video tour link attachment

---

## File Structure

```
n8n-workflows/
├── 17-viewing-scheduler-ai.json          # Workflow definition
├── 17-viewing-scheduler-ai-tables.sql    # Database schema
└── 17-viewing-scheduler-ai.md            # This documentation
```

---

## Support

For issues with:
- **Groq AI**: Check rate limits and API key
- **Supabase**: Verify RLS policies and connection
- **WhatsApp**: Ensure Twilio WhatsApp is enabled
- **General**: Check n8n execution logs
