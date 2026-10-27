-- Phase 15 operational workflows. These checks live in Postgres so they apply
-- to every client, not only the Mortusoft dashboard.

create or replace function public.move_case(target_facility uuid, target_case uuid, destination text, move_reason text)
returns uuid language plpgsql security definer set search_path='' as $$
declare old_location text; case_status text; movement_id uuid;
begin
 if (select auth.uid()) is null or not public.has_facility_role(target_facility,array['facility_admin','mortuary_manager','mortuary_attendant','embalming_staff','reception','funeral_coordinator','driver']) then
  raise exception 'Movement access is not allowed for this facility role.' using errcode='42501';
 end if;
 if length(trim(destination)) not between 2 and 120 or length(trim(move_reason)) not between 3 and 240 then
  raise exception 'Movement details are invalid.' using errcode='22023';
 end if;
 select current_location,status into old_location,case_status from public.cases where id=target_case and facility_id=target_facility for update;
 if not found or case_status<>'active' then raise exception 'Only active facility cases can be moved.' using errcode='22023'; end if;
 update public.cases set current_location=trim(destination),updated_at=now() where id=target_case and facility_id=target_facility;
 insert into public.case_movements(facility_id,case_id,from_location,to_location,reason,moved_by)
 values(target_facility,target_case,old_location,trim(destination),trim(move_reason),(select auth.uid())) returning id into movement_id;
 return movement_id;
end;
$$;
revoke all on function public.move_case(uuid,uuid,text,text) from public,anon;
grant execute on function public.move_case(uuid,uuid,text,text) to authenticated;

create or replace function public.enforce_release_prerequisites()
returns trigger language plpgsql set search_path='' as $$
declare required_key text; check_row public.case_release_checks;
begin
 if old.status='active' and new.status='released' then
  if length(trim(coalesce(new.release_record->>'recipient','')))<2
    or length(trim(coalesce(new.release_record->>'relationship','')))<2
    or length(trim(coalesce(new.release_record->>'idReference','')))<3 then
   raise exception 'Recipient and authority details are required before release.' using errcode='22023';
  end if;
  foreach required_key in array array['identityVerified','documentsComplete','authorityClearance','familyAuthorization','financialClearance','recipientVerified','releaseFormComplete','finalAuthorization'] loop
   select * into check_row from public.case_release_checks where facility_id=old.facility_id and case_id=old.id and check_key=required_key;
   if not found or check_row.state='pending' then
    raise exception 'All release checks must be completed or explicitly marked not applicable.' using errcode='23514';
   end if;
   if check_row.state='not_applicable' and (required_key not in ('authorityClearance','familyAuthorization','financialClearance') or length(trim(coalesce(check_row.reason,'')))<4) then
    raise exception 'This release check cannot be waived without an authorized reason.' using errcode='23514';
   end if;
  end loop;
  if not exists(select 1 from public.case_documents d where d.facility_id=old.facility_id and d.case_id=old.id and lower(d.category)='release form') then
   raise exception 'Attach the completed release form before authorizing handover.' using errcode='23514';
  end if;
 end if;
 return new;
end;
$$;
create trigger cases_require_release_prerequisites before update on public.cases
for each row execute function public.enforce_release_prerequisites();

insert into public.case_release_checks(facility_id,case_id,check_key,state)
select c.facility_id,c.id,k.check_key,'pending'
from public.cases c cross join (values ('identityVerified'),('documentsComplete'),('authorityClearance'),('familyAuthorization'),('financialClearance'),('recipientVerified'),('releaseFormComplete'),('finalAuthorization')) as k(check_key)
on conflict(facility_id,case_id,check_key) do nothing;

-- Seed each newly admitted case with the same checklist used in the pilot UI.
create or replace function public.seed_case_release_checks()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.case_release_checks(facility_id,case_id,check_key,state) values
  (new.facility_id,new.id,'identityVerified','pending'),
  (new.facility_id,new.id,'documentsComplete','pending'),
  (new.facility_id,new.id,'authorityClearance','pending'),
  (new.facility_id,new.id,'familyAuthorization','pending'),
  (new.facility_id,new.id,'financialClearance','pending'),
  (new.facility_id,new.id,'recipientVerified','pending'),
  (new.facility_id,new.id,'releaseFormComplete','pending'),
  (new.facility_id,new.id,'finalAuthorization','pending');
 return new;
