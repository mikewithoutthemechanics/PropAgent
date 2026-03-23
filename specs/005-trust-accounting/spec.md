# Feature Specification: Trust Accounting & Financial Management

**Feature Branch**: `005-trust-accounting`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "Trust accounting system with rent collection, landlord disbursements, commission tracking and FICA compliance for South Africa"

## Overview

A comprehensive trust accounting system that enables property management agencies to manage client funds in compliance with South African estate agency regulations. The system handles rent collection, landlord disbursements, contractor payments, and commission calculations with full audit trails required for Fidelity Fund Certificate compliance.

## User Scenarios & Testing

### User Story 1 - Record Rent Collection (Priority: P1)

As a property manager, I want to record tenant rent payments so that landlords receive their disbursements accurately and on time.

**Why this priority**: Rent collection is the core financial transaction - without it, no other financial features function.

**Independent Test**: Can be tested by recording a payment and verifying it's correctly allocated to the tenant and property.

**Acceptance Scenarios**:

1. **Given** a tenant pays rent via EFT, **When** the property manager records the payment, **Then** it's linked to the tenant, property, and invoice period
2. **Given** a rent payment is recorded, **When** saved, **Then** the tenant's balance is updated and a receipt is generated
3. **Given** a tenant has arrears, **When** a payment is recorded, **Then** it's allocated to oldest outstanding amounts first
4. **Given** a batch of payments arrives, **When** imported, **Then** each is matched to the correct tenant using reference numbers

---

### User Story 2 - Disburse Funds to Landlord (Priority: P1)

As a property manager, I want to pay landlords their rental income minus fees so that they receive their money on schedule.

**Why this priority**: Landlord payments are the primary outbound transaction and a key service promise.

**Independent Test**: Can be tested by processing a landlord payment and verifying the calculation and bank file generation.

**Acceptance Scenarios**:

1. **Given** it's month-end, **When** the disbursement batch runs, **Then** all landlords with positive balances are included in the payment batch
2. **Given** a landlord has multiple properties, **When** disbursing, **Then** a single consolidated payment is generated with breakdown per property
3. **Given** a property has management fees, **When** calculating disbursement, **Then** fees are deducted and clearly shown on the landlord statement
4. **Given** a disbursement is processed, **When** completed, **Then** a payment file is generated for bank upload and landlords receive email notification

---

### User Story 3 - Calculate and Track Commission (Priority: P1)

As an agent, I want my commission calculated automatically when deals close so that I know what I'm owed and when I'll be paid.

**Why this priority**: Commission tracking is critical for agent motivation and retention.

**Independent Test**: Can be tested by closing a deal and verifying commission is calculated correctly per the agency's structure.

**Acceptance Scenarios**:

1. **Given** a property sells for R1,000,000 with 5% commission, **When** the deal closes, **Then** commission is calculated as R50,000
2. **Given** an agent has a 70% commission split, **When** the deal closes, **Then** the agent's commission is R35,000 and agency gets R15,000
3. **Given** a deal involves a referral agent, **When** calculating commission, **Then** the referral fee is deducted before the split
4. **Given** commission is calculated, **When** viewing the agent statement, **Then** all deals, splits, and deductions are itemized clearly

---

### User Story 4 - Track and Manage Arrears (Priority: P2)

As a property manager, I want to track rent arrears automatically so that I can take action before situations escalate.

**Why this priority**: Arrears management is critical for cash flow but can be added after basic collection works.

**Independent Test**: Can be tested by simulating missed payments and verifying arrears tracking and notifications work.

**Acceptance Scenarios**:

1. **Given** a tenant misses a rent payment, **When** the due date passes, **Then** the arrears report shows the outstanding amount with days overdue
2. **Given** a tenant is 7 days in arrears, **When** the arrears workflow runs, **Then** an automated reminder is sent to the tenant
3. **Given** a tenant is 21 days in arrears, **When** the escalation triggers, **Then** the landlord and property manager receive an alert
4. **Given** viewing the arrears dashboard, **When" checking status, **Then** all overdue amounts are shown by property with tenant contact details

