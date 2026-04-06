# PropAgent Free Stack Setup
## Groq AI + Supabase PostgreSQL = $0/month

---

## 🎯 What's Included (100% Free)

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **Groq AI** | 1,000,000 tokens/day | Llama 3.1 70B, Mixtral 8x7B, Gemma 2 |
| **Supabase** | 500MB + 2GB bandwidth | PostgreSQL, Auth, Realtime, Storage |
| **Resend** | 3,000 emails/month | Transactional emails |
| **BulkGate** | 100 SMS/month | WhatsApp & SMS (test mode) |

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

### 3. Resend Account (Optional - for Emails)

1. Go to https://resend.com
2. Sign up with email/GitHub
3. Navigate to **API Keys**
4. Create new key: `propagent-prod`
5. Copy the key (starts with `re_`)
6. Verify your sender identity (from Address tab)

**Free Tier:**
- 3,000 emails/month
- Perfect for transactional emails and testing

---

### 4. BulkGate Account (Optional - for WhatsApp/SMS)

1. Go to https://bulkgate.com
2. Sign up (free account)
3. Navigate to **Settings** → **Application**
4. Copy:
   - Application ID
   - Application token
5. For WhatsApp: Go to **SMS** → **Send SMS** or use WhatsApp API

**Free Tier:**
- 100 SMS/month (Basic) or 500 SMS/month (Pro)
- Perfect for testing and small production use

---

### 5. n8n Credentials Setup

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

#### Resend Credential (Optional - for Emails)
1. Click **New** → **HTTP Header Auth**
2. Name: `Resend API`
3. Header Name: `Authorization`
4. Header Value: `Bearer YOUR_RESEND_API_KEY`
5. Save

#### BulkGate Credential (Optional - for WhatsApp/SMS)
1. Click **New** → **HTTP Query Auth**
2. Name: `BulkGate API`
3. Query Auth: 
   - Name: `ApplicationId`
   - Value: `YOUR_BULKGATE_APPLICATION_ID`
4. Add password field for Application Token (in workflow, use `$credentials.bulkGateApi.password`)

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

### Test 2: Tenant Inquiry (if BulkGate configured)

Send WhatsApp or SMS to your BulkGate number:
```
Hi, I'm interested in viewing the property in Sandton. When can I see it?
```

Expected: AI classifies as VIEWING + responds with available times

### Test 3: Rent Reminders

1. Manually run the "Rent Reminder Sequence" workflow
2. Check Supabase tables for logged reminders
3. (If BulkGate configured) Check for SMS sent

---

## 💰 Cost Breakdown

### Free Tier Limits (Monthly)

| Service | Limit | PropAgent Usage | Status |
|---------|-------|-----------------|--------|
| Groq Tokens | 1,000,000/day | ~10,000/day | ✅ 1% used |
| Supabase DB | 500MB | ~50MB | ✅ 10% used |
| Supabase Bandwidth | 2GB | ~500MB | ✅ 25% used |
| Resend Emails | 3,000/month | ~500/month | ✅ 15% used |
| BulkGate SMS | 100/month | ~50/month | ✅ 50% used |

**Actual monthly cost: $0**

### When to Upgrade

| Scenario | Upgrade To | Cost |
|----------|------------|------|
| >1M tokens/day | Groq Pay-as-you-go | ~$0.50/million |
| >500MB data | Supabase Pro | $25/month |
| >3,000 emails/month | Resend Pro | $0.01/email |
| >100 SMS/month | BulkGate Pro | ~$0.04/SMS |

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

### Resend Errors

**Error:** `401 Unauthorized` or `403 Forbidden`
- **Cause:** Invalid API key or unverified sender
- **Fix:** Check API key format: `Bearer re_...` and verify sender identity in Resend dashboard

**Error:** `422 Unprocessable Entity`
- **Cause:** Missing or invalid "from" address
- **Fix:** Verify your sender identity in Resend (Address tab)

### BulkGate Errors

**Error:** `401 Unauthorized`
- **Cause:** Invalid Application ID or token
- **Fix:** Check credentials in BulkGate dashboard under Settings → Application

**Error:** `From number not valid`
- **Cause:** Not verified sender number
- **Fix:** Verify sender number in BulkGate console first

---

## 📝 Environment Variables (Optional)

Create `.env` file for n8n:

```bash
# Groq
GROQ_API_KEY=gsk_your_key_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Resend (optional)
RESEND_API_KEY=re_your_key_here

# BulkGate (optional)
BULKGATE_APPLICATION_ID=your_app_id
BULKGATE_APPLICATION_TOKEN=your_token
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
- Resend Docs: https://resend.com/docs
- BulkGate Docs: https://bulkgate.com/docs
- n8n Docs: https://docs.n8n.io/

---

**Setup Time:** 15-20 minutes  
**Monthly Cost:** $0  
**Ready for:** Development, testing, small production use

*Last Updated: 2026-03-24*
