# Agent Loop n8n Automation Strategy
## AI-Powered Workflow Automation for Property Management

**Approach**: Use n8n as the automation engine + Free/Cheap AI to reduce backend development by ~60%
**Cost Target**: <$500/month for AI + automation (vs $50K+ for custom backend)
**Timeline**: Accelerate MVP by 8-12 weeks

---

## 💡 AUTOMATION-FIRST ARCHITECTURE

### Why n8n + AI for Agent Loop?

| Traditional Approach | n8n + AI Approach | Savings |
|---------------------|-------------------|---------|
| 145 weeks custom dev | 60 weeks (backend + n8n) | 60% faster |
| $800K+ development | $300K + $6K/year ops | 62% cheaper |
| Complex integrations | Pre-built connectors | 80% less code |
| Manual processes | 200+ automated workflows | Infinite ROI |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                    (React/Next.js)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Lean)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth API   │  │   Core DB    │  │  File Store  │          │
│  │  (Supabase)  │  │ (PostgreSQL) │  │    (S3)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │   Webhooks   │  │   n8n API    │                            │
│  │  Receivers   │  │   Client     │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      n8n WORKFLOWS                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  AI Agents   │  │  Integrations│  │  Automation  │          │
│  │   (50+)      │  │   (30+)      │  │  (100+)      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  OpenAI │ WhatsApp │ Property24 │ Lightstone │ Email │ SMS      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI OPTIONS: FREE & CHEAP

### 1. OpenAI GPT-3.5 Turbo (Primary)
**Cost**: $0.0015/1K tokens (input) | $0.002/1K tokens (output)
**Use for**: Property descriptions, email drafting, chat responses
**Monthly estimate**: $50-150

```javascript
// n8n OpenAI Node Configuration
{
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "maxTokens": 500,
  "messages": [
    {
      "role": "system",
      "content": "You are a professional real estate agent assistant..."
    },
    {
      "role": "user", 
      "content": "=Generate property description for: {{$json.propertyDetails}}"
    }
  ]
}
```

### 2. Local LLM (Self-Hosted)
**Cost**: $0 (runs on your server)
**Models**: Llama 2, Mistral 7B, Phi-2
**Use for**: Simple queries, data extraction, on-premise compliance
**Requirements**: GPU server ($200-500/month) or CPU inference (slower)

