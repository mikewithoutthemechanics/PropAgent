# Feature Specification: Property & Listing Management

**Feature Branch**: `003-property-listings`  
**Created**: 2026-03-23  
**Status**: Draft  
**Input**: User description: "Property and listing management system with comprehensive property details photo management and listing status workflow"

## Overview

A comprehensive property listing management system that allows property professionals to capture, organize, and manage property information. The system supports multiple property types (residential, commercial, industrial), detailed specifications, photo management, and a complete listing lifecycle from active to sold/leased.

## User Scenarios & Testing

### User Story 1 - Add New Property (Priority: P1)

As an agent, I want to add a new property with all relevant details so that I can market it to potential buyers or tenants.

**Why this priority**: Property creation is the core function - without it, no listings can be marketed.

**Independent Test**: Can be tested by creating a property and verifying all data is saved and retrievable.

**Acceptance Scenarios**:

1. **Given** an agent is logged in, **When** they add a new residential property, **Then** they can enter address, ERF number, property type, bedrooms, bathrooms, and price
2. **Given** a property has photos, **When** the agent uploads images, **Then** they are stored with the property and displayed in a gallery
3. **Given** a property is created, **When** the agent saves it, **Then** it appears in their property list with "Active" status
4. **Given** an agent is adding a property, **When** they try to save without required fields, **Then** they see validation errors highlighting missing information

---

### User Story 2 - Manage Listing Status (Priority: P1)

As an agent, I want to track the status of my listings through their lifecycle so that I know which properties are available, pending, or sold.

**Why this priority**: Status tracking is essential for managing the sales pipeline and avoiding double-sales.

**Independent Test**: Can be tested by changing a property status and verifying it moves through the workflow correctly.

**Acceptance Scenarios**:

1. **Given** a property is "Active", **When** an offer is accepted, **Then** the agent can change status to "Pending" and add buyer details
2. **Given** a property is "Pending", **When** transfer is complete, **Then** the agent can mark it as "Sold" with sale date and price
3. **Given** a property is "Active", **When** the mandate expires, **Then** the agent can mark it as "Withdrawn" with reason
4. **Given** a status change occurs, **When** viewing the property history, **Then** all status changes are logged with timestamps and user

---

### User Story 3 - Property Search & Filtering (Priority: P1)

As an agent, I want to search and filter properties so that I can quickly find specific listings in my portfolio.

**Why this priority**: With large portfolios, search is essential for efficiency.

**Independent Test**: Can be tested by searching with various criteria and verifying correct results.

**Acceptance Scenarios**:

1. **Given** an agent has 50+ properties, **When** they search by suburb name, **Then** only properties in that suburb are displayed
2. **Given** properties have different statuses, **When** filtering by "Active" status, **Then** only active properties are shown
3. **Given** a price range filter is applied, **When** viewing results, **Then** only properties within that price range are displayed
4. **Given** multiple filters are applied (suburb + status + price), **When** viewing results, **Then** only properties matching ALL criteria are shown

---

### User Story 4 - Property Matching for Clients (Priority: P2)

As an agent, I want to match properties to buyer requirements so that I can quickly identify suitable options for my clients.

**Why this priority**: Matching helps convert buyer inquiries into viewings, but requires property database to be populated first.

**Independent Test**: Can be tested by setting buyer criteria and verifying matching properties are identified.

**Acceptance Scenarios**:

1. **Given** a buyer wants 3 bedrooms in Umhlanga under R2M, **When** the agent runs property matching, **Then** only properties meeting ALL criteria are shown with match percentage
2. **Given** a property matches a buyer's wishlist, **When** the property is saved, **Then** the buyer receives an automatic notification
3. **Given** a buyer has multiple criteria, **When** properties are ranked, **Then** best matches appear first based on criteria weighting
4. **Given** no exact matches exist, **When** matching runs, **Then" near-matches are shown with clear indication of which criteria don't match

---

### Edge Cases

- What happens when a property address is entered incorrectly? The system validates addresses against a standard database and suggests corrections.
- How are duplicate properties prevented? System checks for matching ERF numbers or addresses and warns of potential duplicates.
- What if a property photo upload fails? Partial uploads are discarded; user is notified and can retry.
- How is property data handled when an agent leaves? Property ownership can be transferred to another agent or office admin.
- What happens to sold property data? Sold properties are archived but remain searchable for CMA and reporting purposes.

## Requirements

### Functional Requirements

- **FR-001**: System MUST support multiple property types: Residential (House, Apartment, Townhouse), Commercial (Office, Retail, Industrial), Agricultural, Vacant Land
- **FR-002**: System MUST capture property address including street, suburb, town, province, postal code, and GPS coordinates
- **FR-003**: System MUST store legal property details: ERF number, portion number, township, title deed number
- **FR-004**: System MUST support 50+ property specifications: bedrooms, bathrooms, garages, parking, floor size, stand size, year built, etc.
- **FR-005**: System MUST allow unlimited photo uploads per property with automatic watermarking option
- **FR-006**: System MUST support listing status workflow: Active, Pending, Sold, Leased, Withdrawn, Expired
- **FR-007**: System MUST track listing dates: mandate start, mandate expiry, listed date, status change dates
- **FR-008**: System MUST store pricing information: listing price, market value, seller's expectations, sold price
- **FR-009**: System MUST support property categorization by features (pool, security, pets allowed, furnished, etc.)
- **FR-010**: System MUST provide multiple property views: Grid view (spreadsheet style), Card view (thumbnail gallery), Map view (geographic)
- **FR-011**: System MUST support property search by address, suburb, ERF number, or owner name
- **FR-012**: System MUST support filtering by: status, property type, price range, bedrooms, bathrooms, suburb, listing date
- **FR-013**: System MUST maintain property history log: all edits, status changes, viewings, communications
- **FR-014**: System MUST allow duplicate property detection based on address or ERF number
- **FR-015**: System MUST support property matching against buyer wishlists with configurable criteria

### Key Entities

- **Property**: Address, GPS coordinates, ERF number, title deed, property type, status, listing price, description
- **PropertySpecification**: Bedrooms, bathrooms, garages, parking, floor size, stand size, year built, features (JSON)
- **PropertyPhoto**: Property ID, file URL, caption, is primary, order index, uploaded at
- **Listing**: Property ID, agent ID, office ID, mandate type (sole/open/multi), mandate start, mandate expiry, commission percentage
- **PropertyStatusHistory**: Property ID, old status, new status, changed by, changed at, reason
- **BuyerWishlist**: Contact ID, suburbs (array), min/max price, property types, bedrooms, bathrooms, features (JSON), created at

### Success Criteria

### Measurable Outcomes

- **SC-001**: Agent can add a new property with all details in under 5 minutes
- **SC-002**: Property search returns results in under 2 seconds for portfolios up to 10,000 properties
- **SC-003**: Photo upload supports up to 50 images per property with progress indication
- **SC-004**: Property matching identifies relevant properties within 3 seconds for up to 100 active properties
- **SC-005**: Status changes are reflected across all views within 5 seconds
- **SC-006**: Duplicate detection flags potential matches with 95%+ accuracy
- **SC-007**: Property history log captures 100% of edits with before/after values
- **SC-008**: Filter combinations return accurate results with zero false positives

### Assumptions

- Property address validation uses external geocoding service (Google Maps or similar)
- Photo storage uses cloud object storage (S3 or equivalent)
- Property types and features are configurable per region/market
- ERF numbers are unique identifiers in South African context
- Mandate tracking is required for compliance with estate agency regulations
