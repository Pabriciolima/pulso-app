-- Migration already applied to existing project. No secret access token belongs in this file.
create table public.pulso_diaries (
 id uuid primary key default gen_random_uuid(),
 access_hash text not null unique check(length(access_hash)=64),
 created_at timestamptz not null default now()
);
alter table public.pulso_diaries enable row level security;
revoke all on public.pulso_diaries from PUBLIC,anon,authenticated;
grant select,insert,update,delete on public.pulso_diaries to service_role;
alter table public.pulso_readings alter column user_id drop not null;
alter table public.pulso_readings add column diary_id uuid references public.pulso_diaries(id) on delete cascade;
alter table public.pulso_readings add constraint pulso_readings_owner_present check(user_id is not null or diary_id is not null);
create index pulso_readings_diary_measured_idx on public.pulso_readings(diary_id,measured_at desc);
grant select,insert,update,delete on public.pulso_readings to service_role;
-- Provision SHA-256 of a cryptographically random 32-byte token separately.
-- Existing hourly retention job remains unchanged and covers both owner types.