```javascript
// n8n HTTP Request to Local LLM
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

### 3. Claude Instant (Anthropic)
**Cost**: $0.0008/1K tokens (input) | $0.0024/1K tokens (output)
**Use for**: Longer context tasks, document analysis
**Monthly estimate**: $30-100

### 4. Gemini Pro (Google)
**Cost**: $0.0005/1K tokens (input) | $0.0015/1K tokens (output)
**Use for**: Multimodal (image + text), Google ecosystem integration
**Free tier**: 60 queries/minute

### 5. OpenRouter (AI Aggregator)
**Cost**: Varies by model, often cheaper
**Benefit**: Fallback between providers, automatic failover
**Use for**: Production reliability

---

## 📋 FEATURES TO AUTOMATE WITH n8n

### Phase 1: MVP Automation (Weeks 1-8)

#### 1. Communication Automation (25 workflows)

**A. Automated Email Responses**
```
Trigger: New inquiry email received
↓
AI Agent (GPT-3.5): Classify intent
├─ Viewing request → Send calendar link
├─ Price inquiry → Generate response + property details
├─ General question → AI draft response
└─ Urgent → Alert agent + draft response
↓
Send email via SendGrid
↓
Log to CRM
```

**n8n Nodes**: Webhook → OpenAI → SendGrid → PostgreSQL
**Cost**: ~$20/month for AI

**B. Rent Reminder Sequences**
```
Trigger: Schedule (Daily 9 AM)
↓
PostgreSQL: Query tenants with rent due in 3 days
↓
Split In Batches (process each)
↓
IF: Payment already received?
├─ Yes → Skip
└─ No → Continue
↓
AI: Generate personalized reminder
↓
Send: Email + SMS + WhatsApp
↓
Log: Communication record
```

**n8n Nodes**: Schedule → Postgres → Split → IF → OpenAI → SendGrid/Twilio → Postgres
**Cost**: ~$30/month

**C. WhatsApp Auto-Responses**
```
Trigger: WhatsApp Business webhook
↓
AI Agent: Analyze message intent
├─ Maintenance request → Create ticket + acknowledge
├─ Rent question → Check balance + respond
├─ Viewing request → Check availability + propose times
└─ General → AI response with human handoff option
↓
Send WhatsApp reply
↓
Log conversation
```

**n8n Nodes**: Webhook → OpenAI → WhatsApp Business API → Postgres
**Cost**: WhatsApp fees (~$50/month) + AI (~$25/month)

---

#### 2. Property Management Automation (20 workflows)

**A. Listing Syndication**
```
Trigger: Property status changed to "Active"
↓
Transform: Property data → XML format
↓
Parallel Branches:
├─ POST to Property24 API
├─ POST to Private Property API
├─ POST to Gumtree API
└─ POST to agency website
↓
Merge results
↓
Log: Syndication status per portal
↓
Notify: Agent of successful publication
```

**n8n Nodes**: Postgres Trigger → Code (transform) → HTTP Request (x4) → Merge → Postgres
**Cost**: ~$0 (API calls only)

**B. Property Description Generator**
```
Trigger: New property added with basic details
↓
AI (GPT-3.5): Generate compelling description
Prompt: "Write a professional property listing for:
- Type: {{$json.property_type}}
- Location: {{$json.suburb}}
- Bedrooms: {{$json.bedrooms}}
- Features: {{$json.features}}
Style: Engaging, professional, highlight key selling points"
↓
Save to database
↓
Notify agent to review
```

**n8n Nodes**: Webhook → OpenAI → Postgres
**Cost**: ~$10/month

**C. Duplicate Property Detection**
```
Trigger: New property created
↓
PostgreSQL: Search similar addresses/ERF numbers
↓
AI: Compare and calculate similarity score
↓
IF: Similarity > 85%?
├─ Yes → Alert agent + show potential duplicate
└─ No → Continue
↓
Log result
```

**n8n Nodes**: Webhook → Postgres → OpenAI → IF → Postgres
**Cost**: ~$5/month

---

#### 3. CRM Automation (15 workflows)

**A. Lead Scoring & Routing**
```
Trigger: New lead captured
↓
AI: Score lead quality (1-100)
Factors: Source, property interest, budget, timeline, contact info completeness
↓
IF: Score >= 70?
├─ Yes → Assign to top agent + priority flag
├─ Medium → Assign to available agent
└─ Low → Add to nurture campaign
↓
Send assignment notification
↓
Create follow-up task
```

**n8n Nodes**: Webhook → OpenAI → IF → Postgres → Slack/Email
**Cost**: ~$15/month

**B. Property Matching Automation**
```
Trigger: New property listed OR New buyer registered
↓
PostgreSQL: Fetch all wishlists/buyers for this property type/area
↓
AI: Calculate match scores
↓
Filter: Score >= 80%
↓
For each match:
  ├─ Send personalized alert
  ├─ Create viewing suggestion
  └─ Log match in CRM
