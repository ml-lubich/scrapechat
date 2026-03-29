-- ScrapeChatAI database schema
-- Run this in Supabase SQL editor or via supabase db push

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  subscription_status text not null default 'active' check (subscription_status in ('active', 'canceled', 'past_due', 'trialing')),
  scrape_count_this_month integer not null default 0,
  current_period_start timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Scrape jobs table
create table if not exists public.scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  url text,
  status text not null default 'pending' check (status in ('pending', 'generating', 'complete', 'error')),
  ai_response text,
  generated_script text,
  zod_schema text,
  results jsonb,
  items_count integer not null default 0,
  error text,
  created_at timestamptz not null default now()
);

-- Recipes table
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  url_pattern text,
  script_template text not null,
  schema_definition text,
  times_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_scrape_jobs_user_id on public.scrape_jobs(user_id);
create index if not exists idx_scrape_jobs_created_at on public.scrape_jobs(created_at desc);
create index if not exists idx_recipes_user_id on public.recipes(user_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.scrape_jobs enable row level security;
alter table public.recipes enable row level security;

-- RLS policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS policies for scrape_jobs
create policy "Users can view own scrape jobs"
  on public.scrape_jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert own scrape jobs"
  on public.scrape_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scrape jobs"
  on public.scrape_jobs for update
  using (auth.uid() = user_id);

-- RLS policies for recipes
create policy "Users can view own recipes"
  on public.recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert own recipes"
  on public.recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recipes"
  on public.recipes for update
  using (auth.uid() = user_id);

create policy "Users can delete own recipes"
  on public.recipes for delete
  using (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to reset monthly scrape counts (run via cron)
create or replace function public.reset_monthly_scrape_counts()
returns void as $$
begin
  update public.profiles
  set scrape_count_this_month = 0,
      current_period_start = now(),
      updated_at = now();
end;
$$ language plpgsql security definer;
