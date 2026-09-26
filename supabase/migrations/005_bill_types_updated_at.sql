alter table bill_types
  add column if not exists updated_at timestamptz not null default now();