↓
Notify agent of high matches
```

**n8n Nodes**: Trigger → Postgres → Code (batch) → OpenAI → Filter → Loop → SendGrid → Postgres
**Cost**: ~$20/month

**C. Follow-up Sequences**
```
Trigger: Schedule (Daily 10 AM)
↓
PostgreSQL: Find leads with no activity in 7 days
↓
AI: Generate personalized follow-up message
Context: Last interaction, property interest, agent notes
↓
Send via preferred channel
↓
Log communication
↓
Update lead temperature
```

**n8n Nodes**: Schedule → Postgres → OpenAI → SendGrid/Twilio → Postgres
**Cost**: ~$25/month

---

#### 4. Trust Accounting Automation (10 workflows)

**A. Automated Reconciliation**
```
Trigger: Daily 6 AM
↓
HTTP Request: Fetch bank statement CSV
↓
Code: Parse transactions
↓
PostgreSQL: Fetch expected transactions
↓
AI: Match transactions (fuzzy matching)
↓
IF: Unmatched items?
├─ Yes → Alert accountant with details
└─ No → Mark reconciled
↓
Generate reconciliation report
↓
Email to principal
```

**n8n Nodes**: Schedule → HTTP Request → Code → Postgres → OpenAI → IF → Postgres → SendGrid
**Cost**: ~$10/month

**B. Commission Calculation**
```
Trigger: Deal status changed to "Completed"
↓
PostgreSQL: Fetch deal details, agent, commission structure
↓
AI: Calculate commission breakdown
- Gross commission
- Agency split
- Franchise fee (if applicable)
- Referral fee (if applicable)
- Agent net commission
↓
Save calculation
↓
Generate commission statement
↓
Send to agent
```

**n8n Nodes**: Webhook → Postgres → OpenAI → Postgres → PDF Generator → SendGrid
**Cost**: ~$5/month

---

### Phase 2: Advanced Automation (Weeks 9-16)

#### 5. AI-Powered Document Processing (15 workflows)

**A. FICA Document OCR & Extraction**
```
Trigger: Document uploaded
↓
HTTP Request: Send to OCR service (Tesseract or Google Vision)
↓
AI: Extract key information
- ID Number
- Name
- Address
- Document type
- Expiry date
↓
Validate: Against database
↓
IF: Valid?
├─ Yes → Update FICA status + notify agent
└─ No → Request clearer document
↓
Log extraction result
```

**n8n Nodes**: Webhook → HTTP Request → OpenAI → Postgres → IF → Email
**Cost**: ~$30/month

**B. Lease Agreement Analysis**
```
Trigger: Lease document uploaded
↓
PDF Extract: Get text content
↓
AI: Extract key terms
- Rental amount
- Start/end dates
- Deposit amount
- Special clauses
- Renewal terms
↓
Save structured data
↓
Alert: Flag unusual terms for review
```

**n8n Nodes**: Webhook → PDF.co API → OpenAI → Postgres → IF → Slack
**Cost**: ~$15/month

---

#### 6. Maintenance Automation (10 workflows)

**A. Maintenance Ticket Classification**
```
Trigger: New maintenance request
↓
AI: Classify issue
Category: Plumbing, Electrical, Structural, Appliance, Security
Urgency: Emergency, Urgent, Standard, Low
↓
Auto-assign to appropriate contractor
↓
Send notification
↓
Create work order
↓
Schedule follow-up
```

**n8n Nodes**: Webhook → OpenAI → Postgres → HTTP Request (SMS/Email)
**Cost**: ~$10/month

**B. Contractor Quote Comparison**
```
Trigger: 3+ quotes received for same job
↓
AI: Analyze and compare quotes
- Price comparison
- Scope of work analysis
- Timeline comparison
- Recommendation
↓
Generate comparison report
↓
Send to landlord for decision
```

**n8n Nodes**: Trigger → Postgres → OpenAI → PDF Generator → SendGrid
**Cost**: ~$5/month

---

#### 7. Marketing Automation (20 workflows)

**A. Social Media Content Generation**
```
Trigger: New property listed
↓
AI: Generate social media posts
├─ Facebook post (engaging, emojis)
├─ Instagram caption (hashtags)
├─ LinkedIn post (professional)
└─ Twitter post (concise)
↓
Create Canva design via API (optional)
↓
Queue for approval
↓
Schedule posts
```

**n8n Nodes**: Trigger → OpenAI (x4) → Postgres → Buffer API
**Cost**: ~$15/month

**B. Market Report Generation**
```
Trigger: Weekly (Monday 8 AM)
↓
HTTP Request: Fetch market data from Lightstone/Loom
↓
AI: Generate market insights
- Price trends
- Sales velocity
- Inventory levels
- Recommendations
↓
Generate PDF report
↓
Email to all clients
↓
Post to blog
```

**n8n Nodes**: Schedule → HTTP Request → OpenAI → PDF Generator → SendGrid → WordPress
**Cost**: ~$50/month (includes data API costs)

---

## 💰 COST BREAKDOWN

### Monthly Operating Costs

| Component | Service | Cost/Month |
|-----------|---------|------------|
| **n8n Hosting** | Self-hosted on AWS/DigitalOcean | $50-100 |
| **AI (Primary)** | OpenAI GPT-3.5 | $150-250 |
| **AI (Fallback)** | Claude Instant | $50-100 |
| **Email** | SendGrid (100K emails) | $90 |
| **SMS** | Twilio (~5,000 SMS) | $375 |
| **WhatsApp** | Meta Business API | $50-100 |
| **OCR** | Google Vision API | $30-50 |
| **PDF Generation** | PDF.co API | $20 |
| **Monitoring** | Better Uptime + Logs | $30 |
| **Total** | | **$845-1,115/month** |

### Cost Optimization Strategies

1. **Use Local LLM for simple tasks**: Save ~$100/month
2. **Batch AI requests**: Reduce API calls by 40%
3. **Implement caching**: Cache AI responses for repeated queries
4. **Use free tiers**: Gemini Pro free tier for low-priority tasks
5. **Smart routing**: Use cheaper models for simple tasks

**Optimized Monthly Cost**: $400-600

---

## 🔧 n8n WORKFLOW EXAMPLES

### Example 1: Complete Tenant Communication Workflow

```json
{
  "name": "Tenant Inquiry Auto-Response",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "name": "WhatsApp Webhook",
      "webhookId": "whatsapp-inquiry"
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Get Tenant Details",
      "operation": "select",
      "query": "SELECT * FROM contacts WHERE phone = '{{$json.body.from}}'"
    },
    {
      "type": "n8n-nodes-base.openAi",
      "name": "Classify Intent",
      "model": "gpt-3.5-turbo",
      "messages": [
        {
          "role": "system",
          "content": "Classify tenant inquiry into: RENT_PAYMENT, MAINTENANCE, GENERAL, URGENT"
        },
        {
          "role": "user",
          "content": "={{$json.body.message}}"
        }
      ]
    },
    {
      "type": "n8n-nodes-base.switch",
      "name": "Route by Intent"
    },
    {
      "type": "n8n-nodes-base.openAi",
      "name": "Generate Response",
      "model": "gpt-3.5-turbo"
    },
    {
      "type": "n8n-nodes-base.whatsappBusiness",
      "name": "Send WhatsApp Reply"
    },
    {
      "type": "n8n-nodes-base.postgres",
      "name": "Log Communication",
      "operation": "insert"
    }
  ]
}
```

### Example 2: Rent Reminder Sequence

```javascript
// Code Node: Calculate Reminder Schedule
const items = $input.all();

