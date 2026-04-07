# PropAgent Dashboard UI Design Specification

## Executive Professional Style — Property Management Platform

---

## 1. Design Philosophy

The PropAgent dashboard embodies **Executive Professional**: authoritative, trustworthy, and distinctly South African. The design leverages the brand's premium color palette to create a workspace that feels like a command center for property professionals.

**Guiding Principles:**
- **Information Density:** High-level metrics visible at a glance, drill-down available on demand
- **Color as Meaning:** Navy establishes hierarchy, gold rewards attention, blue enables action
- **Professional Breathing:** Generous whitespace prevents cognitive overload
- **Trust Through Clarity:** Every element communicates competence and reliability

---

## 2. Color Application

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary Background | Deep Navy | `#1E3A5F` | Sidebar, headers, hero sections |
| Accent/Highlight | Muted Gold | `#C9A227` | KPI values, premium badges, key metrics |
| Interactive | Bright Blue | `#2D9CDB` | Buttons, links, hover states |
| Surface | Off-White | `#F8FAFC` | Card backgrounds, content areas |
| Surface Alt | White | `#FFFFFF` | Input fields, table rows |
| Text Primary | Charcoal | `#2C3E50` | Headlines, body text |
| Text Secondary | Slate | `#64748B` | Captions, supporting text |
| Success | Emerald | `#10B981` | Positive status, paid rent |
| Warning | Amber | `#F59E0B` | Pending items, overdue alerts |
| Danger | Rose | `#EF4444` | Critical alerts, urgent maintenance |

---

## 3. Layout Structure

### 3.1 Overall Grid

```
+------------------+----------------------------------------+
|                  |           TOP BAR (64px)               |
|    SIDEBAR       |  [Search] [Notifications] [Profile]    |
|    (260px)       +----------------------------------------+
|                  |                                        |
|  [Logo]          |           MAIN CONTENT                 |
|                  |                                        |
|  - Dashboard     |  +----------------------------------+  |
|  - Properties    |  |       HERO METRICS (4 cards)      |  |
|  - Tenants       |  +----------------------------------+  |
|  - Rent          |                                        |
|  - Maintenance   |  +------------------+-----------------+ |
|  - Leads         |  |  PROPERTY MAP    |  ACTIVITY FEED  | |
|  - Reports      |  |                  |                 | |
|                  |  +------------------+-----------------+ |
|  [Settings]      |                                        |
|  [Help]         |  +------------------+-----------------+ |
|                  |  |  RENT TRENDS    |  MAINTENANCE    | |
|                  |  |  CHART          |  TICKETS        | |
+------------------+----------------------------------------+
```

### 3.2 Responsive Breakpoints

| Breakpoint | Width | Sidebar Behavior |
|------------|-------|-------------------|
| Desktop XL | ≥1440px | Full 260px, expanded labels |
| Desktop | 1200-1439px | Full 260px, icon-only labels |
| Tablet | 768-1199px | Collapsed 72px, hamburger menu |
| Mobile | <768px | Hidden, bottom navigation |

---

## 4. Component Hierarchy

### 4.1 Sidebar Navigation

**Structure:**
```
[PropAgent Logo - 48px]
━━━━━━━━━━━━━━━━━━━━

DASHBOARD        [icon + label]
PROPERTIES       [icon + label + count badge]
TENANTS          [icon + label + count badge]
RENT             [icon + label + alert dot]
MAINTENANCE      [icon + label + urgent count]
LEADS            [icon + label + hot count]
REPORTS          [icon + label]

━━━━━━━━━━━━━━━━━━━━
[Settings]       [icon]
[Help & Support] [icon]
```

**Styling:**
- Background: Deep Navy `#1E3A5F`
- Active item: Navy with 10% white overlay
- Active indicator: 4px Gold left border
- Hover: 5% white overlay
- Icon color (inactive): Slate `#64748B`
- Icon color (active): Gold `#C9A227`
- Text (inactive): White 70% opacity
- Text (active): White

### 4.2 Top Bar

**Height:** 64px  
**Background:** White with 1px bottom border `#E2E8F0`

**Elements:**
- **Search Bar:** 400px wide, rounded 8px, placeholder "Search properties, tenants..."
- **Notifications:** Bell icon with red dot for unread count
- **Quick Actions:** "+ Add Property" primary button (Blue)
- **Profile Menu:** Avatar 40px, dropdown on click

### 4.3 Metric Cards (Hero Section)

**Layout:** 4 cards in a row, 24px gap

