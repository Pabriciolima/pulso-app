-- Pulso: tabela isolada no projeto existente Champion Team SaaS.
-- Retenção: 60 dias desde o armazenamento; purga a cada hora.
create table public.pulso_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null,
  period text not null check (period in ('Manhã','Tarde','Noite')),
  systolic smallint not null check (systolic between 50 and 300),
  diastolic smallint not null check (diastolic between 30 and 200),
  pulse smallint check (pulse between 20 and 250),
  symptoms text[] not null default '{}',
  notes text not null default '' check (length(notes)<=1000),
  created_at timestamptz not null default now(),
  check (systolic > diastolic),
  check (cardinality(symptoms)<=7),
  check (symptoms <@ array['Dor / pressão forte no peito','Falta de ar','Dor de cabeça','Dor de cabeça súbita e intensa','Tontura','Desmaio','Alteração da visão / fala ou fraqueza']::text[])
);
create index pulso_readings_owner_date_idx on public.pulso_readings(user_id,measured_at desc);
alter table public.pulso_readings enable row level security;
revoke all on public.pulso_readings from PUBLIC,anon,authenticated;
grant select,delete on public.pulso_readings to authenticated;
grant insert (id,user_id,measured_at,period,systolic,diastolic,pulse,symptoms,notes) on public.pulso_readings to authenticated;
grant update (measured_at,period,systolic,diastolic,pulse,symptoms,notes) on public.pulso_readings to authenticated;
create policy pulso_select_own on public.pulso_readings for select to authenticated using ((select auth.uid())=user_id and created_at > now()-interval '60 days');
create policy pulso_insert_own on public.pulso_readings for insert to authenticated with check ((select auth.uid())=user_id);
create policy pulso_update_own on public.pulso_readings for update to authenticated using ((select auth.uid())=user_id and created_at > now()-interval '60 days') with check ((select auth.uid())=user_id);
create policy pulso_delete_own on public.pulso_readings for delete to authenticated using ((select auth.uid())=user_id and created_at > now()-interval '60 days');

create index pulso_readings_retention_idx on public.pulso_readings(created_at);
select cron.schedule('pulso_retention_60_days','17 * * * *',
$$delete from public.pulso_readings where created_at <= now()-interval '60 days';
delete from cron.job_run_details where jobid=(select jobid from cron.job where jobname='pulso_retention_60_days') and end_time < now()-interval '7 days';$$);
