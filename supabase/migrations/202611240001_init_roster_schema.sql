-- Datastraw Smart Roster Management System
-- Initial schema migration

create table if not exists public.pods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.processes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  full_name text not null,
  email text unique,
  pod_id uuid not null references public.pods(id) on delete restrict,
  primary_process_id uuid not null references public.processes(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  staffing_mode text not null check (staffing_mode in ('DEDICATED_SINGLE', 'SHARED_MULTI')),
  pod_id uuid not null references public.pods(id) on delete restrict,
  process_id uuid not null references public.processes(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_assignments (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (brand_id, employee_id)
);

create table if not exists public.operating_calendars (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  operating_days smallint[] not null default '{1,2,3,4,5,6}', -- 0=Sun .. 6=Sat
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.operating_calendar_overrides (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.operating_calendars(id) on delete cascade,
  override_date date not null,
  is_operating boolean not null,
  reason text,
  unique (calendar_id, override_date)
);

create table if not exists public.employee_time_offs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  time_off_date date not null,
  kind text not null check (kind in ('WEEKLY_OFF', 'LEAVE', 'COMP_OFF')),
  status text not null default 'APPROVED' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  notes text,
  created_at timestamptz not null default now(),
  unique (employee_id, time_off_date, kind)
);

create table if not exists public.minimum_staffing_rules (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  pod_id uuid references public.pods(id) on delete cascade,
  process_id uuid references public.processes(id) on delete cascade,
  min_headcount integer not null check (min_headcount >= 0),
  effective_from date,
  effective_to date,
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create table if not exists public.roster_months (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 2024 and 2100),
  month integer not null check (month between 1 and 12),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  unique (year, month)
);

create table if not exists public.roster_entries (
  id uuid primary key default gen_random_uuid(),
  roster_month_id uuid not null references public.roster_months(id) on delete cascade,
  work_date date not null,
  employee_id uuid not null references public.employees(id) on delete restrict,
  brand_id uuid not null references public.brands(id) on delete restrict,
  pod_id uuid not null references public.pods(id) on delete restrict,
  process_id uuid not null references public.processes(id) on delete restrict,
  source text not null default 'GENERATED' check (source in ('GENERATED', 'MANUAL_EDIT')),
  updated_at timestamptz not null default now(),
  unique (roster_month_id, work_date, employee_id, brand_id)
);

create table if not exists public.roster_conflicts (
  id uuid primary key default gen_random_uuid(),
  roster_month_id uuid not null references public.roster_months(id) on delete cascade,
  work_date date not null,
  employee_id uuid references public.employees(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  conflict_type text not null,
  severity text not null default 'HIGH' check (severity in ('LOW', 'MEDIUM', 'HIGH')),
  description text not null,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_roster_entries_month_date
  on public.roster_entries (roster_month_id, work_date);

create index if not exists idx_roster_conflicts_month_unresolved
  on public.roster_conflicts (roster_month_id)
  where resolved_at is null;