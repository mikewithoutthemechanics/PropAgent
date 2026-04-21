# n8n Credentials Setup Guide
## Agent Loop Workflows

---

## 🔑 Required Credentials

| Credential | Purpose | How to Get |
|------------|---------|------------|
| **Groq API** | AI text generation | https://console.groq.com |
| **Supabase** | Database | https://supabase.com |
| **BulkGate** | SMS/WhatsApp | https://bulkgate.com |
| **Resend** | Email | https://resend.com |

---

## 1. Groq API Setup (FREE - 1M tokens/day)

### Step 1: Get API Key
1. Go to https://console.groq.com
2. Sign up with email/GitHub
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)

### Step 2: Configure in n8n
1. Open n8n: http://localhost:5678
2. Click **Settings** (gear icon)
3. Click **Credentials** → **New**
4. Select **HTTP Header Auth**
5. Configure:
   - **Name**: `Groq API`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer YOUR_GROQ_API_KEY`
6. Click **Save**

### Alternative: Use in Workflows Directly
If credential doesn't work, you can hardcode temporarily:
- In HTTP Request nodes, set Header: `Authorization: Bearer gsk_your_key`

---

## 2. Supabase Setup (FREE - 500MB)

### Step 1: Create Project
1. Go to https://supabase.com
2. Sign up → **New Project**
3. Name: `agent loop`
4. Save the password
5. Wait 2 minutes for provisioning

### Step 2: Get Credentials
1. Go to **Project Settings** → **API**
2. Copy:
   - **URL**: `https://your-project-ref.supabase.co`
   - **Service Role Key**: (anon key won't work for n8n)

### Step 3: Configure in n8n
1. Settings → Credentials → New
2. Select **Supabase**
3. Configure:
   - **Name**: `Agent Loop DB`
   - **Host**: Your Supabase URL
   - **Service Role Secret**: Your service role key
4. Click **Save**

### Step 4: Create Tables
Run the SQL from each workflow's `.sql` file in Supabase SQL Editor.

---

## 3. BulkGate Setup (Pay-as-you-go - starting $0.01/sms)

### Step 1: Sign Up
1. Go to https://bulkgate.com
2. Sign up for free account
3. Verify email

### Step 2: Get Credentials
1. Login to the BulkGate portal
2. Go to **Application** → **Your applications**
3. Copy:
   - **Application ID**
   - **API Key** (click "Show" to reveal)

### Step 3: Configure in n8n
1. Settings → Credentials → New
2. Select **HTTP Query Auth**
3. Configure:
   - **Name**: `BulkGate API`
   - **Query Auth**: 
     - Name: `application_id`
     - Value: `YOUR_APP_ID`
   - **Password**: Your API Key
4. Click **Save**

---

## 4. Resend Setup (Free - 100 emails/day)

### Step 1: Sign Up
1. Go to https://resend.com
2. Sign up for free account
3. Verify email

### Step 2: Get API Key
1. Go to **API Keys** (left sidebar)
2. Click **Create API Key**
3. Name: `n8n`
4. Copy the key (starts with `re_`)

### Step 3: Configure in n8n
1. Settings → Credentials → New
2. Select **Resend**
3. Configure:
   - **Name**: `Resend`
   - **API Key**: Your Resend API key
4. Click **Save**

---

## ✅ Quick Test Checklist

After setting up credentials:

- [ ] Groq credential shows "Connection tested successfully"
- [ ] Supabase credential shows "Connection tested successfully"
- [ ] BulkGate credential shows "Connection tested successfully"
- [ ] Resend credential shows "Connection tested successfully"

---

## 🧪 Testing Without Credentials

If you want to test workflows WITHOUT setting up credentials:

### Option 1: Use n8n's Test Webhook
1. Open workflow in n8n
2. Click **Test Workflow**
3. Use the test URL provided

### Option 2: Manual Trigger
1. Open workflow
2. Click **Execute Node** on each node
3. Manually provide test data

---

## 🔧 Troubleshooting

### "Credential not found" Error
- Check credential name matches exactly (case-sensitive)
- Some workflows use `groq-api-key`, others use `Groq API`

### "Connection refused" to Supabase
- Use the **Service Role Key**, not anon key
- Make sure you're using the full URL with `https://`

### Groq 429 Errors (Rate Limited)
- Free tier: 20 requests/minute, 1M tokens/day
- Add a "Wait" node (1 second) between batches

---

## 📊 Current Workflows Status

| Workflow | Groq | Supabase | BulkGate | Resend |
|----------|------|----------|----------|--------|
| 04-Tenant Inquiry | ✅ | ✅ | ✅ | ✅ |
| 05-Rent Reminder | ✅ | ✅ | ✅ | ✅ |
| 06-Property Description | ✅ | ✅ | ✅ | ✅ |
| 07-Lead Scoring | ✅ | ✅ | ✅ | ✅ |
| 08-21 (all) | ✅ | ✅ | ✅ | ✅ |

**All 21 workflows ready with Groq (free tier)**

### Credential Files (Pre-configured)
- `groq-api-credential.json`
- `supabase-credential.json`
- `bulkgate-credential.json`
- `resend-credential.json`
- `twilio-credential.json`

**Minimum for testing**: Groq + Supabase (both free)

---

*Last Updated: 2026-03-24*
