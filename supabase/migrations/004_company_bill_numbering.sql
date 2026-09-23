alter table bills
  drop constraint if exists bills_business_id_serial_number_key;

alter table bills
  add constraint bills_business_type_serial_number_key
  unique (business_id, bill_type_id, serial_number);

update bill_types
set last_serial_number = greatest(
  last_serial_number,
  3000,
  coalesce((
    select max(serial_number)
    from bills
    where bills.business_id = bill_types.business_id
      and bills.bill_type_id = bill_types.id
  ), 0)
);

drop function if exists reserve_global_bill_number(uuid);
drop function if exists get_next_bill_number(uuid);

create or replace function reserve_bill_number(p_business_id uuid, p_bill_type_id text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare next_number bigint;
begin
  update bill_types
  set last_serial_number = greatest(last_serial_number + 1, 3001),
      updated_at = now()
  where business_id = p_business_id and id = p_bill_type_id
  returning last_serial_number into next_number;
  if next_number is null then raise exception 'Bill type not found'; end if;
  return next_number;
end;
$$;

create or replace function get_next_bill_number(p_business_id uuid, p_bill_type_id text)
returns bigint
language sql
security definer
set search_path = public
as $$
select greatest(last_serial_number + 1, 3001)
from bill_types
where business_id = p_business_id and id = p_bill_type_id;
$$;

revoke all on function reserve_bill_number(uuid, text) from public, anon, authenticated;
revoke all on function get_next_bill_number(uuid, text) from public, anon, authenticated;
grant execute on function reserve_bill_number(uuid, text) to service_role;
grant execute on function get_next_bill_number(uuid, text) to service_role;