**Card Structure:**
```
┌─────────────────────────────────┐
│ [Icon - 24px, Slate]            │
│ "Total Properties"    [? Help]  │
│                                 │
│ "127"                 ▲ 12%     │
│                                 │
│ vs last month                  │
└─────────────────────────────────┘
```

**Card Variations:**

| Metric | Value Color | Trend Color | Icon |
|--------|-------------|-------------|------|
| Total Properties | Navy `#1E3A5F` | Green/Red | Building |
| Occupied Units | Navy | Green | Users |
| Monthly Revenue | Gold `#C9A227` | Green | Rand sign |
| Pending Actions | Navy | Amber | Alert circle |

**Styling:**
- Card size: Flexible, min 200px
- Background: White `#FFFFFF`
- Border: 1px `#E2E8F0`
- Border radius: 12px
- Padding: 24px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Value font: Playfair Display, 36px, 700 weight
- Label font: Inter, 14px, Slate color

### 4.4 Property Map Card

**Size:** 60% of content width  
**Height:** 400px

**Content:**
- Interactive map showing property locations
- Cluster markers for dense areas
- Property pins in Navy with Gold active state
- Side panel listing visible properties
- Filter dropdown: "All", "Available", "Occupied", "Maintenance"

### 4.5 Activity Feed Card

**Size:** 40% of content width  
**Height:** 400px

**Content:**
- Scrollable list of recent activities
- Activity types: Rent paid, lease signed, maintenance completed, inquiry received
- Each item shows: Icon, description, timestamp, property reference
- "View All" link at bottom

**Activity Item Styling:**
```
[Icon - 20px]  John Doe paid R12,500 rent    2h ago
              Unit 4B, Sandton Heights
```

### 4.6 Rent Collection Chart

**Type:** Area chart with gradient fill  
**Data:** Monthly rent collected over 12 months

**Styling:**
- Line color: Gold `#C9A227`
- Fill: Gold 20% opacity to 0%
- Grid lines: Slate 10% opacity
- Axis labels: Inter 12px, Slate
- Tooltip: White card with shadow

### 4.7 Maintenance Tickets Panel

**Content:**
- Table with columns: Property, Issue, Priority, Status, Created
- Priority badges: High (Rose), Medium (Amber), Low (Blue)
- Status chips: New, In Progress, Scheduled, Completed
- Sort by: Date, Priority, Property
- Quick actions: Assign, Update status

### 4.8 Lead Pipeline

**Type:** Kanban-style horizontal columns  
**Columns:** New, Contacted, Viewing, Negotiating, Closed

**Lead Card:**
```
┌────────────────────────────┐
│ [Property Thumbnail]      │
│ 3 Bed Flat • R15,000/mo   │
│ Parklands, Cape Town      │
│                            │
│ ●●○○○ Lead Score: 72      │
│                            │
│ [View Profile] [Schedule]│
└────────────────────────────┘
```

---

## 5. UI Patterns

### 5.1 Data Tables

**Features:**
- Sticky header row
- Alternating row colors (White / Off-White)
- Row hover: Navy 5% overlay
- Checkbox selection column
- Column sorting indicators
- Pagination: 25/50/100 per page

**Cell Types:**
- Text: Charcoal
- Currency: Gold, right-aligned
- Status: Colored chip/pill
- Date: Slate, relative format ("2 days ago")
- Action: Blue link/button

### 5.2 Form Inputs

**Standard Input:**
```
┌─────────────────────────────┐
│ Label                       │
│ [Input field content    ]   │
│ Supporting text             │
└─────────────────────────────┘
```

- Background: White
- Border: 1px `#CBD5E1`
- Focus border: 2px Blue `#2D9CDB`
- Border radius: 8px
- Padding: 12px 16px
- Label: Inter 14px, Charcoal, 500 weight

**Dropdown:**
- Chevron icon in Slate
- Selected item in Charcoal
- Options list: White with shadow

### 5.3 Buttons

| Type | Background | Text | Border | Usage |
|------|------------|------|--------|-------|
| Primary | Blue `#2D9CDB` | White | None | Main actions |
| Secondary | White | Navy | 1px Navy | Secondary actions |
| Ghost | Transparent | Slate | None | Tertiary actions |
| Danger | Rose `#EF4444` | White | None | Destructive |
| Success | Emerald `#10B981` | White | None | Confirmations |

**Button Sizes:**
- Large: 48px height, 24px padding
- Medium: 40px height, 16px padding
- Small: 32px height, 12px padding

