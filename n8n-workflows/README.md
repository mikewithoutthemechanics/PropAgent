# PropAgent n8n Workflows

Pre-built workflow templates for PropAgent automation using n8n.

## 🚀 Quick Start

### 1. Install n8n

**Option A: Docker (Recommended)**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option B: Self-hosted**
- Follow [n8n Self-Hosted Guide](https://docs.n8n.io/hosting/)

### 2. Import Workflows

1. Open n8n web interface (default: http://localhost:5678)
2. Click "Workflows" → "Import from File"
3. Select workflow JSON files from this folder
4. Configure credentials (see below)
5. Activate workflows

### 3. Configure Credentials

Create these credentials in n8n:

| Credential | Purpose |
|------------|---------|
| OpenAI API | AI text generation |
| PostgreSQL | Database connection |
| Resend | Email sending |
| BulkGate | SMS sending |
| WhatsApp Business API | WhatsApp messages |

---

## 📋 Available Workflows

### 1. Tenant Inquiry Auto-Responder
**File**: `01-tenant-inquiry-autoresponder.json`

**Purpose**: Automatically respond to tenant WhatsApp messages using AI

**Features**:
- Classifies message intent (maintenance, rent, urgent, general)
- Generates AI-powered responses
- Routes urgent messages to agents
- Logs all communications

**Cost**: ~$25/month (AI + WhatsApp fees)

**Setup**:
1. Import workflow
2. Configure WhatsApp Business webhook URL
3. Set PostgreSQL connection
4. Add OpenAI API key
5. Activate

---

### 2. Rent Reminder Sequence
**File**: `02-rent-reminder-sequence.json`

**Purpose**: Automated rent payment reminders

**Features**:
- Daily check for upcoming rent due dates
- Skips tenants who already paid
- Sends email + SMS reminders
- Escalation schedule (3 days, due date, 3 days overdue, 7 days overdue)

**Cost**: ~$30/month (AI + SMS fees)

**Setup**:
1. Import workflow
2. Configure PostgreSQL connection
3. Add Resend credentials
4. Add BulkGate credentials
5. Set schedule (default: daily 9 AM)

---

### 3. Property Description Generator
**File**: `03-property-description-generator.json`

**Purpose**: AI-generated property listing descriptions

**Features**:
- Generates professional property descriptions
- Extracts key selling points
- Returns headline + description + bullet points
- Saves to database automatically

**Cost**: ~$10/month (AI only)

**Setup**:
1. Import workflow
2. Configure PostgreSQL connection
3. Add OpenAI API key
4. Test via webhook or API call

**API Usage**:
```bash
curl -X POST http://your-n8n-instance/webhook/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "property_type": "House",
    "suburb": "Umhlanga",
    "city": "Durban",
    "price": "2500000",
    "bedrooms": "4",
    "bathrooms": "3",
    "garages": "2",
    "stand_size": "800",
    "floor_size": "350",
    "features": "pool, sea view, security estate"
  }'
```

---

## 🔧 Creating Custom Workflows

### Pattern 1: Webhook → AI → Database

For features that:
- Receive data from frontend/backend
- Process with AI
- Store results

```
Webhook → OpenAI → PostgreSQL
```

### Pattern 2: Schedule → Query → AI → Notify

For features that:
- Run on schedule
- Query database
- Process with AI
- Send notifications

```
Schedule → PostgreSQL → OpenAI → Resend/BulkGate
```

### Pattern 3: Trigger → Transform → Multiple Outputs

For features that:
- Respond to database changes
- Transform data
- Send to multiple destinations

```
Postgres Trigger → Code (transform) → HTTP Request (x3)
```

---

## 💰 Cost Optimization Tips

### 1. Use Local LLM for Simple Tasks

Replace OpenAI node with HTTP request to local LLM:

```javascript
// In Code node or HTTP Request
const response = await $helpers.httpRequest({
  method: 'POST',
  url: 'http://localhost:11434/api/generate',
  body: {
    model: 'mistral',
    prompt: $json.prompt,
    stream: false
  }
});
```

### 2. Batch AI Requests

Process multiple items in one AI call:

```javascript
const items = $input.all();
const prompt = `Process these ${items.length} items: ${JSON.stringify(items)}`;
// Send to AI once, parse response
```

### 3. Implement Caching

Cache AI responses for identical queries:

```javascript
// Check cache first
const cache = await $helpers.httpRequest({
  url: `http://redis-cache/get/${hash}`
});

if (cache) {
  return cache;
}

// Call AI if not cached
const aiResponse = await $helpers.httpRequest({...});

// Store in cache
await $helpers.httpRequest({
  method: 'POST',
  url: 'http://redis-cache/set',
  body: { key: hash, value: aiResponse }
});
```

### 4. Use Cheaper Models for Simple Tasks

| Task | Recommended Model | Cost |
|------|-------------------|------|
| Classification | GPT-3.5-turbo | $0.0015/1K |
| Content generation | GPT-3.5-turbo | $0.0015/1K |
| Long documents | Claude Instant | $0.0008/1K |
| Multimodal | Gemini Pro | Free tier |
| Simple extraction | Local Mistral | $0 |

---

## 🔒 Security Best Practices

### 1. Credential Management
- Never hardcode API keys in workflows
- Use n8n credential store
- Rotate keys every 90 days

### 2. Data Privacy
- Don't send PII to AI without consent
- Implement data masking for sensitive fields
- Log AI interactions for audit

### 3. Access Control
- Use n8n user management
- Restrict workflow editing to admins
- Enable 2FA for n8n access

### 4. Error Handling
- Always add error handlers
- Log errors to monitoring system
- Set up alerts for workflow failures

---

## 📊 Monitoring

### Track These Metrics

| Metric | Target | Alert If |
|--------|--------|----------|
| Workflow success rate | >99% | <95% |
| AI response time | <3s | >5s |
| AI cost per day | <$10 | >$15 |
| Failed executions | 0 | >5/day |

### Set Up Alerts

Use n8n's built-in error workflow:

1. Create workflow named "Error Handler"
2. Add Error Trigger node
3. Send notification to Slack/Email
4. All workflows will use this on failure

---

## 🆘 Troubleshooting

### Issue: OpenAI API errors
**Solution**: Check API key, rate limits, and token usage

### Issue: Database connection fails
**Solution**: Verify PostgreSQL credentials and network access

### Issue: WhatsApp messages not sending
**Solution**: Check Meta Business account status and phone number registration

### Issue: Webhooks not receiving data
**Solution**: Verify webhook URL is publicly accessible (use ngrok for local testing)

---

## 📚 Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI Pricing](https://openai.com/pricing)
- [WhatsApp Business API](https://business.whatsapp.com/products/business-platform)
- [PropAgent Automation Strategy](../PropAgent-n8n-Automation-Strategy.md)

---

## 📝 Workflow Checklist

Before deploying any workflow:

- [ ] Credentials configured
- [ ] Database connections tested
- [ ] Error handling added
- [ ] Rate limits considered
- [ ] Logging implemented
- [ ] Documentation updated
- [ ] Team trained on usage

---

*Last Updated: 2026-03-23*
