-- Datastraw Smart Roster Management System
-- Grant schema, table, and sequence permissions to service_role

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant all privileges on all sequences in schema public to postgres, service_role;
