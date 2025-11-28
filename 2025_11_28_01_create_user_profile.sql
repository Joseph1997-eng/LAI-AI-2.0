-- Create user_profile table
create table if not exists public.user_profile (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profile enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.user_profile for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.user_profile for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.user_profile for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile when a new user signs up (optional but good practice)
-- For now, we'll stick to manual creation via API as requested, or just rely on the app to create it.
