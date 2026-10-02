-- Applied migration: pulso_unified_open_diary_realtime.
-- Owner explicitly approved one shared diary with unauthenticated access.
-- Diary ID exists in this deployment; use its actual ID for a separate installation.
update public.pulso_readings
set diary_id='c1862cad-a4e9-491a-bb2a-021ec8d48690'::uuid
where diary_id is not null and diary_id<>'c1862cad-a4e9-491a-bb2a-021ec8d48690'::uuid;
create schema if not exists pulso_private;
revoke all on schema pulso_private from PUBLIC,anon,authenticated;
create or replace function pulso_private.notify_reading_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (TG_OP='DELETE' and OLD.diary_id='c1862cad-a4e9-491a-bb2a-021ec8d48690'::uuid)
 or (TG_OP<>'DELETE' and NEW.diary_id='c1862cad-a4e9-491a-bb2a-021ec8d48690'::uuid) then
  perform realtime.send(jsonb_build_object('change',TG_OP),'changed','pulso-shared',false);
 end if;
 return null;
end;
$$;
revoke all on function pulso_private.notify_reading_change() from PUBLIC,anon,authenticated;
create trigger pulso_readings_realtime_change after insert or update or delete
on public.pulso_readings for each row execute function pulso_private.notify_reading_change();
