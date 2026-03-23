# Feature Specification: CRM & Contact Management

**Feature Branch**: `004-crm-contacts`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "CRM and contact management system for buyers, sellers, tenants, and landlords with communication history"

## Overview

A comprehensive customer relationship management system designed for real estate professionals to manage relationships with buyers, sellers, tenants, landlords, and other stakeholders. The system tracks contact information, communication history, property preferences, and engagement levels to help agents nurture leads and close deals.

## User Scenarios & Testing

### User Story 1 - Add and Manage Contacts (Priority: P1)

As an agent, I want to add and organize my contacts so that I can maintain relationships with buyers, sellers, and other stakeholders.

**Why this priority**: Contact management is foundational - every deal starts with a contact.

**Independent Test**: Can be tested by creating contacts and verifying data is saved and retrievable.

**Acceptance Scenarios**:

1. **Given** an agent is logged in, **When** they add a new buyer contact, **Then** they can capture name, email, phone, ID number (for FICA), and property requirements
2. **Given** a contact exists, **When** the agent views their profile, **Then** they see all contact details, communication history, and related deals
3. **Given** multiple contacts exist, **When** the agent searches by name or phone, **Then** matching contacts are displayed instantly
4. **Given** an agent is on a call, **When** they add a contact note, **Then** it's timestamped and linked to the contact record

---

### User Story 2 - Track Communication History (Priority: P1)

As an agent, I want all communications with a contact logged automatically so that I have a complete history of our relationship.

**Why this priority**: Communication history is critical for providing context in conversations and maintaining professional standards.

**Independent Test**: Can be tested by sending emails/calls and verifying they appear in the contact timeline.

**Acceptance Scenarios**:

1. **Given** an agent sends an email to a contact, **When** the email is delivered, **Then** it appears in the contact's communication timeline
2. **Given** a contact replies to an email, **When** the reply is received, **Then** it's linked to the original thread and contact record
3. **Given** an agent makes a call, **When** they log the call outcome, **Then** it's recorded with duration, notes, and follow-up date
4. **Given** viewing a contact timeline, **When** reviewing history, **Then** all interactions are shown chronologically with filtering by type (email, call, meeting, SMS)

---

### User Story 3 - Capture Lead from Multiple Sources (Priority: P1)

As an agent, I want leads captured automatically from property portals and my website so that no inquiry falls through the cracks.

**Why this priority**: Automated lead capture ensures fast response times and prevents lost opportunities.

**Independent Test**: Can be tested by submitting a lead through a portal form and verifying it appears in the CRM.

**Acceptance Scenarios**:

1. **Given** a buyer submits an inquiry on Property24, **When** the inquiry is received, **Then** a new contact is created (or existing matched) with inquiry details
2. **Given** a website visitor fills a contact form, **When** submitted, **Then** the lead appears in the CRM within 1 minute with source attribution
3. **Given** a lead matches an existing contact by email, **When** imported, **Then** it's linked to the existing record with inquiry added to history
4. **Given** a new lead arrives, **When** assigned to an agent, **Then** the agent receives notification and the lead appears in their dashboard

---

### User Story 4 - Manage Buyer Wishlists (Priority: P2)

As an agent, I want to record buyer requirements so that I can match them with suitable properties.

**Why this priority**: Wishlists enable proactive property matching, but require properties to exist first.

**Independent Test**: Can be tested by creating a wishlist and verifying property matching works.

**Acceptance Scenarios**:

1. **Given** a buyer wants 3 bedrooms in Umhlanga, **When** the agent records their wishlist, **Then** suburbs, price range, and requirements are saved
2. **Given** a new property is listed matching a wishlist, **When** saved, **Then** the matching buyer is notified automatically
3. **Given** a buyer updates their requirements, **When** changes are saved, **Then** new matches are calculated and notifications sent
4. **Given** viewing a buyer's profile, **When** checking wishlist, **Then** all requirements and current matches are displayed

---

### Edge Cases

- What happens when a contact requests data deletion (POPIA)? Contact is anonymized for compliance but transaction history is retained for legal requirements.
- How are duplicate contacts handled? System suggests merges based on email/phone match with user confirmation.
- What if a contact opts out of all communications? All communication preferences are disabled and no automated messages are sent.
- How is contact ownership transferred when an agent leaves? Contacts can be bulk-transferred to another agent with full history preserved.

## Requirements

### Functional Requirements

- **FR-001**: System MUST support contact types: Buyer, Seller, Tenant, Landlord, Investor, Developer, Vendor, Other
- **FR-002**: System MUST capture contact details: name, email, phone (multiple), ID number (for FICA), company name, job title
- **FR-003**: System MUST store physical address: street, suburb, city, province, postal code for FICA compliance
- **FR-004**: System MUST track FICA status: documents received, verified, expiry dates
- **FR-005**: System MUST log all communications: email, SMS, WhatsApp, calls, meetings with timestamps
- **FR-006**: System MUST support email integration (IMAP/SMTP) to automatically sync emails with contacts
- **FR-007**: System MUST capture lead source: portal (Property24, etc.), website, walk-in, referral, bulk import
- **FR-008**: System MUST support contact tagging: unlimited custom tags for flexible categorization
- **FR-009**: System MUST support smart lists: dynamic segments based on criteria (buyers in Umhlanga, etc.)
- **FR-010**: System MUST track contact lifecycle: Lead → Prospect → Active Client → Past Client
- **FR-011**: System MUST support buyer wishlists: suburbs, price range, property type, bedrooms, features
- **FR-012**: System MUST implement automated property matching between wishlists and available properties
- **FR-013**: System MUST track POPIA consent: opt-in status, consent date, communication preferences per channel
- **FR-014**: System MUST support contact import: bulk Excel/CSV import with duplicate detection
- **FR-015**: System MUST provide contact activity scoring: engagement-based prioritization

### Key Entities

- **Contact**: Type, first name, last name, email, phones, ID number, address, company, position, source, lifecycle stage, assigned agent
- **ContactCommunication**: Contact ID, type (email/SMS/call/meeting), direction (inbound/outbound), content, timestamp, agent ID
- **BuyerWishlist**: Contact ID, suburbs (array), min/max price, property types, bedrooms, bathrooms, features (JSON), created/updated at
- **ContactTag**: Name, color, description, created by
- **ContactTagAssignment**: Contact ID, tag ID, assigned at
- **ContactConsent**: Contact ID, channel (email/SMS/WhatsApp), opted in, opted in at, opted out at, ip address
- **SmartList**: Name, criteria (JSON - query for dynamic filtering), created by

### Success Criteria

### Measurable Outcomes

- **SC-001**: Agent can add a new contact in under 2 minutes
- **SC-002**: Contact search returns results in under 1 second for databases up to 100,000 contacts
- **SC-003**: Email integration syncs messages within 2 minutes of receipt
- **SC-004**: Property matching identifies relevant properties with 90%+ relevance accuracy
- **SC-005**: Lead capture from portals creates contact within 1 minute
- **SC-006**: Contact activity scoring correctly identifies hot leads (80%+ correlation with conversion)
- **SC-007**: Bulk import processes 1,000 contacts in under 2 minutes with duplicate detection
- **SC-008**: POPIA consent tracking shows 100% compliance on all outbound communications

### Assumptions

- Email integration uses standard IMAP/SMTP protocols
- Portal lead integration uses email parsing or API webhooks
- Contact matching uses fuzzy logic for name/phone similarity
- FICA documents are stored in document management system (linked)
- SMS/WhatsApp integration handled by separate communication feature