end;
$$;
create trigger cases_seed_release_checks after insert on public.cases
for each row execute function public.seed_case_release_checks();

create table public.facility_invoice_sequences (
 facility_id uuid not null references public.facilities(id) on delete cascade,
 invoice_year integer not null check(invoice_year between 2000 and 2200),
 last_number bigint not null default 0 check(last_number>=0),
 primary key(facility_id,invoice_year)
);
alter table public.facility_invoice_sequences enable row level security;
revoke all on public.facility_invoice_sequences from anon,authenticated;

create or replace function public.create_invoice(target_facility uuid,target_case uuid,line_description text,line_amount_minor bigint)
returns public.invoices language plpgsql security definer set search_path='' as $$
declare year_number integer; sequence_number bigint; prefix text; result public.invoices;
begin
 if (select auth.uid()) is null or not public.has_facility_role(target_facility,array['facility_admin','mortuary_manager','finance']) then
  raise exception 'Invoice access is not allowed for this facility role.' using errcode='42501';
 end if;
 if length(trim(line_description)) not between 2 and 160 or line_amount_minor is null or line_amount_minor<1 then
  raise exception 'Invoice details are invalid.' using errcode='22023';
 end if;
 if not exists(select 1 from public.cases where id=target_case and facility_id=target_facility) then raise exception 'Case not found.' using errcode='22023'; end if;
 year_number:=extract(year from now())::integer;
 insert into public.facility_invoice_sequences(facility_id,invoice_year,last_number) values(target_facility,year_number,1)
 on conflict(facility_id,invoice_year) do update set last_number=public.facility_invoice_sequences.last_number+1 returning last_number into sequence_number;
 select case_prefix into prefix from public.facilities where id=target_facility;
 insert into public.invoices(facility_id,case_id,invoice_number,currency,created_by)
 values(target_facility,target_case,prefix||'-INV-'||year_number||'-'||lpad(sequence_number::text,5,'0'),'KES',(select auth.uid())) returning * into result;
 insert into public.invoice_lines(facility_id,invoice_id,description,amount_minor) values(target_facility,result.id,trim(line_description),line_amount_minor);
 return result;
end;
$$;
revoke all on function public.create_invoice(uuid,uuid,text,bigint) from public,anon;
grant execute on function public.create_invoice(uuid,uuid,text,bigint) to authenticated;

create unique index payments_reference_idempotency_idx on public.payments(facility_id,reference)
where reference is not null and length(trim(reference))>0;

create or replace function public.record_invoice_payment(target_facility uuid,target_invoice uuid,payment_amount_minor bigint,payment_method text,payment_reference text default null)
returns public.payments language plpgsql security definer set search_path='' as $$
declare result public.payments; invoice_row public.invoices; invoice_total bigint; amount_paid bigint;
begin
 if (select auth.uid()) is null or not public.has_facility_role(target_facility,array['facility_admin','mortuary_manager','finance']) then
  raise exception 'Payment access is not allowed for this facility role.' using errcode='42501';
 end if;
 if payment_amount_minor is null or payment_amount_minor<1 or length(trim(payment_method)) not between 2 and 40 or length(coalesce(payment_reference,''))>120 then
  raise exception 'Payment details are invalid.' using errcode='22023';
 end if;
 select * into invoice_row from public.invoices where id=target_invoice and facility_id=target_facility and status='issued' for update;
 if not found then raise exception 'Issued invoice not found.' using errcode='22023'; end if;
 select coalesce(sum(amount_minor),0) into invoice_total from public.invoice_lines where facility_id=target_facility and invoice_id=target_invoice;
 select coalesce(sum(amount_minor),0) into amount_paid from public.payments where facility_id=target_facility and invoice_id=target_invoice;
 if payment_amount_minor>invoice_total-amount_paid then raise exception 'Payment exceeds the remaining invoice balance.' using errcode='22023'; end if;
 insert into public.payments(facility_id,invoice_id,amount_minor,method,reference,recorded_by)
 values(target_facility,target_invoice,payment_amount_minor,trim(payment_method),nullif(trim(payment_reference),''),(select auth.uid())) returning * into result;
 return result;
end;
$$;
revoke all on function public.record_invoice_payment(uuid,uuid,bigint,text,text) from public,anon;
grant execute on function public.record_invoice_payment(uuid,uuid,bigint,text,text) to authenticated;
