-- Datastraw Smart Roster Management System
-- Baseline workforce operations seed migration
-- Seeds 5 pods, 4 processes, 30 employees, 20 brands (16 dedicated, 4 shared),
-- operating calendar, holiday override, approved time-offs, and staffing rules.

-- 1. Pods (5 pods)
insert into public.pods (code, name) values
  ('POD-A', 'Core D2C Pod A'),
  ('POD-B', 'Growth D2C Pod B'),
  ('POD-C', 'Retention & CX Pod C'),
  ('POD-D', 'Fulfillment & Ops Pod D'),
  ('POD-E', 'Catalog & Launch Pod E')
on conflict (code) do update set name = excluded.name;

-- 2. Processes (4 processes)
insert into public.processes (code, name) values
  ('PROC-ORDER', 'Order & Dispatch Ops'),
  ('PROC-CX', 'Customer Experience Tier 2'),
  ('PROC-CATALOG', 'Catalog & Inventory Sync'),
  ('PROC-SLA', 'SLA Monitoring & Exceptions')
on conflict (code) do update set name = excluded.name;

-- 3. Employees (30 operators)
insert into public.employees (employee_code, full_name, email, pod_id, primary_process_id, is_active)
values
  ('EMP-01', 'Marcus Chen', 'marcus.chen@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-02', 'Priya Patel', 'priya.patel@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-03', 'Sofia Rodriguez', 'sofia.rodriguez@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-04', 'Liam O''Connor', 'liam.oconnor@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-05', 'Aisha Khan', 'aisha.khan@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-06', 'Carlos Mendoza', 'carlos.mendoza@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-07', 'Sarah Jenkins', 'sarah.jenkins@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-08', 'David Kim', 'david.kim@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-09', 'Elena Rostova', 'elena.rostova@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-10', 'Tariq Al-Mansoor', 'tariq.almansoor@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-11', 'Hannah Abbott', 'hannah.abbott@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-12', 'Julian Vance', 'julian.vance@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-13', 'Mei-Ling Zhou', 'meiling.zhou@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-14', 'Lucas Silva', 'lucas.silva@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-15', 'Chloe Martin', 'chloe.martin@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-16', 'Vikram Malhotra', 'vikram.malhotra@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-17', 'Zoe Washington', 'zoe.washington@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-18', 'Nathaniel Ford', 'nathaniel.ford@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-19', 'Ananya Sharma', 'ananya.sharma@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-20', 'Gabriel Santos', 'gabriel.santos@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-21', 'Rachel Green', 'rachel.green@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-22', 'Benjamin Torres', 'benjamin.torres@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-23', 'Kavita Reddy', 'kavita.reddy@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-24', 'Owen Mitchell', 'owen.mitchell@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-25', 'Fatima Zahra', 'fatima.zahra@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-26', 'Alexander Scott', 'alexander.scott@datastraw.ops', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-CX'), true),
  ('EMP-27', 'Nadia Petrova', 'nadia.petrova@datastraw.ops', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('EMP-28', 'Samuel Adebayo', 'samuel.adebayo@datastraw.ops', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('EMP-29', 'Isabella Gomez', 'isabella.gomez@datastraw.ops', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('EMP-30', 'Daniel Wright', 'daniel.wright@datastraw.ops', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-CX'), true)
on conflict (employee_code) do update set
  full_name = excluded.full_name,
  email = excluded.email,
  pod_id = excluded.pod_id,
  primary_process_id = excluded.primary_process_id,
  is_active = excluded.is_active;

-- 4. Brands (20 brands: 16 dedicated single-owner, 4 shared multi)
insert into public.brands (code, name, staffing_mode, pod_id, process_id, is_active)
values
  ('BR-01', 'AuraSkin Care', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('BR-02', 'Lumina Home Tech', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CX'), true),
  ('BR-03', 'PeakFit Nutrition', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('BR-04', 'Solstice Eyewear', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('BR-05', 'Novawear Apparel', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('BR-06', 'Artisan Roast Co', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-CX'), true),
  ('BR-07', 'PureBotanics Lab', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('BR-08', 'PulseAudio Gear', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('BR-09', 'VelvetKnit Studio', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('BR-10', 'UrbanStride Shoes', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-CX'), true),
  ('BR-11', 'TerraGoods Living', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('BR-12', 'ChronoWatch Atelier', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('BR-13', 'HavenSleep Bedding', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('BR-14', 'EcoSpark Cleaning', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-CX'), true),
  ('BR-15', 'ZenithGlow Wellness', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('BR-16', 'OrbitBikes Commute', 'DEDICATED_SINGLE', (select id from public.pods where code = 'POD-A'), (select id from public.processes where code = 'PROC-SLA'), true),
  ('BR-17', 'AeroPack Luggage', 'SHARED_MULTI', (select id from public.pods where code = 'POD-B'), (select id from public.processes where code = 'PROC-ORDER'), true),
  ('BR-18', 'Verve Kitchenware', 'SHARED_MULTI', (select id from public.pods where code = 'POD-C'), (select id from public.processes where code = 'PROC-CX'), true),
  ('BR-19', 'Glint Fine Jewelry', 'SHARED_MULTI', (select id from public.pods where code = 'POD-D'), (select id from public.processes where code = 'PROC-CATALOG'), true),
  ('BR-20', 'Kinetix Sports Gear', 'SHARED_MULTI', (select id from public.pods where code = 'POD-E'), (select id from public.processes where code = 'PROC-SLA'), true)
on conflict (code) do update set
  name = excluded.name,
  staffing_mode = excluded.staffing_mode,
  pod_id = excluded.pod_id,
  process_id = excluded.process_id,
  is_active = excluded.is_active;

-- 5. Brand Assignments (16 dedicated primary + 4 shared multi assignments)
insert into public.brand_assignments (brand_id, employee_id, is_primary)
values
  -- Dedicated 1:1 assignments (BR-01 .. BR-16 with EMP-01 .. EMP-16)
  ((select id from public.brands where code = 'BR-01'), (select id from public.employees where employee_code = 'EMP-01'), true),
  ((select id from public.brands where code = 'BR-02'), (select id from public.employees where employee_code = 'EMP-02'), true),
  ((select id from public.brands where code = 'BR-03'), (select id from public.employees where employee_code = 'EMP-03'), true),
  ((select id from public.brands where code = 'BR-04'), (select id from public.employees where employee_code = 'EMP-04'), true),
  ((select id from public.brands where code = 'BR-05'), (select id from public.employees where employee_code = 'EMP-05'), true),
  ((select id from public.brands where code = 'BR-06'), (select id from public.employees where employee_code = 'EMP-06'), true),
  ((select id from public.brands where code = 'BR-07'), (select id from public.employees where employee_code = 'EMP-07'), true),
  ((select id from public.brands where code = 'BR-08'), (select id from public.employees where employee_code = 'EMP-08'), true),
  ((select id from public.brands where code = 'BR-09'), (select id from public.employees where employee_code = 'EMP-09'), true),
  ((select id from public.brands where code = 'BR-10'), (select id from public.employees where employee_code = 'EMP-10'), true),
  ((select id from public.brands where code = 'BR-11'), (select id from public.employees where employee_code = 'EMP-11'), true),
  ((select id from public.brands where code = 'BR-12'), (select id from public.employees where employee_code = 'EMP-12'), true),
  ((select id from public.brands where code = 'BR-13'), (select id from public.employees where employee_code = 'EMP-13'), true),
  ((select id from public.brands where code = 'BR-14'), (select id from public.employees where employee_code = 'EMP-14'), true),
  ((select id from public.brands where code = 'BR-15'), (select id from public.employees where employee_code = 'EMP-15'), true),
  ((select id from public.brands where code = 'BR-16'), (select id from public.employees where employee_code = 'EMP-16'), true),
  -- Shared multi-operator assignments (BR-17 .. BR-20)
  ((select id from public.brands where code = 'BR-17'), (select id from public.employees where employee_code = 'EMP-17'), true),
  ((select id from public.brands where code = 'BR-17'), (select id from public.employees where employee_code = 'EMP-18'), false),
  ((select id from public.brands where code = 'BR-18'), (select id from public.employees where employee_code = 'EMP-19'), true),
  ((select id from public.brands where code = 'BR-18'), (select id from public.employees where employee_code = 'EMP-20'), false),
  ((select id from public.brands where code = 'BR-19'), (select id from public.employees where employee_code = 'EMP-21'), true),
  ((select id from public.brands where code = 'BR-19'), (select id from public.employees where employee_code = 'EMP-22'), false),
  ((select id from public.brands where code = 'BR-20'), (select id from public.employees where employee_code = 'EMP-23'), true),
  ((select id from public.brands where code = 'BR-20'), (select id from public.employees where employee_code = 'EMP-24'), false)
on conflict (brand_id, employee_id) do update set is_primary = excluded.is_primary;

-- 6. Operating Calendar (Mon–Sat)
insert into public.operating_calendars (name, operating_days, is_default)
values ('Standard Operating Calendar (Mon–Sat)', '{1,2,3,4,5,6}', true)
on conflict (name) do update set operating_days = excluded.operating_days, is_default = excluded.is_default;

-- 7. Calendar Override (Christmas Public Holiday Closure)
insert into public.operating_calendar_overrides (calendar_id, override_date, is_operating, reason)
values (
  (select id from public.operating_calendars where name = 'Standard Operating Calendar (Mon–Sat)' limit 1),
  '2026-12-25',
  false,
  'Christmas Public Holiday Closure'
)
on conflict (calendar_id, override_date) do update set
  is_operating = excluded.is_operating,
  reason = excluded.reason;

-- 8. Employee Time Offs
insert into public.employee_time_offs (employee_id, time_off_date, kind, status, notes)
values
  ((select id from public.employees where employee_code = 'EMP-01'), '2026-12-08', 'LEAVE', 'APPROVED', 'Annual personal leave'),
  ((select id from public.employees where employee_code = 'EMP-18'), '2026-12-19', 'COMP_OFF', 'APPROVED', 'Compensatory day off for weekend launch support')
on conflict (employee_id, time_off_date, kind) do update set
  status = excluded.status,
  notes = excluded.notes;

-- 9. Minimum Staffing Rules (min 1 per brand)
insert into public.minimum_staffing_rules (brand_id, pod_id, process_id, min_headcount)
select
  b.id as brand_id,
  b.pod_id as pod_id,
  b.process_id as process_id,
  1 as min_headcount
from public.brands b
where not exists (
  select 1 from public.minimum_staffing_rules r where r.brand_id = b.id
);