const reminders = items.map(item => {
  const tenant = item.json;
  const today = new Date();
  const dueDate = new Date(tenant.rent_due_date);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  let reminderType = null;
  let urgency = 'low';
  
  if (daysUntilDue === 3) {
    reminderType = 'friendly_reminder';
    urgency = 'low';
  } else if (daysUntilDue === 0) {
    reminderType = 'due_today';
    urgency = 'medium';
  } else if (daysUntilDue === -3) {
    reminderType = 'overdue_notice';
    urgency = 'high';
  } else if (daysUntilDue === -7) {
    reminderType = 'final_notice';
    urgency = 'urgent';
  }
  
  return {
    json: {
      ...tenant,
      reminderType,
      urgency,
      daysUntilDue
    }
  };
}).filter(item => item.json.reminderType !== null);

return reminders;
```

---

## 🚀 IMPLEMENTATION PLAN

### Week 1-2: Infrastructure Setup
- [ ] Deploy n8n instance (Docker on AWS/DigitalOcean)
- [ ] Configure PostgreSQL database
- [ ] Set up webhook endpoints
- [ ] Configure credentials (OpenAI, Twilio, SendGrid)

### Week 3-4: Core Communication Workflows
- [ ] Email auto-responder
- [ ] SMS notification system
- [ ] WhatsApp Business integration
- [ ] Template management system

### Week 5-6: Property Management Workflows
- [ ] Listing syndication
- [ ] Property description generator
- [ ] Duplicate detection
- [ ] Photo processing pipeline

### Week 7-8: CRM & Lead Management
- [ ] Lead scoring AI
- [ ] Property matching engine
- [ ] Follow-up sequences
- [ ] Lead routing logic

### Week 9-12: Advanced Features
- [ ] Document OCR workflows
- [ ] Trust accounting automation
- [ ] Maintenance ticket routing
- [ ] Report generation

---

## 📊 SUCCESS METRICS

### Automation Efficiency
- [ ] 80% of tenant inquiries handled automatically
- [ ] 90% of rent reminders sent without human intervention
- [ ] 100% of listings syndicated within 5 minutes
- [ ] 70% reduction in agent admin time

### Cost Savings
- [ ] $50K+ saved in backend development
- [ ] 60% reduction in operational labor costs
- [ ] 8-12 weeks faster time-to-market

### Quality Metrics
- [ ] AI response accuracy >85%
- [ ] Customer satisfaction maintained or improved
- [ ] Zero compliance violations
- [ ] 99.5% workflow uptime

---

## ⚠️ RISK MITIGATION

### AI Hallucination Risk
- **Mitigation**: Human review for all financial/legal communications
- **Implementation**: Draft status for AI-generated content

### Workflow Failure Risk
- **Mitigation**: Error handling + fallback workflows
- **Implementation**: Dead letter queues, retry logic, alerting

### Data Privacy Risk
- **Mitigation**: No PII sent to AI without consent
- **Implementation**: Data masking, POPIA compliance checks

### Vendor Lock-in Risk
- **Mitigation**: Abstract AI provider, use open standards
- **Implementation**: OpenRouter integration, local LLM fallback

---

## 📚 NEXT STEPS

1. **Deploy n8n instance** (2 hours)
2. **Create first 5 core workflows** (1 week)
3. **Test with sample data** (1 week)
4. **Gradually migrate features** (ongoing)
5. **Monitor and optimize** (ongoing)

---

*Document Version: 1.0*  
*Created: 2026-03-23*  
*Estimated Savings: $500K+ over 2 years*