### 5.4 Cards (Generic)

**Structure:**
```
┌───────────────────────────────────┐
│ [Header - Optional]               │
│ Title           [Action button]  │
├───────────────────────────────────┤
│ Content area                      │
│                                   │
├───────────────────────────────────┤
│ [Footer - Optional]              │
│ Footer content    [Link]         │
└───────────────────────────────────┘
```

**Styling:**
- Background: White
- Border: 1px `#E2E8F0`
- Border radius: 12px
- Padding: 24px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)`
- Hover shadow: `0 4px 12px rgba(0,0,0,0.15)`

### 5.5 Status Badges

| Status | Background | Text Color | Border |
|--------|------------|------------|--------|
| Available | Blue 10% | Blue | Blue |
| Occupied | Emerald 10% | Emerald | Emerald |
| Overdue | Rose 10% | Rose | Rose |
| Pending | Amber 10% | Amber | Amber |
| New | Navy 10% | Navy | Navy |

### 5.6 Data Visualization Guidelines

**Charts should use:**
- Gold for primary data series
- Blue for secondary series
- Navy for tertiary (if needed)
- Slate for grid lines and labels
- Consistent 8px grid for alignment

**Chart Types by Data:**
- **Trends over time:** Area chart (rent collection, occupancy)
- **Comparisons:** Horizontal bar chart (property performance)
- **Distributions:** Donut chart (property types, status)
- **Part-to-whole:** Stacked bar (revenue by property)

---

## 6. Navigation & Interaction

### 6.1 Primary Navigation Flow

```
Dashboard (Home)
    ├── Quick Stats
    ├── Property Map
    ├── Activity Feed
    └── Recent Actions

Properties
    ├── Property List (table)
    ├── Add Property (form)
    └── Property Detail → Tabs: Overview, Units, Tenants, Financials

Tenants
    ├── Tenant List
    ├── Add Tenant
    └── Tenant Detail → Profile, Lease, Payments, Communication

Rent
    ├── Rent Roll (overview)
    ├── Payment History
    ├── Outstanding
    └── Rent Collection (chart)

Maintenance
    ├── Ticket List
    ├── Add Ticket
    ├── Contractors
    └── Scheduled Maintenance

Leads
    ├── Pipeline (Kanban)
    ├── Lead List
    ├── Lead Detail
    └── Lead Sources

Reports
    ├── Occupancy Report
    ├── Financial Summary
    ├── Maintenance Summary
    └── Custom Report Builder
```

### 6.2 Micro-Interactions

- **Hover states:** 150ms ease transition
- **Card hover:** Subtle shadow increase
- **Button press:** Scale 98%
- **Modal open:** Fade in + scale from 95%
- **Toast notifications:** Slide in from top-right
- **Loading states:** Skeleton screens with pulse animation
- **Empty states:** Illustration + "Get Started" CTA

---

## 7. Accessibility Considerations

- **Contrast ratios:** Minimum 4.5:1 for text
- **Focus indicators:** 2px Blue outline on keyboard navigation
- **Screen reader:** Proper ARIA labels on all interactive elements
- **Touch targets:** Minimum 44x44px
- **Motion:** Respect `prefers-reduced-motion`

---

## 8. Implementation Notes

### 8.1 Component Priority

| Priority | Components |
|----------|------------|
| P0 (MVP) | Sidebar, Top Bar, Metric Cards, Property Table, Rent Overview |
| P1 | Property Map, Activity Feed, Maintenance List, Lead Pipeline |
| P2 | Charts, Advanced Filters, Bulk Actions, Reports |

### 8.2 Responsive Strategy

- **Desktop-first:** Design for 1440px, then scale down
- **Mobile conversion:** Stack cards vertically, convert table to cards
- **Touch optimization:** Increase tap targets on tablet/mobile

### 8.3 Performance Targets

- **Initial load:** < 2 seconds to meaningful content
- **Interaction response:** < 100ms for user actions
- **Data refresh:** Optimistic UI updates with background sync

---

## 9. Wireframe Summary

The PropAgent dashboard presents a **command-center aesthetic**: deep navy sidebar anchoring the experience, gold accents drawing attention to key metrics, and generous white space enabling focused work. The layout balances high-level oversight (hero metrics, map, activity feed) with operational depth (tables, forms, pipeline).

Every element communicates professionalism and trustworthiness — essential for a platform managing South African property assets worth millions.

---

*Design specification for PropAgent executive dashboard. Refer to brand-identity-guidelines.md for foundational color and typography rules.*
