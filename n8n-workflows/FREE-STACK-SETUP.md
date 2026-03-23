# PropAgent Free Stack Setup
## Groq AI + Supabase PostgreSQL = $0/month

---

## 🎯 What's Included (100% Free)

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Groq AI** | 1,000,000 tokens/day | Llama 3.1 70B, Mixtral 8x7B, Gemma 2 |
| **Supabase** | 500MB + 2GB bandwidth | PostgreSQL, Auth, Realtime, Storage |
| **Twilio** | Trial credits | WhatsApp & SMS (test mode) |

**Total Monthly Cost: $0**

---

## 📋 Setup Checklist

### 1. Groq AI Account (2 minutes)

1. Go to https://console.groq.com
2. Sign up with email/GitHub
3. Navigate to **API Keys**
4. Create new key: `propagent-prod`
5. Copy the key (starts with `gsk_`)

**Free Limits:**
- 1,000,000 tokens/day (~3,000 requests)
- 20 requests/minute
- Perfect for testing and small production use

**Models Available:**
- `llama-3.1-70b-versatile` - Best quality
- `mixtral-8x7b-32768` - Fast, good for simple tasks
- `gemma-2-9b-it` - Lightweight, fastest

---

### 2. Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Sign up with email/GitHub
3. Click **New Project**
4. Fill in:
   - Name: `propagent`
   - Database Password: (generate strong password)
   - Region: Choose closest (e.g., `us-east-1`)
5. Wait ~2 minutes for database to provision
6. Go to **Project Settings** → **Database**
7. Copy **Connection String** (under "Pooling")
   - Format: `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

**Create Required Tables:**

Go to **SQL Editor** → **New Query** and run:

```sql
-- WhatsApp conversations
CREATE TABLE whatsapp_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT,
  inquiry_type TEXT,
  confidence FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tenants
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  rent_amount INTEGER,
  rent_due_date DATE,
  payment_status TEXT DEFAULT 'pending',
  property_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rent reminders log
CREATE TABLE rent_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  phone TEXT,
  message TEXT,
  reminder_type TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Property descriptions
CREATE TABLE property_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT,
  headline TEXT,
  luxury_description TEXT,
  family_description TEXT,
  investment_description TEXT,
  key_selling_points JSONB,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Add some test data
INSERT INTO tenants (first_name, last_name, phone, rent_amount, rent_due_date) VALUES
  ('John', 'Smith', '+27123456789', 8500, CURRENT_DATE + INTERVAL '3 days'),
  ('Sarah', 'Johnson', '+27987654321', 12000, CURRENT_DATE),
  ('Mike', 'Williams', '+27555123456', 9500, CURRENT_DATE - INTERVAL '3 days');
```

---

### 3. Twilio Account (Optional - for WhatsApp/SMS)

1. Go to https://twilio.com
2. Sign up (free trial)
3. Get $15.50 trial credit
4. Navigate to **Console** → **Account Info**
5. Copy:
   - Account SID (starts with `AC...`)
   - Auth Token
6. Go to **Phone Numbers** → Get a number
7. For WhatsApp: Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
8. Join the sandbox by sending the code to the WhatsApp number

**Note:** Trial accounts can only message verified numbers.

---

### 4. n8n Credentials Setup

#### Groq Credential
1. In n8n, go to **Settings** → **Credentials**
2. Click **New** → **HTTP Header Auth**
3. Name: `Groq API`
4. Header Name: `Authorization`
5. Header Value: `Bearer YOUR_GROQ_API_KEY`
6. Save

#### Supabase Credential
1. Click **New** → **Supabase**
2. Name: `PropAgent DB`
3. Host: `https://your-project-ref.supabase.co`
4. Service Role Secret: (from Project Settings → API → service_role key)
5. Save

#### Twilio Credential (Optional)
1. Click **New** → **HTTP Query Auth**
2. Name: `Twilio API`
3. Query Auth: 
   - Name: `AccountSid`
   - Value: `YOUR_TWILIO_ACCOUNT_SID`
