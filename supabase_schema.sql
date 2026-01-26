-- Create table for Boosts
create table if not exists boosts (
  id uuid default gen_random_uuid() primary key,
  coin_address text not null,
  amount_paid numeric not null,
  duration_hours int not null default 24,
  user_fid bigint,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  tx_hash text
);

-- Create table for Graduated Coins (Launched)
create table if not exists graduated_coins (
  id uuid default gen_random_uuid() primary key,
  coin_address text not null,
  name text,
  ticker text,
  image_uri text,
  creator_fid bigint,
  created_at timestamptz default now()
);

-- Create table for Subscribers
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  user_fid bigint unique not null,
  trial_paid boolean default false,
  monthly_paid boolean default false,
  badge text default 'Free',
  start_date timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS (Row Level Security) - optional but recommended
alter table boosts enable row level security;
alter table graduated_coins enable row level security;
alter table subscribers enable row level security;

-- Create policies (public read for now)
create policy "Public read boosts" on boosts for select using (true);
create policy "Public insert boosts" on boosts for insert with check (true);

create policy "Public read graduated_coins" on graduated_coins for select using (true);
create policy "Public insert graduated_coins" on graduated_coins for insert with check (true);

create policy "Public read subscribers" on subscribers for select using (true);
create policy "Public insert subscribers" on subscribers for insert with check (true);
create policy "Public update subscribers" on subscribers for update using (true);
