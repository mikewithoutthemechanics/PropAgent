# PropAgent UI/UX Design Specification

## Actual Implementation - Modern SaaS Style

---

## 1. Design Philosophy

The PropAgent UI follows a **Modern SaaS** aesthetic with lime green primary accents, sky blue secondary, and charcoal text. The design emphasizes:
- Clean, professional appearance with generous whitespace
- Micro-interactions and smooth animations
- Card-based layouts with subtle shadows
- Fully rounded elements (9999px border-radius)
- Dark mode ready color system

---

## 2. Implemented Color Palette

### Brand Colors (Actual CSS Variables in globals.css)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Lime Green | `#D8F053` | CTAs, active states, highlights |
| Primary Dark | Deep Lime | `#C2DC34` | Hover states |
| Accent | Sky Blue | `#53B4F0` | Secondary actions, links |
| Accent Dark | Deep Sky | `#0EA5E9` | Hover states |
| AI/Automation | Purple | `#C084FC` | AI features, automation |
| Background | White | `#FFFFFF` | Main background |
| Surface | Off-White | `#FAFAFA` | Card backgrounds |
| Text Primary | Charcoal | `#1A1A1A` | Headlines, body |
| Text Secondary | Slate | `#6B6B6B` | Captions, metadata |

### Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Success | Emerald | `#10B981` |
| Warning | Amber | `#F59E0B` |
| Danger | Rose | `#F43F5E` |
| Info | Blue | `#3B82F6` |

### Maintenance Ticket Status

| Status | Background | Text |
|--------|------------|-------|
| New | Charcoal `#1A1A1A` | White |
| In Progress | Lime `#D8F053` | Charcoal |
| Pending | Sky `#53B4F0` | White |
| AI Classified | Purple `#C084FC` | White |
| Assigned | Blue `#3B82F6` | White |
| Completed | Emerald `#10B981` | White |
| Cancelled | Rose `#F43F5E` | White |

---

## 3. Typography

**Font Family:** Urbanist (Google Fonts)
- Weights: 300, 400, 500, 600, 700
- Headings: 600 weight, -0.02em letter-spacing
- Body: 400 weight

---

## 4. Component Styles

### Cards
- Border radius: 20px (large), 24px (extra-large), 16px (small)
- Border: 1px solid `--charcoal-100`
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`
- Hover: translateY(-2px), shadow increase
- 3D card effect available with layered shadows

### Buttons
- Border radius: 9999px (fully rounded)
- Primary: Lime background, charcoal text, lime shadow
- Secondary: Transparent with charcoal border
- Ghost: Transparent with slate text
- Accent: Sky blue background, white text

### Inputs
- Border radius: 9999px
- Border: 1px `--charcoal-200`
- Focus: Sky blue border, 3px sky glow
- Inset shadow for depth

### Badges/Pills
- Border radius: 9999px
- Fully rounded pills with background color at 15% opacity
- Status variants: success, warning, danger, info, neutral

### Sidebar
- Light theme: White background, charcoal border
- Active indicator: 3px lime left border
- Hover: Charcoal-50 background

---

## 5. Animations & Micro-interactions

### Base Animations
- `fadeIn` - 0.3s ease
- `slideUp` - 0.3s ease  
- `scaleIn` - 0.3s ease
- `pulse` - 2s infinite
- `bounce` - 0.6s infinite
- `shimmer` - Loading skeleton
- `glow` - Lime glow effect
- `float` - 3s infinite float

### Scroll Animations
- `scroll-animate` - Fade up on scroll
- `scroll-animate-left` / `scroll-animate-right` - Slide in from sides
- `scroll-animate-scale` - Scale up on scroll

### Parallax Effects
- Hero blob backgrounds with scroll-linked movement
- Dot pattern overlay

### Card Effects
- Hover: Lift up 2-4px with shadow increase
- Shine sweep animation on hover

### Button Effects
- Ripple effect on click
- Scale to 0.97 on press

---

## 6. Layout Structure

### Main Layout
- Sidebar: 260px fixed left (collapsible on mobile)
- Top bar: 64px height, white background
- Main content: Flexible, with 24px padding

### Responsive Breakpoints
- Desktop XL: ≥1440px
- Desktop: 1200-1439px  
- Tablet: 768-1199px
- Mobile: <768px

---

## 7. Implementation Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | All CSS variables, animations, component styles |
| `src/app/layout.tsx` | Root layout with fonts |
| `src/app/page.tsx` | Landing page (666 lines) |

---

## 8. Key Classes

| Class | Effect |
|-------|--------|
| `.card` | Standard card with hover lift |
| `.card-elevated` | Higher shadow card |
| `.card-3d` | Layered 3D shadow effect |
| `.btn-primary` | Lime green CTA |
| `.btn-accent` | Sky blue secondary |
| `.btn-ghost` | Text-only button |
| `.badge-*` | Status pill badges |
| `.glass` | Glassmorphism effect |
| `.animate-*` | Animation utilities |
| `.scroll-animate` | Scroll-triggered animations |

---

## 9. Status Badge Variants

```css
.badge-success  /* Green - paid, completed */
.badge-warning   /* Amber - pending, due soon */
.badge-danger   /* Red - overdue, urgent */
.badge-info     /* Blue - in progress */
.badge-neutral  /* Gray - draft, inactive */
.badge-lime     /* Lime - featured, new */
.badge-sky      /* Sky - info links */
```

---

## 10. Current State

The UI is **already implemented** with this design system in:
- `globals.css` - 1368 lines of CSS variables and utilities
- Landing page with animations
- Card components with hover effects
- Button variants (primary, secondary, accent, ghost)
- Badge/status components
- Sidebar navigation styling

This documentation reflects the **actual implementation**, not a spec to be built.
