-- Neon Data API migration. Auth claims are provided by Neon Auth; files live in private Neon Object Storage.
-- Mortusoft managed PostgreSQL foundation: tenant isolation, audit metadata and private documents.
create extension if not exists pgcrypto with schema extensions;

create table public.facilities (
 id uuid primary key default extensions.gen_random_uuid(),
 name text not null check (length(trim(name)) between 2 and 120),
 facility_type text not null default 'Private mortuary', county text not null,
 case_prefix text not null default 'MRT' check (case_prefix ~ '^[A-Z0-9]{1,6}$'),
 timezone text not null default 'Africa/Nairobi', contact_email text, contact_phone text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.facility_members (
 facility_id uuid not null references public.facilities(id) on delete cascade,
 user_id uuid not null references neon_auth.user(id) on delete cascade,
 role text not null check (role in ('facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','finance','funeral_coordinator','driver','auditor')),
 status text not null default 'active' check (status in ('active','suspended')),
 created_at timestamptz not null default now(), primary key (facility_id,user_id)
);
create index facility_members_user_idx on public.facility_members(user_id,facility_id) where status='active';

create or replace function public.is_facility_member(target_facility uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.facility_members m where m.facility_id=target_facility and m.user_id=(select auth.user_id()) and m.status='active');
$$;
create or replace function public.has_facility_role(target_facility uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.facility_members m where m.facility_id=target_facility and m.user_id=(select auth.user_id()) and m.status='active' and m.role=any(allowed_roles));
$$;
revoke all on function public.is_facility_member(uuid) from public,anonymous;
revoke all on function public.has_facility_role(uuid,text[]) from public,anonymous;
grant execute on function public.is_facility_member(uuid) to authenticated;
grant execute on function public.has_facility_role(uuid,text[]) to authenticated;

create or replace function public.can_access_case_document_path(target_path text, allowed_roles text[] default null)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare parts text[]; target_facility uuid; target_case uuid;
begin
 parts:=regexp_match(target_path,'^([0-9a-f-]{36})/([0-9a-f-]{36})/[0-9a-f-]{36}\.(pdf|png|jpg)$');
 if parts is null then return false; end if;
 target_facility:=parts[1]::uuid; target_case:=parts[2]::uuid;
 return public.is_facility_member(target_facility)
  and exists(select 1 from public.cases c where c.facility_id=target_facility and c.id=target_case)
  and (allowed_roles is null or public.has_facility_role(target_facility,allowed_roles));
end;
$$;
revoke all on function public.can_access_case_document_path(text,text[]) from public,anonymous;
grant execute on function public.can_access_case_document_path(text,text[]) to authenticated;

create or replace function public.create_facility_for_current_user(facility_name text,facility_type text,facility_county text,facility_prefix text default 'MRT',facility_timezone text default 'Africa/Nairobi')
returns uuid language plpgsql security definer set search_path='' as $$
declare new_id uuid;
begin
 if (select auth.user_id()) is null then raise exception 'Authentication required'; end if;
 if length(trim(facility_name)) not between 2 and 120 or facility_prefix !~ '^[A-Z0-9]{1,6}$' then raise exception 'Facility details are invalid'; end if;
 insert into public.facilities(name,facility_type,county,case_prefix,timezone) values(trim(facility_name),trim(facility_type),trim(facility_county),facility_prefix,facility_timezone) returning id into new_id;
 insert into public.facility_members(facility_id,user_id,role) values(new_id,(select auth.user_id()),'facility_admin');
 return new_id;
end;
$$;
revoke all on function public.create_facility_for_current_user(text,text,text,text,text) from public,anonymous;
grant execute on function public.create_facility_for_current_user(text,text,text,text,text) to authenticated;

create table public.cases (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 case_number text not null, deceased_name text not null,
 identification_status text not null default 'identified' check (identification_status in ('identified','unidentified','under_review')),
 sex text, estimated_age text, next_of_kin jsonb not null default '{}'::jsonb check(jsonb_typeof(next_of_kin)='object'),
 referral_source text, admission_at timestamptz not null, current_location text,
 status text not null default 'active' check(status in ('active','released','closed')),
 admission_notes text, release_record jsonb, closed_at timestamptz, closed_by uuid references neon_auth.user(id) on delete set null, closure_reason text,
 created_by uuid references neon_auth.user(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(facility_id,case_number), unique(facility_id,id)
);
create index cases_facility_status_admission_idx on public.cases(facility_id,status,admission_at desc);

create table public.facility_case_sequences (
 facility_id uuid not null references public.facilities(id) on delete cascade,
 case_year integer not null check(case_year between 2000 and 2200),
 last_number bigint not null default 0 check(last_number>=0),
 primary key(facility_id,case_year)
);
alter table public.facility_case_sequences enable row level security;
revoke all on public.facility_case_sequences from anonymous,authenticated;

-- Atomic case number allocation prevents duplicate IDs under concurrent admissions.
create or replace function public.admit_case(target_facility uuid, person_name text, admission_time timestamptz,
 kin_details jsonb default '{}'::jsonb, person_sex text default 'Not recorded', person_age text default '',
 source_text text default '', notes_text text default '', identification_state text default 'identified')
returns public.cases language plpgsql security definer set search_path='' as $$
declare prefix text; sequence_number bigint; year_number integer; admitted_case public.cases;
begin
 if (select auth.user_id()) is null or not public.has_facility_role(target_facility,array['facility_admin','mortuary_manager','mortuary_attendant','reception','funeral_coordinator']) then
  raise exception 'Case admission is not allowed for this facility role.' using errcode='42501';
 end if;
 if person_name is null or length(trim(person_name))<2 or admission_time is null or jsonb_typeof(coalesce(kin_details,'{}'::jsonb))<>'object' or identification_state not in ('identified','unidentified','under_review') then
  raise exception 'Case admission details are invalid.' using errcode='22023';
 end if;
 if identification_state='identified' and length(trim(coalesce(kin_details->>'name','')))<2 then raise exception 'Next-of-kin name is required for identified cases.' using errcode='22023'; end if;
 select case_prefix into prefix from public.facilities where id=target_facility;
 if prefix is null then raise exception 'Facility not found.' using errcode='22023'; end if;
 year_number:=extract(year from admission_time)::integer;
 insert into public.facility_case_sequences(facility_id,case_year,last_number) values(target_facility,year_number,1)
 on conflict(facility_id,case_year) do update set last_number=public.facility_case_sequences.last_number+1 returning last_number into sequence_number;
 insert into public.cases(facility_id,case_number,deceased_name,identification_status,sex,estimated_age,next_of_kin,referral_source,admission_at,admission_notes)
 values(target_facility,prefix||'-'||year_number||'-'||lpad(sequence_number::text,5,'0'),trim(person_name),identification_state,
  left(coalesce(person_sex,'Not recorded'),50),left(coalesce(person_age,''),30),coalesce(kin_details,'{}'::jsonb),left(coalesce(source_text,''),160),admission_time,left(coalesce(notes_text,''),2000))
 returning * into admitted_case;
 return admitted_case;
end;
$$;
revoke all on function public.admit_case(uuid,text,timestamptz,jsonb,text,text,text,text,text) from public,anonymous;
grant execute on function public.admit_case(uuid,text,timestamptz,jsonb,text,text,text,text,text) to authenticated;

create table public.storage_rooms (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 name text not null, created_at timestamptz not null default now(), unique(facility_id,name), unique(facility_id,id)
);
create table public.storage_slots (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 room_id uuid not null, label text not null, current_case_id uuid, unique(room_id,label), unique(facility_id,id),
 foreign key(facility_id,room_id) references public.storage_rooms(facility_id,id) on delete cascade,
 foreign key(facility_id,current_case_id) references public.cases(facility_id,id)
);
create unique index storage_slots_one_case_idx on public.storage_slots(facility_id,current_case_id) where current_case_id is not null;

create table public.case_movements (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 case_id uuid not null, from_location text, to_location text not null, reason text not null,
 moved_by uuid references neon_auth.user(id) on delete set null, moved_at timestamptz not null default now(),
 foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade
);
create index case_movements_case_time_idx on public.case_movements(facility_id,case_id,moved_at);
create table public.case_documents (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 case_id uuid not null, object_path text not null unique, original_name text not null, category text not null,
 mime_type text not null check(mime_type in ('application/pdf','image/png','image/jpeg')),
 byte_size bigint not null check(byte_size between 1 and 5242880),
 uploaded_by uuid references neon_auth.user(id) on delete set null, uploaded_at timestamptz not null default now(),
 foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade
);
create table public.invoices (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null references public.facilities(id) on delete cascade,
 case_id uuid not null, invoice_number text not null, currency char(3) not null default 'KES',
 status text not null default 'issued' check(status in ('issued','void')), created_by uuid references neon_auth.user(id) on delete set null,
 created_at timestamptz not null default now(), foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade,
 unique(facility_id,invoice_number), unique(facility_id,id)
);
create table public.invoice_lines (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null, invoice_id uuid not null,
 description text not null, amount_minor bigint not null check(amount_minor>0),
 foreign key(facility_id,invoice_id) references public.invoices(facility_id,id) on delete cascade
);
create table public.payments (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null, invoice_id uuid not null,
 amount_minor bigint not null check(amount_minor>0), method text not null, reference text, paid_at timestamptz not null default now(),
 recorded_by uuid references neon_auth.user(id) on delete set null,
 foreign key(facility_id,invoice_id) references public.invoices(facility_id,id) on delete cascade
);
create table public.case_release_checks (
 facility_id uuid not null, case_id uuid not null, check_key text not null,
 state text not null check(state in ('pending','complete','not_applicable')), reason text,
 updated_by uuid references neon_auth.user(id) on delete set null, updated_at timestamptz not null default now(),
 primary key(facility_id,case_id,check_key), foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade
);
create table public.case_contact_preferences (
 facility_id uuid not null, case_id uuid not null, preferred_channel text check(preferred_channel in ('sms','email')),
 consent_status text not null default 'not_recorded' check(consent_status in ('not_recorded','granted','declined')),
 consent_channel text, consent_method text, consent_at timestamptz, contact_data jsonb not null default '{}'::jsonb,
 updated_by uuid references neon_auth.user(id) on delete set null, updated_at timestamptz not null default now(),
 primary key(facility_id,case_id), foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade
);
create table public.message_drafts (
 id uuid primary key default extensions.gen_random_uuid(), facility_id uuid not null, case_id uuid not null,
 channel text not null check(channel in ('sms','email')), body text not null, status text not null default 'draft' check(status in ('draft','cancelled')),
 created_by uuid references neon_auth.user(id) on delete set null, created_at timestamptz not null default now(),
 foreign key(facility_id,case_id) references public.cases(facility_id,id) on delete cascade
);

-- Lifecycle-critical columns may only be changed by facility managers, and
-- transitions are one-way: Active -> Released -> Closed.
create or replace function public.guard_case_lifecycle()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.status<>'active' or new.release_record is not null or new.closed_at is not null or new.closure_reason is not null then
   raise exception 'Cases must be admitted as active; release and closure require their dedicated workflow.' using errcode='42501';
  end if;
  new.created_by:=(select auth.user_id());
  return new;
 end if;
 if new.facility_id is distinct from old.facility_id or new.id is distinct from old.id then
  raise exception 'A case cannot be moved between facilities or assigned a different identifier.' using errcode='42501';
 end if;
 if old.status='closed' and (new.status is distinct from old.status or new.release_record is distinct from old.release_record or new.closed_at is distinct from old.closed_at or new.closed_by is distinct from old.closed_by or new.closure_reason is distinct from old.closure_reason) then
  raise exception 'A closed case is immutable.' using errcode='42501';
 end if;
 if new.status is distinct from old.status then
  if not public.has_facility_role(old.facility_id,array['facility_admin','mortuary_manager']) then raise exception 'Facility manager access required.' using errcode='42501'; end if;
  if old.status='active' and new.status='released' and new.release_record is not null and new.closed_at is null and new.closed_by is null and new.closure_reason is null then
   new.release_record:=jsonb_set(jsonb_set(new.release_record,'{authorizedBy}',to_jsonb((select auth.user_id())::text),true),'{releasedAt}',to_jsonb(now()),true);
   return new;
  end if;
  if old.status='released' and new.status='closed' and new.release_record is not distinct from old.release_record and length(trim(coalesce(new.closure_reason,'')))>=4 then
   new.closed_at:=now(); new.closed_by:=(select auth.user_id()); return new;
  end if;
  raise exception 'Invalid case lifecycle transition.' using errcode='42501';
 end if;
 if new.release_record is distinct from old.release_record or new.closed_at is distinct from old.closed_at or new.closed_by is distinct from old.closed_by or new.closure_reason is distinct from old.closure_reason then
  raise exception 'Release and closure details can only change during their lifecycle transition.' using errcode='42501';
 end if;
 return new;
end;
$$;
create trigger cases_guard_lifecycle before insert or update on public.cases for each row execute function public.guard_case_lifecycle();

create or replace function public.guard_message_draft_consent()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' and not exists(
  select 1 from public.case_contact_preferences p where p.facility_id=new.facility_id and p.case_id=new.case_id
   and p.consent_status='granted' and p.consent_channel=new.channel and p.preferred_channel=new.channel and p.consent_at is not null and p.consent_method is not null
 ) then raise exception 'Current consent for this channel is required before preparing a family message.' using errcode='42501'; end if;
 if new.status not in ('draft','cancelled') then raise exception 'Message drafts cannot be sent from the data foundation.' using errcode='42501'; end if;
 return new;
end;
$$;
create trigger message_drafts_guard_consent before insert or update on public.message_drafts for each row execute function public.guard_message_draft_consent();
create table public.audit_events (
 id bigint generated always as identity primary key, facility_id uuid not null references public.facilities(id) on delete cascade,
 actor_id uuid references neon_auth.user(id) on delete set null, action text not null, entity_table text not null,
 entity_id uuid, case_number text, changed_fields text[] not null default '{}', occurred_at timestamptz not null default now()
);
create index audit_events_facility_time_idx on public.audit_events(facility_id,occurred_at desc);

-- Store event metadata only. Personal row values and document contents never enter the audit log.
create or replace function public.capture_audit_event()
returns trigger language plpgsql security definer set search_path='' as $$
declare old_data jsonb; new_data jsonb; row_data jsonb; target_facility uuid; target_entity uuid; target_case text; changed text[];
begin
 old_data:=case when tg_op='INSERT' then '{}'::jsonb else to_jsonb(old) end;
 new_data:=case when tg_op='DELETE' then '{}'::jsonb else to_jsonb(new) end;
 row_data:=case when tg_op='DELETE' then old_data else new_data end;
 target_facility:=nullif(coalesce(row_data->>'facility_id',row_data->>'id'),'')::uuid;
 target_entity:=nullif(row_data->>'case_id','')::uuid;
 if target_entity is null then target_entity:=nullif(row_data->>'id','')::uuid; end if;
 target_case:=row_data->>'case_number';
 select coalesce(array_agg(key),'{}') into changed from jsonb_object_keys(new_data) as fields(key) where new_data->key is distinct from old_data->key and key not in ('updated_at');
 if target_facility is not null then
  insert into public.audit_events(facility_id,actor_id,action,entity_table,entity_id,case_number,changed_fields)
  values(target_facility,(select auth.user_id()),lower(tg_op),tg_table_name,target_entity,target_case,changed);
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end;
$$;

do $$
declare t text;
begin
 foreach t in array array['facilities','facility_members','cases','storage_rooms','storage_slots','case_movements','case_documents','invoices','invoice_lines','payments','case_release_checks','case_contact_preferences','message_drafts'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function public.capture_audit_event()',t,t);
  execute format('revoke all on public.%I from anonymous,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;

create policy "facility members read facility" on public.facilities for select to authenticated using(public.is_facility_member(id));
create policy "facility admins update facility" on public.facilities for update to authenticated using(public.has_facility_role(id,array['facility_admin'])) with check(public.has_facility_role(id,array['facility_admin']));
create policy "members read roster" on public.facility_members for select to authenticated using(public.is_facility_member(facility_id));
create policy "admins add roster members" on public.facility_members for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin']));
create policy "admins update roster members" on public.facility_members for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin'])) with check(public.has_facility_role(facility_id,array['facility_admin']));
create policy "admins remove roster members" on public.facility_members for delete to authenticated using(public.has_facility_role(facility_id,array['facility_admin']));

create policy "members read cases" on public.cases for select to authenticated using(public.is_facility_member(facility_id));
create policy "case staff admit" on public.cases for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant','reception','funeral_coordinator']));
create policy "case staff update" on public.cases for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','funeral_coordinator'])) with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','funeral_coordinator']));