4. Add password field for Auth Token (in workflow, use `$credentials.twilioApi.password`)

---

## 🚀 Import Workflows

### Method 1: Manual Import (Recommended)

1. Open n8n at http://localhost:5678
2. Click **Workflows** → **Import from File**
3. Import each workflow:
   - `04-tenant-inquiry-groq.json`
   - `05-rent-reminder-groq.json`
   - `06-property-description-groq.json`
4. Each import will prompt for credentials
5. Select the credentials created above

### Method 2: Copy-Paste

1. Open workflow JSON file
2. Copy entire content
3. In n8n: **Workflows** → **Import from URL**
4. Paste JSON
5. Click Import

---

## 🧪 Test the Setup

### Test 1: Property Description Generator

```bash
curl -X POST http://localhost:5678/webhook/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "property_type": "House",
    "suburb": "Sandton",
    "city": "Johannesburg",
    "price": "4500000",
    "bedrooms": "4",
    "bathrooms": "3",
    "garages": "2",
    "stand_size": "800",
    "floor_size": "350",
    "features": "pool, security estate, modern kitchen"
  }'
```

Expected: JSON with headline + 3 description variants

### Test 2: Tenant Inquiry (if Twilio configured)

Send WhatsApp to your Twilio sandbox number:
```
"Hi, I'm interested in viewing the property in Sandton. When can I see it?"
```

Expected: AI classifies as VIEWING + responds with available times

### Test 3: Rent Reminders

1. Manually run the "Rent Reminder Sequence" workflow
2. Check Supabase tables for logged reminders
3. (If Twilio configured) Check for SMS sent

---

## 💰 Cost Breakdown

### Free Tier Limits (Monthly)

| Service | Limit | PropAgent Usage | Status |
|---------|-------|-----------------|--------|
| Groq Tokens | 1,000,000/day | ~10,000/day | ✅ 1% used |
| Supabase DB | 500MB | ~50MB | ✅ 10% used |
| Supabase Bandwidth | 2GB | ~500MB | ✅ 25% used |
| Twilio Trial | $15.50 | Testing only | ✅ Free |

**Actual monthly cost: $0**

### When to Upgrade

| Scenario | Upgrade To | Cost |
|----------|------------|------|
| >1M tokens/day | Groq Pay-as-you-go | ~$0.50/million |
| >500MB data | Supabase Pro | $25/month |
| Production Twilio | Twilio Pay-as-you-go | ~$0.01/SMS |

---

## 🔧 Troubleshooting

### Groq API Errors

**Error:** `429 Too Many Requests`
- **Cause:** Hit 20 req/min limit
- **Fix:** Add a "Wait" node (1 second) between batches

**Error:** `401 Unauthorized`
- **Cause:** Invalid API key
- **Fix:** Check credential format: `Bearer gsk_...`

### Supabase Errors

**Error:** `Connection refused`
- **Cause:** Wrong connection string
- **Fix:** Use the pooled connection string (port 5432, not 6543)

**Error:** `permission denied`
- **Cause:** Using anon key instead of service_role
- **Fix:** Use service_role key for n8n

### Twilio Errors

**Error:** `From number not valid`
- **Cause:** Trial account restrictions
- **Fix:** Verify recipient number in Twilio console first

---

## 📝 Environment Variables (Optional)

Create `.env` file for n8n:

```bash
# Groq
GROQ_API_KEY=gsk_your_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Twilio (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 🎓 Next Steps

1. ✅ Test all 3 workflows
2. ✅ Add more tenants to Supabase
3. ✅ Customize AI prompts for your brand voice
4. ⏳ Build more workflows (see Automation Strategy)
5. ⏳ Connect to your backend API

---

## 📚 Resources

- Groq Docs: https://console.groq.com/docs
- Supabase Docs: https://supabase.com/docs
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- n8n Docs: https://docs.n8n.io/

---

**Setup Time:** 15-20 minutes  
**Monthly Cost:** $0  
**Ready for:** Development, testing, small production use

*Last Updated: 2026-03-23*
