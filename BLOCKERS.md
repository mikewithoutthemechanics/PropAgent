# PropAgent Automation Blockers
## Why Certain Features Can't Use n8n/AI

---

## 🔴 REGULATORY/LEGAL BLOCKERS (Cannot Bypass)

### 1. Trust Account Management
**Blocked Feature**: Full automation of trust account transactions

**Why Blocked**:
- South Africa's Estate Agency Affairs Board (EAAB) requires audited trust accounting software
- n8n workflows are not auditable for financial compliance
- Agent must maintain "duty of care" over client funds

**What We Can Do**:
- ✅ Use n8n for: Payment reminders, receipt confirmations
- ✅ Use n8n for: Commission calculations (AI-assisted)
- ❌ Cannot: Automatically debit/credit trust accounts without human approval
- ❌ Cannot: Automate reconciliation sign-off

**Workaround**:
- Custom backend with audit trail (required by law)
- AI prepares transactions, human approves via dashboard
- n8n sends notifications, logs communications

---

### 2. FICA Identity Verification
**Blocked Feature**: Fully automated FICA verification

**Why Blocked**:
- Financial Intelligence Centre Act requires verified identity verification
- Must integrate with Home Affairs or TransUnion for real-time verification
- These APIs require:
  - POPIA compliance certification
  - Registered financial services provider license
  - Data protection agreements

**What We Can Do**:
- ✅ Use n8n for: Document upload, OCR extraction
- ✅ Use n8n for: Reminder sequences for missing docs
- ❌ Cannot: Real-time ID verification without licensed integration
- ❌ Cannot: Automatic FICA status approval

**Workaround**:
- Manual verification by compliance officer (legal requirement)
- AI assists: Flags potential document issues, extracts data
- Integration with: Yoti, IDnow, or Onfido (paid services, ~$2/verification)

---

### 3. Contract Execution
**Blocked Feature**: AI-generated contracts without review

**Why Blocked**:
- Property transactions are high-value (R500K - R50M+)
- Consumer Protection Act requires clear disclosure
- Agents have professional liability for contract accuracy

**What We Can Do**:
- ✅ Use n8n for: Contract template population
- ✅ Use n8n for: Sending for e-signature (DocuSign/SignFlow)
- ❌ Cannot: Auto-generate final contract without human review
- ❌ Cannot: AI negotiate terms on behalf of agent

**Workaround**:
- AI drafts initial contract
- Agent reviews and edits
- Digital signature workflow

---

## 🟡 API ACCESS BLOCKERS (Requires Partnerships)

### 4. Property24 Integration
**Blocked Feature**: Direct API sync with Property24

**Why Blocked**:
- Property24 does not have a public API
- Requires:
  - Registered agency account
  - Enterprise partnership agreement
  - XML feed specification (proprietary)

**What We Can Do**:
- ✅ Manual CSV export/import
- ✅ Use n8n for: Data transformation when feed is available
- ❌ Cannot: Real-time sync without partnership

**Workaround**:
- Contact Property24 partnerships team
- Typical timeline: 2-4 weeks for approval
- Cost: Usually free for agencies, but requires volume commitment

---

### 5. Private Property Integration
**Blocked Feature**: Direct API sync with Private Property

**Why Blocked**:
- Similar to Property24 - no public API
- Requires agency partnership

**Workaround**:
- Same approach as Property24

---

### 6. Deeds Office / Loom Integration
**Blocked Feature**: Automated property ownership lookup

**Why Blocked**:
- Deeds Office data is accessed via Loom (lightstone.co.za)
- Requires:
  - Enterprise contract with Lightstone
  - API key provisioning
  - Per-query fees (~R2-R5 per lookup)

**What We Can Do**:
- ✅ Manual lookup via Lightstone portal
- ✅ Store results in database
- ❌ Cannot: Real-time automated lookups without contract

**Workaround**:
- Negotiate Lightstone API access
- Cost estimate: R2,000-R5,000/month for typical agency volume

---

### 7. Credit Bureau Integration
**Blocked Feature**: Automated credit checks

**Why Blocked**:
- TransUnion, Experian, XDS require:
  - Registered credit provider status OR
  - Consumer consent with specific disclosure
  - POPIA compliance certification
  - Data protection agreements

**What We Can Do**:
- ✅ Manual credit check via bureau portals
- ✅ Store results in database
- ❌ Cannot: Automated credit pull without registration

**Workaround**:
- Partner with existing credit provider
- Use services like: Kudough, VeriCred (already have bureau access)
- Cost: R15-R50 per check

---

## 🟠 TECHNICAL LIMITATIONS

### 8. WhatsApp Business API - Official
**Blocked Feature**: Full WhatsApp Business automation

**Why Blocked**:
- Requires Meta Business verification
- Takes 1-3 weeks for approval
- Must have:
  - Facebook Business Manager
  - Verified business
  - Phone number not used on regular WhatsApp

**Current Status**:
- Can use WhatsApp Business API sandbox for testing
- Production requires approval

