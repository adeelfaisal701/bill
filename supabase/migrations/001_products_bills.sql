create extension if not exists pgcrypto;

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  global_bill_number bigint not null default 0,
  address text,
  phone text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists business_members (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists products (
  id text primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  cost_price numeric(14, 2),
  stock_quantity numeric(14, 3) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id)
);

create unique index if not exists products_business_name_unique on products (business_id, lower(name));

create table if not exists bill_types (
  business_id uuid not null references businesses(id) on delete cascade,
  id text not null,
  name text not null,
  format_key text not null,
  last_serial_number bigint not null default 0,
  primary key (business_id, id)
);

create table if not exists bills (
  id text primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  bill_type_id text not null,
  serial_number bigint not null,
  bill_number text,
  ledger_account_id text,
  party_name text not null,
  party_phone text,
  party_address text,
  date timestamptz not null,
  subtotal numeric(14, 2) not null,
  tax_percentage numeric(8, 3),
  tax_amount numeric(14, 2),
  discount_percentage numeric(8, 3),
  discount_amount numeric(14, 2),
  total_amount numeric(14, 2) not null,
  notes text,
  status text not null check (status in ('draft', 'saved')),
  payment_status text not null check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_id, bill_type_id) references bill_types(business_id, id) on delete restrict,
  unique (business_id, serial_number)
);

create table if not exists bill_items (
  id text primary key,
  bill_id text not null references bills(id) on delete cascade,
  product_id text references products(id) on delete set null,
  product_name_snapshot text not null,
  quantity numeric(14, 3) not null,
  rate numeric(14, 2) not null,
  cost_price numeric(14, 2),
  amount numeric(14, 2) not null
);

insert into businesses (id, business_name)
values ('00000000-0000-0000-0000-000000000001', 'BillBook Business')
on conflict (id) do nothing;

insert into bill_types (business_id, id, name, format_key, last_serial_number)
values
  ('00000000-0000-0000-0000-000000000001', 'type-1', 'SHAREEF TRADERS', 'type-1', 0),
  ('00000000-0000-0000-0000-000000000001', 'type-2', 'AL-GHANI TRADERS', 'type-2', 0),
  ('00000000-0000-0000-0000-000000000001', 'type-3', 'KING ENTERPRISE', 'type-3', 0)
on conflict (business_id, id) do nothing;

alter table businesses enable row level security;
alter table business_members enable row level security;
alter table products enable row level security;
alter table bill_types enable row level security;
alter table bills enable row level security;
alter table bill_items enable row level security;

create or replace function reserve_global_bill_number(p_business_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare next_number bigint;
begin
  update businesses
  set global_bill_number = global_bill_number + 1,
      updated_at = now()
  where id = p_business_id
  returning global_bill_number into next_number;
  if next_number is null then raise exception 'Business not found'; end if;
  return next_number;
end;
$$;

create or replace function get_next_bill_number(p_business_id uuid)
returns bigint
language sql
security definer
set search_path = public
as $$
select global_bill_number + 1 from businesses where id = p_business_id;
$$;

create or replace function create_bill_with_items(p_business_id uuid, p_bill jsonb, p_items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into bills (
    id,
    business_id,
    bill_type_id,
    serial_number,
    bill_number,
    ledger_account_id,
    party_name,
    party_phone,
    party_address,
    date,
    subtotal,
    tax_percentage,
    tax_amount,
    discount_percentage,
    discount_amount,
    total_amount,
    notes,
    status,
    payment_status,
    created_at,
    updated_at
  )
  select
    bill.id,
    p_business_id,
    bill.bill_type_id,
    bill.serial_number,
    bill.bill_number,
    bill.ledger_account_id,
    bill.party_name,
    bill.party_phone,
    bill.party_address,
    bill.date,
    bill.subtotal,
    bill.tax_percentage,
    bill.tax_amount,
    bill.discount_percentage,
    bill.discount_amount,
    bill.total_amount,
    bill.notes,
    bill.status,
    bill.payment_status,
    bill.created_at,
    bill.updated_at
  from jsonb_to_record(p_bill) as bill(
    id text,
    bill_type_id text,
    serial_number bigint,
    bill_number text,
    ledger_account_id text,
    party_name text,
    party_phone text,
    party_address text,
    date timestamptz,
    subtotal numeric(14, 2),
    tax_percentage numeric(8, 3),
    tax_amount numeric(14, 2),
    discount_percentage numeric(8, 3),
    discount_amount numeric(14, 2),
    total_amount numeric(14, 2),
    notes text,
    status text,
    payment_status text,
    created_at timestamptz,
    updated_at timestamptz
  );
  insert into bill_items select * from jsonb_populate_recordset(null::bill_items, p_items);
end;
$$;

revoke all on businesses, business_members, products, bill_types, bills, bill_items from anon, authenticated;
revoke all on function reserve_global_bill_number(uuid) from public, anon, authenticated;
revoke all on function get_next_bill_number(uuid) from public, anon, authenticated;
revoke all on function create_bill_with_items(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function reserve_global_bill_number(uuid) to service_role;
grant execute on function get_next_bill_number(uuid) to service_role;
grant execute on function create_bill_with_items(uuid, jsonb, jsonb) to service_role;
