-- Applied migration: pulso_device_pairing. Existing database, no new project.
create table public.pulso_device_keys(
 access_hash text primary key check(length(access_hash)=64),
 diary_id uuid not null references public.pulso_diaries(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table public.pulso_pair_codes(
 code_hash text primary key check(length(code_hash)=64),
 diary_id uuid not null references public.pulso_diaries(id) on delete cascade,
 expires_at timestamptz not null
);
alter table public.pulso_device_keys enable row level security;
alter table public.pulso_pair_codes enable row level security;
revoke all on public.pulso_device_keys,public.pulso_pair_codes from PUBLIC,anon,authenticated;
grant select,insert,update,delete on public.pulso_device_keys,public.pulso_pair_codes to service_role;
