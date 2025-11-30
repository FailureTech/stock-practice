create table positions (
  id uuid default uuid_generate_v4() primary key,
  stock text not null,
  entry_type text check (entry_type in ('buy', 'sell')) not null,
  purchase_price numeric,
  target numeric,
  stop_loss numeric,
  quantity numeric,
  created_at timestamptz default now()
);