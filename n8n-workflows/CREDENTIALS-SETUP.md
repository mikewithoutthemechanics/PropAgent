# n8n Credentials Setup Guide
## PropAgent Workflows

---

## 🔑 Required Credentials

| Credential | Purpose | How to Get |
|------------|---------|------------|
| **Groq API** | AI text generation | https://console.groq.com |
| **Supabase** | Database | https://supabase.com |
| **Twilio** | SMS/WhatsApp | https://twilio.com |
| **SendGrid** | Email | https://sendgrid.com |

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
3. Name: `propagent`
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
   - **Name**: `PropAgent DB`
   - **Host**: Your Supabase URL
   - **Service Role Secret**: Your service role key
4. Click **Save**

### Step 4: Create Tables
Run the SQL from each workflow's `.sql` file in Supabase SQL Editor.

---

## 3. Twilio Setup (Trial - Free credits)

### Step 1: Sign Up
1. Go to https://twilio.com
2. Sign up (free trial)
3. Get $15.50 trial credit

### Step 2: Get Credentials
1. Console → **Account Info**
2. Copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
3. Phone Numbers → Get a trial number

### Step 3: Configure in n8n
1. Settings → Credentials → New
2. Select **HTTP Query Auth**
3. Configure:
   - **Name**: `Twilio API`
   - **Query Auth**: 
     - Name: `AccountSid`
     - Value: `YOUR_ACCOUNT_SID`
   - **Password**: Your Auth Token
4. Click **Save**

---

## 4. SendGrid Setup (Free - 100 emails/day)

### Step 1: Sign Up
1. Go to https://sendgrid.com
2. Sign up for free plan
3. Complete email verification

### Step 2: Get API Key
1. Settings → **API Keys**
2. Create API Key → **Full Access**
3. Copy the key

### Step 3: Configure in n8n
1. Settings → Credentials → New
2. Select **SendGrid**
3. Configure:
   - **Name**: `SendGrid`
   - **API Key**: Your SendGrid API key
4. Click **Save**

---

## ✅ Quick Test Checklist

After setting up credentials:

- [ ] Groq credential shows "Connection tested successfully"
- [ ] Supabase credential shows "Connection tested successfully"
- [ ] Twilio credential shows "Connection tested successfully"
- [ ] SendGrid credential shows "Connection tested successfully"

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

| Workflow | Groq | Supabase | Twilio | SendGrid |
|----------|------|----------|--------|----------|
| 04-Tenant Inquiry | ✅ | ✅ | ✅ | ❌ |
| 05-Rent Reminder | ✅ | ✅ | ✅ | ✅ |
| 06-Property Description | ✅ | ✅ | ❌ | ❌ |
| 07-Lead Scoring | ✅ | ✅ | ✅ | ✅ |
| ... (all 21) | ✅ | ✅ | varies | varies |

**Minimum for testing**: Groq + Supabase

---

*Last Updated: 2026-03-23*