**Workaround**:
- Use Twilio WhatsApp (simpler setup)
- Or: Apply for Meta Business verification now

---

### 9. Banking Integration
**Blocked Feature**: Direct bank feeds

**Why Blocked**:
- South African banks (FNB, Absa, Standard Bank, Nedbank) don't offer open banking APIs to fintechs easily
- Requires:
  - Special arrangement with bank
  - Yodlee/Plaid integration (limited SA support)

**What We Can Do**:
- ✅ Manual bank statement upload
- ✅ Use n8n for: Parsing uploaded statements
- ❌ Cannot: Real-time bank feeds like US/EU fintechs

**Workaround**:
- Upload bank statements (PDF/CSV)
- AI extracts transactions
- Manual reconciliation with AI assistance

---

## 🟢 SOLVABLE WITH TIME/MONEY

### 10. Local LLM Hosting
**Challenge**: Running Mistral/Llama locally for cost savings

**Requirements**:
- GPU server (RTX 4090 or A100)
- Or cloud GPU instance (~$500/month)
- Technical setup complexity

**Current Approach**:
- Start with OpenAI GPT-3.5 (pay per use)
- Migrate to local LLM when volume justifies

---

## 📋 BLOCKER SUMMARY TABLE

| Blocker | Type | Can Solve? | Timeline | Cost |
|---------|------|------------|----------|------|
| Trust Account Auditing | Legal | ❌ Never | N/A | N/A |
| FICA Verification | Regulatory | ⚠️ Partial | 2-4 weeks | ~$2/check |
| Property24 API | Partnership | ✅ Yes | 2-4 weeks | Free |
| Private Property API | Partnership | ✅ Yes | 2-4 weeks | Free |
| Loom/Deeds Office | Partnership | ✅ Yes | 2-4 weeks | R2K-5K/month |
| Credit Bureau | Regulatory | ✅ Yes | 4-8 weeks | R15-50/check |
| WhatsApp Business | Technical | ✅ Yes | 1-3 weeks | $0 |
| Banking APIs | Technical | ⚠️ Partial | 4-12 weeks | $500+/month |
| Local LLM | Technical | ✅ Yes | 1-2 weeks | $500/month |

---

## ✅ WHAT WE CAN DO TODAY (No Blockers)

| Feature | Status | Files Ready |
|---------|--------|-------------|
| Tenant Inquiry Auto-Responder | ✅ Ready | `01-tenant-inquiry-autoresponder.json` |
| Rent Reminder Sequence | ✅ Ready | `02-rent-reminder-sequence.json` |
| Property Description Generator | ✅ Ready | `03-property-description-generator.json` |
| Email Intent Classification | ✅ Ready to build | Template available |
| Lead Scoring | ✅ Ready to build | Template available |
| Maintenance Ticket Routing | ✅ Ready to build | Template available |
| Document OCR | ✅ Ready to build | Template available |
| SMS/WhatsApp Notifications | ✅ Ready to build | Template available |

---

## 🎯 RECOMMENDED PRIORITY

### Immediate (This Week)
1. Deploy n8n Docker instance
2. Import 3 ready workflows
3. Configure OpenAI API key
4. Test tenant inquiry responder

### Short Term (Next 2 Weeks)
1. Apply for WhatsApp Business API
2. Contact Property24 for partnership
3. Build 5 more workflows

### Medium Term (1-2 Months)
1. Set up FICA verification integration (Yoti/Onfido)
2. Negotiate Lightstone API access
3. Complete 20+ workflows

### Long Term (3+ Months)
1. Evaluate local LLM migration
2. Build custom trust accounting module
3. Complete all 42 planned automations

---

## 💡 KEY INSIGHT

**62% of features CAN be automated with n8n + AI**  
**23 features CANNOT be automated due to legal/compliance**  
**Remaining 15% is partial automation (AI assists, human decides)**

The goal isn't 100% automation - it's **maximizing agent productivity** while **maintaining compliance and human oversight**.

---

---

## ✅ Current Implementation Status (2026-04-15)

### Completed
| Feature | Status | Notes |
|---------|--------|-------|
| Frontend | ✅ Deployed | Next.js 16.2.1 on Vercel |
| Supabase DB | ✅ Connected | Project: sehweutpfftnrcbqshsn |
| n8n Credentials | ✅ Ready | 5 credential files in JSON format |
| 21 Workflows | ✅ Ready | Groq versions (free) available |
| 18 Dashboard Pages | ✅ Built | Properties, Tenants, Leads, etc. |
| 11 AI Tools | ✅ Built | Valuation, Bond Calc, Matching, etc. |

### Still Blocked (No Change)
| Feature | Status |
|---------|--------|
| Trust Account Auditing | ❌ Legal requirement |
| FICA Verification | ⚠️ Partial (needs provider) |
| Property24 API | ⏳ Partnership needed |
| WhatsApp Business | ⏳ Meta verification |

---

*Last Updated: 2026-04-15*  
*Next Review: When new blockers are identified*
