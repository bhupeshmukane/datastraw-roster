# Datastraw Smart Roster Management System (RosterIQ)

A deterministic workforce operations and monthly roster management application built for managing **30+ operators**, **20 D2C brands** (`16` `DEDICATED_SINGLE` and `4` `SHARED_MULTI`), **5 operational pods**, and **4 core processes**.

- **Live Application:** https://datastraw-roster-psi.vercel.app
- **GitHub Repository:** https://github.com/bhupeshmukane/datastraw-roster

---

## Approach Note

The core scheduling problem is treated as a **deterministic constraint-satisfaction and validation pipeline** rather than a static calendar UI. All roster generation (`generateMonthlyRoster`) and rule auditing (`validateRosterEntries`) live in pure, side-effect-free TypeScript functions (`src/lib/roster/engine.ts`) backed by Zod schemas (`src/lib/validation/roster.ts`), ensuring identical inputs always produce identical schedules and every manual edit (`source: "MANUAL_EDIT"`) is immediately re-evaluated against operating calendars, approved time-offs, dedicated-brand isolation, double-booking prevention, and minimum headcount rules.

Supabase Postgres stores normalized relational entities (`pods`, `processes`, `employees`, `brands`, `brand_assignments`, `operating_calendars`, `operating_calendar_overrides`, `employee_time_offs`, `minimum_staffing_rules`, `roster_months`, `roster_entries`, and `roster_conflicts`), accessed exclusively through server-side actions (`src/app/actions/roster.ts`) and repository helpers (`src/lib/roster/repository.ts`) without ever exposing `SUPABASE_SERVICE_ROLE_KEY` to client bundles or fabricating persistence when unconfigured.

---

## Architecture & Key Modules

| Layer | Responsibility | Key Files |
| :--- | :--- | :--- |
| **Scheduling Engine** | Deterministic monthly generation & rule validation | [`src/lib/roster/engine.ts`](src/lib/roster/engine.ts) |
| **Domain Schemas** | Zod schemas & TypeScript domain types | [`src/lib/validation/roster.ts`](src/lib/validation/roster.ts) |
| **Database Layer** | Supabase migrations, seed data, & repository loader/persistence | [`supabase/migrations/`](supabase/migrations), [`src/lib/roster/repository.ts`](src/lib/roster/repository.ts) |
| **Server Actions** | Zod-validated server boundaries for load, save, manual edit, conflict resolution | [`src/app/actions/roster.ts`](src/app/actions/roster.ts) |
| **Baseline Fixture** | Deterministic 30-employee / 20-brand fallback dataset | [`src/lib/roster/baseline-fixture.ts`](src/lib/roster/baseline-fixture.ts) |
| **App Router Screens** | Dashboard (`/`), Monthly Roster (`/roster`), Employees (`/employees`), Brands (`/brands`), Conflict Center (`/conflicts`), Validation (`/validation`) | [`src/app/`](src/app), [`src/components/roster/`](src/components/roster) |

---

## Setup Instructions

### 1. Prerequisites
- Node.js `>= 22` (tested locally on Node `24.8.0`)
- npm `>= 10`
- A Supabase project (optional—if unconfigured, the app runs in deterministic local memory mode and reports database status honestly)

### 2. Install & Configure Environment
```bash
git clone https://github.com/bhupeshmukane/datastraw-roster.git
cd datastraw-roster
npm install
cp .env.example .env.local
```

Populate `.env.local` using [`.env.example`](.env.example):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Migrations (Supabase SQL Editor)
Run the three migrations in order in your Supabase SQL Editor:
1. `supabase/migrations/202611240001_init_roster_schema.sql` — Creates normalized tables, foreign keys, and indexes.
2. `supabase/migrations/202611240002_seed_baseline_ops.sql` — Idempotently seeds 5 pods, 4 processes, 30 employees, 20 brands (16 dedicated, 4 shared), brand assignments, Mon–Sat operating calendar, Christmas closure override (`2026-12-25`), approved time-offs, and minimum staffing rules.
3. `supabase/migrations/202611250003_grant_service_role_access.sql` — Grants `public` schema, table, and sequence privileges to `service_role`.

### 4. Run Locally & Verify
```bash
npm run dev          # Start Next.js dev server at http://localhost:3000
npx tsc --noEmit     # TypeScript verification
npm test             # Run Vitest unit & boundary test suite (23 tests)
npm run build        # Production Next.js build
```

---

## Tell Us How You Think