---

### Edge Cases

- What happens if a tenant overpays? Overpayment is recorded as a credit on their account and applied to future rent or refunded.
- How are bounced payments handled? Bounced payments reverse the transaction, add a fee to tenant account, and trigger follow-up workflow.
- What if a landlord disputes a calculation? Full transaction history with audit trail is available; adjustments require authorization.
- How is trust account reconciliation handled? Daily automated reconciliation with bank feed; exceptions flagged for review.

## Requirements

### Functional Requirements

- **FR-001**: System MUST maintain strict separation of trust funds from agency operating funds
- **FR-002**: System MUST record all rent payments with: tenant, property, amount, date, payment method, reference number
- **FR-003**: System MUST generate rent invoices automatically based on lease terms
- **FR-004**: System MUST calculate landlord disbursements: rent collected minus management fees, repairs, other deductions
- **FR-005**: System MUST generate EFT payment files for bank upload (Standard Bank, ABSA, FNB, Nedbank formats)
- **FR-006**: System MUST calculate commission on sales and rentals per configurable commission structures
- **FR-007**: System MUST support complex commission splits: agent, agency, referral, franchise fees
- **FR-008**: System MUST track arrears: days overdue, escalation status, reminder history
- **FR-009**: System MUST send automated payment reminders: 3 days before due, on due date, 3 days after, 7 days after
- **FR-010**: System MUST generate landlord statements: monthly summary of income, expenses, and disbursements
- **FR-011**: System MUST generate tenant statements: payment history and current balance
- **FR-012**: System MUST track contractor payments for maintenance work with invoice linking
- **FR-013**: System MUST support multiple trust accounts per agency (per office or property type)
- **FR-014**: System MUST provide daily trust account reconciliation: bank balance vs. system balance
- **FR-015**: System MUST maintain complete audit trail: who created/modified each transaction, when, and from what IP

### Key Entities

- **TrustAccount**: Account number, bank, branch, balance, currency, status, created at
- **Transaction**: Trust account ID, type (income/expense/transfer), amount, date, reference, description, related entity
- **RentPayment**: Property ID, tenant ID, invoice ID, amount, payment date, method, reference, allocated to
- **LandlordDisbursement**: Property ID, landlord ID, period start/end, gross rent, deductions (JSON), net amount, status
- **CommissionStructure**: Name, sales percentage, rental percentage, agent split percentage, referral fee percentage
- **Commission**: Deal ID, agent ID, commission structure ID, gross commission, deductions, net commission, status
- **Arrears**: Tenant ID, property ID, invoice ID, amount overdue, days overdue, escalation level, last reminder date
- **AuditLog**: Table name, record ID, action (create/update/delete), old values, new values, user ID, timestamp, IP address

### Success Criteria

### Measurable Outcomes

- **SC-001**: Rent payment can be recorded in under 1 minute
- **SC-002**: Landlord disbursements calculated accurately to the cent (100% accuracy)
- **SC-003**: Commission calculations match manual calculations 100% of the time
- **SC-004**: Arrears report generated in under 3 seconds for portfolios up to 1,000 properties
- **SC-005**: Trust account reconciliation identifies discrepancies within 24 hours
- **SC-006**: Automated reminders sent within 1 hour of scheduled time
- **SC-007**: Landlord statements generated and emailed automatically by 5th of each month
- **SC-008**: Audit trail captures 100% of financial transactions with no gaps

### Assumptions

- Trust accounting follows Estate Agency Affairs Board (EAAB) / PPRA regulations
- Bank integration uses file-based exchange (no direct API)
- Multiple currencies not required for initial release (ZAR only)
- VAT/GST calculations are outside scope for MVP
- Integration with accounting software (Xero, QuickBooks) is Phase 2
