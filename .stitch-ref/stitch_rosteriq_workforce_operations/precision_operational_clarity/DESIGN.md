---
name: Precision Operational Clarity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is built for enterprise workforce operations, targeting operations managers, shift coordinators, and HR directors who manage complex, high-stakes scheduling. The interface should evoke calm authority, precision, and immediate legibility under pressure.

The visual language blends **Minimalism** with **Corporate / Modern** utility:
- **High-density clarity:** Generous structural breathing room around data groups, paired with compact, scannable rows inside tables and schedules.
- **Tactile restraint:** Crisp 1px borders and subtle tonal surface shifts replace heavy drop shadows, keeping the focus on live operational data.
- **Unobtrusive confidence:** A cool, neutral canvas lets semantic status indicators (coverage, warnings, conflicts) command attention only when action is required.

## Colors

The palette is anchored in a crisp, light-first enterprise canvas with high-contrast navy typography and restrained indigo accents.

- **Canvas & Surfaces:** Pure white (`#FFFFFF`) serves as the primary card and table surface, layered over soft cool grey (`#F8FAFC`) app backgrounds and `#F1F5F9` secondary containers or hover states.
- **Borders:** Subtle 1px structural dividers use `#E2E8F0` to separate dense data regions without visual noise.
- **Typography Hierarchy:** Deep navy (`#0F172A`) for headings and primary metrics, slate (`#334155`) for body copy, and muted slate (`#64748B`) for secondary labels and metadata.
- **Primary Accent:** Indigo (`#4F46E5`) is reserved for primary actions, active navigation states, and key interactive controls.
- **Semantic Status:**
  - **Success / Coverage:** `#10B981` text/icon on `#ECFDF5` tint.
  - **Warning / Attention:** `#F59E0B` text/icon on `#FFFBEB` tint.
  - **Critical / Conflict:** `#EF4444` text/icon on `#FEF2F2` tint.

## Typography

**Inter** is used across all typographic roles for its neutral, utilitarian precision and exceptional legibility at small sizes.

- **Tabular Figures:** All numerical data—including shift times, headcount metrics, percentages, and table columns—must use `font-variant-numeric: tabular-nums` so columns align vertically without jitter.
- **Hierarchy:** Headings use tight negative tracking (`-0.01em` to `-0.02em`) and semibold (`600`) weight in `#0F172A`. Body copy remains regular (`400`) in `#334155`, while compact uppercase or semibold `label-sm` tokens (`11px`) in `#64748B` anchor table headers and status badges.

## Layout & Spacing

The layout uses a **12-column fluid grid** optimized for high-density operational dashboards, with a `1rem` (`16px`) gutter and `1.5rem` (`24px`) outer canvas margins on desktop.

- **Desktop (`>= 1280px`):** Full 12-column fluid grid with a persistent left navigation rail. Data tables and schedule matrices span 8–12 columns, while summary KPI cards align in 3- or 4-column rows.
- **Tablet (`768px – 1279px`):** Collapsible navigation drawer; 12-column grid condenses KPI rows to 2 columns (`6` cols each) while maintaining full-width data tables with horizontal scroll where needed.
- **Mobile (`< 768px`):** Outer margins tighten to `1rem` (`16px`), grid stacks to a single column, and dense tables reflow into compact summary cards.
- **Rhythm:** Use `space-xs` (`4px`) and `space-sm` (`8px`) inside compact badges, table cells, and form controls; reserve `space-md` (`16px`) and `space-lg` (`24px`) for card padding and section separation.

## Elevation & Depth

Visual hierarchy relies on **Low-Contrast Outlines** and **Tonal Layers** rather than heavy drop shadows.

- **Surface Stacking:** The `#F8FAFC` app canvas sits at the base, with `#FFFFFF` cards and tables resting on top, bounded by crisp `1px solid #E2E8F0` borders. Secondary panels, table headers, and recessed filter bars use `#F1F5F9`.
- **Interactive & Floating Layers:** Dropdown menus, popovers, and modals elevate above the canvas using a subtle `1px solid #E2E8F0` border paired with a soft, diffused ambient shadow (`0 4px 12px rgba(15, 23, 42, 0.08)`).

## Shapes

The shape language is **Soft (`roundedness: 1`)**, balancing approachable modernity with the crisp, structured geometry required for dense data tables.

- **Standard Controls (`0.25rem` / `4px`):** Inputs, checkboxes, compact status badges, and secondary buttons use `4px` corners to maintain sharp alignment within tight grid cells.
- **Containers (`0.5rem` / `8px`):** Cards, data table wrappers, and modal dialogs use `rounded-lg` (`8px`) to frame content cleanly without wasting corner space.

## Components

- **Buttons:**
  - *Primary:* Solid `#4F46E5` background, `#FFFFFF` text, `label-lg` weight, `4px` radius, and `space-sm` vertical / `space-md` horizontal padding.
  - *Secondary:* `#FFFFFF` background, `1px solid #E2E8F0` border, `#334155` text, shifting to `#F8FAFC` on hover.
  - *Ghost / Icon:* Transparent background with `#64748B` icon/text, `#F1F5F9` hover state.
- **Status Badges & Chips:** Compact pill or `4px`-rounded tags using `label-sm` (`11px`, `600` weight) with `space-xs` vertical and `space-sm` horizontal padding. Always pair semantic text colors with their tinted backgrounds (`#10B981` on `#ECFDF5`, `#F59E0B` on `#FFFBEB`, `#EF4444` on `#FEF2F2`).
- **Data Tables:** `#FFFFFF` surface with `1px solid #E2E8F0` outer border and horizontal row dividers. Header rows use `#F8FAFC` background with `label-sm` uppercase `#64748B` text. Rows maintain compact `40px–44px` height, `#F8FAFC` hover highlight, and `tabular-nums` alignment for all metrics.
- **Input Fields:** `#FFFFFF` background, `1px solid #E2E8F0` border, `4px` radius, `#0F172A` input text, and `#64748B` placeholder. Focus states apply a `1px solid #4F46E5` border with a subtle `2px` `#4F46E5` ring at `15%` opacity.
- **Checkboxes & Radio Buttons:** `16px × 16px` controls with `1px solid #E2E8F0` borders (`4px` radius for checkboxes). Checked states fill with `#4F46E5` and a crisp `#FFFFFF` indicator.
- **Cards:** `#FFFFFF` background, `1px solid #E2E8F0` border, `8px` radius, and `space-md` to `space-lg` internal padding.
- **Operational Workflow Components:**
  - *Shift Timeline / Roster Grid:* Sticky left employee column with horizontally scrollable time slots, using semantic left-border accents (`3px`) on shift blocks to indicate coverage or conflict status.
  - *KPI Summary Strip:* 4-column row of compact cards displaying metric label (`label-md`), large tabular figure (`headline-lg`), and a semantic trend badge.