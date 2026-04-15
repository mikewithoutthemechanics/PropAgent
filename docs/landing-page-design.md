# PropAgent Landing Page Design

> **Note:** This document reflects the actual implementation design system - Modern SaaS with Urbanist font, lime green primary, sky blue accent.

---

## 1. Design System (Implemented)

### Colors (from `globals.css`)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Lime | `#D8F053` | Primary buttons, highlights, accents |
| Accent | Sky Blue | `#53B4F0` | Secondary buttons, links, interactive elements |
| Background | Near Black | `#0F0F0F` | Main background |
| Surface | Dark Gray | `#1A1A1A` | Cards, panels |
| Surface Elevated | Mid Gray | `#252525` | Elevated elements, hover states |
| Text Primary | White | `#FFFFFF` | Main text |
| Text Secondary | Light Gray | `#A0A0A0` | Secondary text, captions |
| Border | Subtle Gray | `#333333` | Borders, dividers |

### Typography

| Element | Font | Size | Weight |
|--------|------|------|--------|
| All | Urbanist | System default | Variable |

### Animation System

CSS custom properties defined in `globals.css`:
- `--ease-out-expo`: `cubic-bezier(0.16, 1, 0.3, 1)`
- Micro-animations on cards (hover lift, scale)

---

## 2. Page Structure (Implemented)

### Navigation Bar
- Fixed position
- Logo + nav links + login/signup buttons
- Lime accent on primary CTA

### Hero Section
- Dark background with geometric pattern
- Urbanist font headline
- Lime/sky blue CTA buttons

### Features Section
- Card grid with hover effects
- Micro-animations

### CTA Sections
- Dark surface background
- Lime primary buttons

---

## 3. Key Components (Code Reference)

See `propagent-web/src/app/globals.css` for full implementation.

---

*Updated: 2026-04-15*  
*Reflects actual code implementation*