create policy "members read rooms" on public.storage_rooms for select to authenticated using(public.is_facility_member(facility_id));
create policy "admins manage rooms" on public.storage_rooms for all to authenticated using(public.has_facility_role(facility_id,array['facility_admin'])) with check(public.has_facility_role(facility_id,array['facility_admin']));
create policy "members read slots" on public.storage_slots for select to authenticated using(public.is_facility_member(facility_id));
create policy "staff update slots" on public.storage_slots for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant'])) with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant']));
create policy "admins insert slots" on public.storage_slots for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin']));
create policy "admins delete slots" on public.storage_slots for delete to authenticated using(public.has_facility_role(facility_id,array['facility_admin']));

create policy "members read movements" on public.case_movements for select to authenticated using(public.is_facility_member(facility_id));
create policy "staff append movements" on public.case_movements for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','funeral_coordinator','driver']));
create policy "members read document metadata" on public.case_documents for select to authenticated using(public.is_facility_member(facility_id));
create policy "staff add document metadata" on public.case_documents for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','funeral_coordinator']));
create policy "admins delete document metadata" on public.case_documents for delete to authenticated using(public.has_facility_role(facility_id,array['facility_admin']));

create policy "members read invoices" on public.invoices for select to authenticated using(public.is_facility_member(facility_id));
create policy "finance create invoices" on public.invoices for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','finance']));
create policy "finance update invoices" on public.invoices for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','finance'])) with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','finance']));
create policy "members read invoice lines" on public.invoice_lines for select to authenticated using(public.is_facility_member(facility_id));
create policy "finance add invoice lines" on public.invoice_lines for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','finance']));
create policy "members read payments" on public.payments for select to authenticated using(public.is_facility_member(facility_id));
create policy "finance record payments" on public.payments for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','finance']));

