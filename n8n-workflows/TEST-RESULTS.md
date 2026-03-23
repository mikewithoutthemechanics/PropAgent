# PropAgent n8n Workflow Test Results
## End-to-End Testing Guide

---

## 📋 Test Environment

| Component | Status | Details |
|-----------|--------|---------|
| **n8n** | ✅ Running | http://localhost:5678 |
| **Podman** | ✅ Active | Machine: podman-machine-default |
| **Workflows Imported** | ✅ 3 of 21 | 04, 05, 06 (Groq Free tier) |
| **Groq API** | ⏳ Needs Key | Get free key at console.groq.com |
| **Supabase** | ⏳ Needs Setup | Create project at supabase.com |

---

## ✅ Successfully Imported Workflows

| # | Workflow | ID | Status |
|---|----------|-----|--------|
| 04 | Tenant Inquiry (Groq) | a1b2c3d4... | ✅ Imported |
| 05 | Rent Reminder (Groq) | b2c3d4e5... | ✅ Imported |
| 06 | Property Description (Groq) | c3d4e5f6... | ✅ Imported |

**Note**: Workflows 07-21 need credential setup before import (JSON validation errors)

---

## 🧪 Test Execution Guide

### Test 1: Property Description Generator (Simplest)

**Prerequisites**:
1. Groq API key configured
2. Supabase project created

**Steps**:
```bash
# 1. Open n8n
open http://localhost:5678

# 2. Activate workflow "Property Description Generator (Groq Free)"
# 3. Copy webhook URL
# 4. Test with curl:

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

**Expected Response**:
```json
{
  "property_id": "temp-...",
  "headline": "Stunning 4-Bedroom Home in Sandton",
  "luxury_description": "...",
  "family_description": "...",
  "investment_description": "...",
  "key_selling_points": ["...", "...", "..."]
}
```

**Success Criteria**:
- [ ] Response received within 5 seconds
- [ ] All 3 description variants generated
- [ ] Data saved to Supabase `property_descriptions` table
- [ ] No errors in n8n execution log

---

### Test 2: Tenant Inquiry Auto-Responder

**Prerequisites**:
1. Groq API key configured
2. Supabase connected
3. WhatsApp webhook configured (or use test mode)

**Steps**:
```bash
# Test webhook directly
curl -X POST http://localhost:5678/webhook/whatsapp-inquiry \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+27821234567",
    "message": "Hi, I want to view the house in Sandton. Is Saturday 2pm available?"
  }'
```

**Expected**:
- AI classifies intent as "VIEWING"
- Response includes available times
- Logged to Supabase

---

### Test 3: Rent Reminder Sequence

**Prerequisites**:
1. Groq API key
2. Supabase with test tenant data
3. Twilio (optional, can disable SMS)

**Steps**:
1. Manually execute workflow in n8n
2. Check Supabase `rent_reminders` table
3. Verify AI-generated personalized messages

---

## 🔧 Fixing Import Issues for Workflows 07-21

The remaining workflows (07-21) failed import due to:
1. JSON syntax errors (control characters)
2. Missing workflow tags

**Fix Process**:
```bash
# 1. Fix JSON files (remove control characters)
# 2. Remove tags from workflow JSON
# 3. Re-import

# Example fix for workflow 19:
podman exec n8n n8n import:workflow --input=/home/node/19-property-price-recommendation-fixed.json
```

---

## 📊 Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Workflow Execution Time | <5s | Groq API response time |
| Token Usage per Call | <2,000 | Well within free tier |
| Success Rate | >95% | Handle API errors gracefully |
| Database Writes | <500ms | Supabase response time |

---

## 🐛 Known Issues & Workarounds

### Issue 1: "Bad control character in JSON"
**Cause**: Windows line endings or special characters in workflow files

**Fix**:
```powershell
# Clean JSON file
$content = Get-Content "workflow.json" -Raw
$clean = $content -replace "[\x00-\x08\x0B-\x0C\x0E-\x1F]", ""
Set-Content "workflow-clean.json" $clean
```

### Issue 2: "SQLITE_CONSTRAINT: NOT NULL constraint failed: workflows_tags.tagId"
**Cause**: Workflow JSON includes tags that don't exist

**Fix**: Remove `"tags": []` from workflow JSON before import

### Issue 3: "Credential not found"
**Cause**: Credential name mismatch

**Fix**: Update workflow JSON to match your credential names, or rename credentials to match workflows

---

## ✅ Production Readiness Checklist

Before using in production:

- [ ] All 21 workflows imported successfully
- [ ] Groq API key configured (free tier sufficient for testing)
- [ ] Supabase project created with all tables
- [ ] Twilio trial account (optional, for SMS/WhatsApp)
- [ ] SendGrid account (optional, for email)
- [ ] Error handling workflow configured
- [ ] Webhook URLs documented
- [ ] Rate limiting understood (20 req/min Groq free)

---

## 🚀 Next Steps to Complete Testing

1. **Get Groq API Key**: https://console.groq.com (free, instant)
2. **Create Supabase Project**: https://supabase.com (free, 2 min setup)
3. **Configure Credentials**: Follow CREDENTIALS-SETUP.md
4. **Run Test 1**: Property Description (simplest workflow)
5. **Fix Remaining Workflows**: Clean JSON and re-import 07-21
6. **Run All Tests**: Execute each workflow with test data

---

## 📈 Test Results Template

| Workflow | Status | Execution Time | Errors | Notes |
|----------|--------|----------------|--------|-------|
| 04-Tenant Inquiry | ⏳ Pending | - | - | Needs Groq key |
| 05-Rent Reminder | ⏳ Pending | - | - | Needs Supabase data |
| 06-Property Description | ⏳ Pending | - | - | Ready to test |
| 07-Lead Scoring | ⏳ Not Imported | - | - | Fix JSON first |
| ... | ... | ... | ... | ... |

---

*Last Updated: 2026-03-23*  
*Workflows Imported: 3 of 21*  
*Status: Ready for credential configuration*