### 1. How did you model employees, brands, processes, pods, and their relationships?
I modeled them as normalized relational entities in Postgres (`supabase/migrations/202611240001_init_roster_schema.sql`) and mirrored them with Zod schemas (`src/lib/validation/roster.ts`):
- **Pods (`pods`)** and **Processes (`processes`)** are first-class reference tables.
- **Employees (`employees`)** belong to a `pod_id` and have a `primary_process_id`, plus `is_active` status.
- **Brands (`brands`)** belong to a `pod_id` and `process_id`, and carry an explicit `staffing_mode` (`DEDICATED_SINGLE` vs `SHARED_MULTI`).
- **Brand Assignments (`brand_assignments`)** join employees and brands with an `is_primary` flag, allowing 1:1 dedicated ownership as well as multi-employee shared brand coverage.
- **Schedules & Rules** are decoupled into `operating_calendars`, `operating_calendar_overrides`, `employee_time_offs`, `minimum_staffing_rules`, `roster_months`, `roster_entries`, and `roster_conflicts`.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
`generateMonthlyRoster` iterates deterministically over sorted calendar dates, active brands (sorted by `code`), and active employees (sorted by `employeeCode`):
1. It skips non-operating dates using `isOperatingDay(date, calendar, overrides)`, checking date-specific overrides before falling back to weekly operating days.
2. For each active brand, it resolves `minHeadcount` from `staffingRules` (brand-specific rule first, then global rule, defaulting to `1`).
3. It selects candidate employees from `brand_assignments` (or active employees if unassigned), skipping anyone already scheduled on that date or on `APPROVED` time-off (`LEAVE`, `WEEKLY_OFF`, `COMP_OFF`).
4. Every generated schedule is passed directly through `validateRosterEntries`, which checks inactive/missing entities, non-operating days, approved time-offs, dedicated-brand isolation, double-bookings, and understaffed brand minimums—returning `{ valid, conflicts }` rather than silently producing an invalid roster.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
Each brand carries a `staffingMode` (`DEDICATED_SINGLE` for the 16 dedicated brands = 80%, `SHARED_MULTI` for the 4 shared brands = 20%).
- For `DEDICATED_SINGLE` brands, `brand_assignments` maps one primary employee (`isPrimary: true`). During validation, `validateRosterEntries` builds a `dedicatedEmployeeToBrand` map and flags a `HIGH` severity `DEDICATED_BRAND_VIOLATION` if a dedicated employee is manually or accidentally scheduled onto any other brand.
- For `SHARED_MULTI` brands, multiple employees can be assigned (`isPrimary: true` and `false` backup/shared operators), allowing the generator and manual overrides to maintain coverage when one operator is unavailable.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
In the baseline dataset, `EMP-01` (dedicated primary operator for `BR-01`) has an approved `LEAVE` on `2026-12-08`. Because `BR-01` is `DEDICATED_SINGLE` with only `EMP-01` assigned:
1. `generateMonthlyRoster` strictly respects the approved leave and does **not** schedule `EMP-01` on `2026-12-08`.
2. `validateRosterEntries` detects `0/1` scheduled headcount for `BR-01` on that operating day and emits a `HIGH` severity `UNDERSTAFFED_BRAND` conflict (`Brand BR-01 has 0/1 scheduled staff on 2026-12-08`).
3. The Conflict Center (`/conflicts`) surfaces this gap immediately with remediation actions (**Resolve via Edit →** or **Mark Resolved**).

### 5. How does your system handle conflicting requirements or insufficient staffing?
The engine prioritizes hard operational constraints over silent auto-filling:
- Approved time-offs (`APPROVED`) and non-operating calendar overrides are never violated during generation.
- When constraints cannot be satisfied (e.g., dedicated operator on leave leaving a brand below `minHeadcount`), the system records structured `RosterConflict` objects with `workDate`, `conflictType`, `severity` (`LOW` | `MEDIUM` | `HIGH`), `employeeId`, `brandId`, and a diagnostic `description`.
- In the UI, `/conflicts` and `/validation` surface all conflicts live, and every manual edit (`source: "MANUAL_EDIT"`) automatically re-runs `validateRosterEntries` so the manager sees immediately whether a change fixes the gap or introduces a `DEDICATED_BRAND_VIOLATION` / `DOUBLE_BOOKED_EMPLOYEE` / `EMPLOYEE_TIME_OFF` conflict.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
- **Automated:** Deterministic monthly shift generation, calendar/holiday filtering, approved leave exclusion, conflict detection, compliance scoring, and automatic post-edit revalidation. These are repetitive, error-prone rule checks where deterministic code guarantees zero silent mistakes.
- **Human Control:** Reassigning shifts during exceptions (`ManualEditModal` with `source: "MANUAL_EDIT"`), deciding whether to temporarily pull a flex operator onto an understaffed dedicated brand, acknowledging/resolving conflicts with an audit note, and explicitly committing changes to the database (**Save to DB**). Staffing trade-offs (e.g., breaking dedicated isolation vs. leaving a brand uncovered) require operational judgment.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Database-level month/brand pagination & server-side filtering:** Moving from loading the entire month's matrix into client context to paginated/virtualized queries by pod or brand, and indexing `roster_entries(roster_month_id, brand_id, work_date)`.
2. **Weighted solver / constraint optimizer:** Replacing the greedy sorted pass in `generateMonthlyRoster` with a scoring/backtracking or linear optimization pass (e.g., balancing monthly shift counts, weekly-off fairness, and backup-pool eligibility across pods).
3. **Process-level staffing rules per brand:** Expanding `generateMonthlyRoster` to schedule per `(brandId, processId)` slot rather than one entry per brand per day when multiple processes require simultaneous distinct coverage.

### 8. If you had one additional week to work on this, what would you improve first?
1. **In-app CRUD for Brands, Employees, Time-Offs, and Per-Brand Calendars:** Adding forms and server actions so operations managers can onboard new brands, employees, and leave requests directly in the UI without touching SQL.
2. **Backup Resource Recommendations:** Automatically ranking eligible, non-dedicated, available operators in the same pod/process inside the Conflict Center's "Resolve via Edit" modal.
3. **CSV / Excel Export & Pod-Lead Approval Workflow:** Adding one-click roster CSV export and `DRAFT → PUBLISHED` month locking with audit history.