create policy "members read release checks" on public.case_release_checks for select to authenticated using(public.is_facility_member(facility_id));
create policy "managers add release checks" on public.case_release_checks for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager']));
create policy "managers update release checks" on public.case_release_checks for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager'])) with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager']));
create policy "members read contact preferences" on public.case_contact_preferences for select to authenticated using(public.is_facility_member(facility_id));
create policy "family staff add preferences" on public.case_contact_preferences for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','reception','funeral_coordinator']));
create policy "family staff update preferences" on public.case_contact_preferences for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','reception','funeral_coordinator'])) with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','reception','funeral_coordinator']));
create policy "members read message drafts" on public.message_drafts for select to authenticated using(public.is_facility_member(facility_id));
create policy "family staff add drafts" on public.message_drafts for insert to authenticated with check(public.has_facility_role(facility_id,array['facility_admin','mortuary_manager','reception','funeral_coordinator']));
create policy "admins update drafts" on public.message_drafts for update to authenticated using(public.has_facility_role(facility_id,array['facility_admin'])) with check(public.has_facility_role(facility_id,array['facility_admin']));

alter table public.audit_events enable row level security;
revoke all on public.audit_events from anonymous,authenticated;
grant select on public.audit_events to authenticated;
create policy "admins and auditors read audit" on public.audit_events for select to authenticated using(public.has_facility_role(facility_id,array['facility_admin','auditor']));
revoke all on function public.capture_audit_event() from public,anonymous,authenticated;


grant insert,update,delete on public.facility_members,public.storage_rooms,public.storage_slots,
 public.case_movements,public.case_documents,public.invoices,public.invoice_lines,public.payments,
 public.case_release_checks,public.case_contact_preferences,public.message_drafts to authenticated;
grant update on public.cases to authenticated;
grant usage,select on all sequences in schema public to authenticated;


