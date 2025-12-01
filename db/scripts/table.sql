create table positions (
  id uuid default uuid_generate_v4() primary key,
  stock text not null,
  entry_type text check (entry_type in ('buy', 'short')) not null,
  purchase_price numeric,
  target numeric,
  stop_loss numeric,
  quantity numeric,
  profit_loss numeric,
  learning text,
  created_at timestamptz default now()
);




