# agent-loop Brand Identity Guidelines

## Modern SaaS Style — Fresh, Innovative, Property Tech

> **Note**: This document reflects the **actual implementation** as of 2026-04-15. The original brand guidelines (Executive Professional style) are preserved in `docs/dashboard-ui-design.md` for reference.

---

## 1. Brand Overview

**Company:** agent-loop
**Industry:** Real Estate / Property Management (South Africa)  
**Market Position:** AI-powered property platform for modern agents and property professionals  
**Brand Personality:** Fresh, Innovative, Tech-Forward, Approachable

---

## 2. Color Palette (Actual Implementation)

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Lime Green | `#D8F053` | Primary brand color, CTAs, accents |
| Sky Blue | `#53B4F0` | Interactive elements, links, secondary CTAs |
| Dark Background | `#0F172A` | Headers, dark sections, footer |

### Extended Palette

| Name | Hex | Usage |
|------|-----|-------|
| Slate | `#334155` | Body text, subheadings |
| Gray | `#64748B` | Supporting text, captions |
| White | `#FFFFFF` | Backgrounds, overlays |
| Light Gray | `#F1F5F9` | Card backgrounds, input fields |

### Color Ratios

- **Lime Green**: 40% — primary brand moments, CTAs
- **Sky Blue**: 30% — interactive elements, links  
- **Dark Background**: 20% — headers, contrast sections
- **White/Gray**: 10% — backgrounds, whitespace

> See `agentloop-web/src/app/globals.css` for complete implementation (lines 1-100)

---

## 3. Typography (Actual Implementation)

### Primary Typeface — Headlines & UI

**Implementation:** *Urbanist* (Google Fonts)

- Modern, geometric sans-serif for all UI
- Fresh, tech-forward appearance
- Used for: Headlines, buttons, navigation, body text

### Secondary Typeface — Fallback

**System:** *system-ui*, sans-serif

### Actual Type Scale

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Hero Headline | Urbanist | 56px / 48px mobile | 700 |
| Section Headline | Urbanist | 36px | 600 |
| Subheadline | Urbanist | 24px | 500 |
| Body | Urbanist | 16px | 400 |
| Caption | Urbanist | 14px | 400 |
| Button | Urbanist | 15px | 600 |

> See `agentloop-web/src/app/globals.css` for complete typography implementation

---

## 4. Logo Concepts

### Concept A: "Property Shield" (Recommended)

**Description:** A minimalist house silhouette nested within a shield shape, conveying protection and trust. The roofline subtly incorporates the letter "P."

**Execution:**

- Solid Deep Navy house shape
- Muted Gold roof accent / chevron
- Clean, geometric, scalable

**Use Cases:** Favicon, app icon, watermarks

---

### Concept B: "Pillar of Trust"

**Description:** Two vertical pillars (representing property + support) forming an abstract "P." Gold accent represents premium value.

**Execution:**

- Two parallel vertical bars in Navy
- Gold horizontal band crossing the upper third
- Minimal, architectural

**Use Cases:** Full logo lockup, brand mark

---

### Concept C: "Location Pin Premium"

**Description:** A refined map pin / location marker with a subtle house silhouette inside, pointing upward toward growth.

**Execution:**

- Navy pin outline
- Gold fill in the lower section
- Small Blue accent dot

**Use Cases:** Real estate specific, map integrations

---

### Logo Lockup Options

**Primary:** agent-loop wordmark + Concept A mark (horizontal)
**Stacked:** Mark above wordmark (square formats)  
**Wordmark Only:** For legal documents, footers

---

## 5. Icon Style Guidelines

### System

**Line Weight:** 1.5px — 2px stroke (consistent across all icons)  
**Corner Radius:** 2px (slightly rounded, professional)  
**Style:** Outlined (not filled) for consistency  
**Size Grid:** 24px base, scalable to 48px

### Icon Types

| Category | Examples | Style |
|----------|----------|-------|
| Navigation | Home, Search, Profile, Menu | Outlined, 24px |
| Real Estate | House, Building, Map, Key | Outlined + filled accent |
| Actions | Filter, Sort, Save, Share | Outlined, 20px |
| Status | Verified, Pending, Sold | Filled with checkmark overlay |

### Icon Color Rules

- **Default:** Charcoal `#2C3E50`
- **Active/Selected:** Deep Navy `#1E3A5F`
- **Accent Highlights:** Gold `#C9A227` (use sparingly)
- **Interactive:** Bright Blue `#2D9CDB`

---

## 6. Visual Hierarchy & Animations

### Layout Principles

1. **Spacing Grid** — 4px baseline grid system
2. **Visual Breathing** — Generous padding for modern feel
3. **Card Effects** — Subtle borders, hover states, scale transforms

### Animation System (Implemented)

The actual CSS includes extensive micro-animations:

```css
--transition-fast: 150ms ease
--transition-normal: 300ms ease
--transition-slow: 500ms ease
```

- **Hover Effects**: Scale (1.02), border color changes, shadow
- **Page Transitions**: Fade-in with slight upward motion
- **Interactive States**: Smooth color transitions on buttons
- **Loading States**: Pulse animations for skeleton loaders
- **Card Hover**: translateY(-4px) with shadow enhancement

> See `agentloop-web/src/app/globals.css` for complete animation keyframes (lines 200-400)

---

## 7. Brand Assets & Applications

### Recommended Assets

| Asset | Specification |
|-------|---------------|
| Logo (SVG) | Vector, all color variants |
| Favicon | 32x32px, Navy with Gold accent |
| App Icon | 1024x1024px, navy gradient + house mark |
| Pattern | Subtle geometric (diamonds or lines) in 5% navy |
| Empty State | House outline illustrations in line style |

### Photography Style

- **Tone:** Warm, aspirational, realistic South African properties
- **Palette:** Natural light, earth tones + blue sky
- **People:** Professional, diverse, relatable
- **Avoid:** Overly staged or cartoonish imagery

### Illustration Guidelines

- Minimal, geometric house and property icons
- Line-style for explainers and empty states
- No gradients — flat, modern aesthetic

---

## 8. Brand Do's & Don'ts (Actual)

### Do

✅ Use Lime Green as primary accent color  
✅ Use Urbanist font family throughout  
✅ Include micro-animations on interactive elements  
✅ Apply card hover effects and transitions  
✅ Use Sky Blue for interactive states  

### Don't

❌ Use more than 30% Lime Green in any composition  
❌ Place lime text on light backgrounds (use dark instead)  
❌ Skip animation transitions on buttons/cards  
❌ Use serif fonts (breaks the modern SaaS feel)  
❌ Mix with colors outside the defined palette  

---

## 9. Suggested File Structure

```
/brand/
├── logo/
│   ├── agent-loop-logo-primary.svg
│   ├── agent-loop-logo-white.svg
│   ├── agent-loop-mark.svg
│   └── favicon.ico
├── icons/
│   ├── system-icons.svg
│   └── real-estate-icons.svg
├── patterns/
│   └── brand-pattern.svg
└── templates/
    ├── business-card.ai
    ├── letterhead.ai
    └── presentation-deck.key
```

---

## 10. Design Files

### Source Files

| File | Location |
|------|----------|
| CSS Variables | `agentloop-web/src/app/globals.css` (lines 1-100) |
| Animation Keyframes | `agentloop-web/src/app/globals.css` (lines 200-400) |
| Font | Urbanist (Google Fonts) - imported in `layout.tsx` |
| Color Implementation | `agentloop-web/src/app/globals.css` |

---

*Document updated 2026-04-15 to reflect actual implementation. See `docs/dashboard-ui-design.md` for original Executive Professional style reference.*