create table if not exists ledger_accounts (
  id text primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  company_id text,
  name text not null,
  account_code text,
  type text not null check (type in ('Customer', 'Supplier', 'Society / Company', 'Other')),
  contact_details text,
  project_name text,
  project_code text,
  tax_enabled boolean not null default true,
  tax_name text,
  tax_rate numeric(8, 3),
  opening_balance numeric(14, 2) not null default 0,
  opening_balance_type text not null check (opening_balance_type in ('debit', 'credit')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, id),
  foreign key (business_id, company_id)
    references bill_types(business_id, id)
    on delete restrict
);

create table if not exists ledger_transactions (
  id text primary key,
  ledger_account_id text not null,
  business_id uuid not null references businesses(id) on delete cascade,
  bill_id text references bills(id) on delete cascade,
  date timestamptz not null,
  voucher_number text,
  payment_mode text,
  description text not null,
  debit numeric(14, 2) not null default 0 check (debit >= 0),
  credit numeric(14, 2) not null default 0 check (credit >= 0),
  balance numeric(14, 2) not null default 0,
  transaction_type text not null check (transaction_type in ('bill', 'payment', 'opening', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (business_id, ledger_account_id)
    references ledger_accounts(business_id, id)
    on delete cascade
);

alter table bills
  add constraint bills_ledger_account_id_fkey
  foreign key (ledger_account_id)
  references ledger_accounts(id)
  on delete set null;

create index if not exists ledger_accounts_business_id_idx
  on ledger_accounts (business_id);

create index if not exists ledger_accounts_company_id_idx
  on ledger_accounts (company_id);

create index if not exists ledger_transactions_business_id_idx
  on ledger_transactions (business_id);

create index if not exists ledger_transactions_account_date_idx
  on ledger_transactions (ledger_account_id, date, created_at);

create index if not exists ledger_transactions_bill_id_idx
  on ledger_transactions (bill_id);

create index if not exists ledger_transactions_account_type_idx
  on ledger_transactions (ledger_account_id, transaction_type);

create unique index if not exists ledger_transactions_bill_generated_unique
  on ledger_transactions (bill_id)
  where transaction_type = 'bill' and bill_id is not null;

alter table ledger_accounts enable row level security;
alter table ledger_transactions enable row level security;
