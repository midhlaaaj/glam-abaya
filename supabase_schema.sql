-- ==========================================
-- Glam Abaya Enterprise Auth & RBAC Schema
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Custom Types
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'admin', 'superadmin');
  end if;
end $$;

-- 2. Profiles Table - Handle Migration if exists with old schema
do $$
begin
  -- If table exists and role is text, we migrate it
  if exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role' and table_schema = 'public' and data_type = 'text') then
    -- 1. Drop the default value and constraints first
    alter table public.profiles alter column role drop default;
    
    -- 2. Try to drop the check constraint if it exists (standard Supabase pattern often names it profiles_role_check)
    alter table public.profiles drop constraint if exists profiles_role_check;
    
    -- 3. Update existing values to match new enum values before casting
    update public.profiles set role = 'user' where role not in ('user', 'admin', 'superadmin', 'Editor', 'Super Admin');
    update public.profiles set role = 'admin' where role = 'Editor';
    update public.profiles set role = 'superadmin' where role = 'Super Admin';
    
    -- 4. Cast the column to the new enum type
    alter table public.profiles alter column role type public.user_role using role::public.user_role;
    
    -- 5. Set the new default
    alter table public.profiles alter column role set default 'user'::public.user_role;
  end if;
end $$;

-- Now create/ensure table matches new schema
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    email text unique not null,
    role public.user_role default 'user'::public.user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Business Tables (Existing)
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    is_visible boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    category_id uuid references public.categories on delete set null,
    sizes text[] default '{"S","M","L","XL"}',
    base_price numeric not null,
    discount_type text default 'none' check (discount_type in ('percentage', 'flat', 'none')),
    discount_value numeric default 0,
    final_price numeric not null,
    stock integer default 0,
    is_on_sale boolean default false,
    is_featured boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.product_images (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products on delete cascade,
    url text not null,
    display_order integer default 0
);

create table if not exists public.hero_section (
    id uuid default uuid_generate_v4() primary key,
    image_url text,
    pre_heading text,
    title text not null,
    description text,
    button1_text text,
    button1_link text,
    button2_text text,
    button2_link text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Security Helpers (Security Definer to bypass RLS loops)
create or replace function public.get_auth_role()
returns public.user_role as $$
declare
  current_role public.user_role;
begin
  select role from public.profiles where id = auth.uid() into current_role;
  return current_role;
end;
$$ language plpgsql security definer;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$ language sql security definer;

create or replace function public.is_superadmin()
returns boolean as $$
  select exists (
    select 1 from public.profiles 
    where id = auth.uid() and role = 'superadmin'
  );
$$ language sql security definer;

-- 5. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.hero_section enable row level security;

-- 6. RLS Policies

-- -- Profiles Policies -- --
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "Users can update own name" on public.profiles;
create policy "Users can update own name" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and role = (select role from public.profiles where id = auth.uid()) -- Prevent role change
  );

drop policy if exists "Superadmins manage all" on public.profiles;
create policy "Superadmins manage all" on public.profiles
  for all using (public.is_superadmin());

-- -- Business Tables Policies -- --
-- Public Read Access
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Public read product_images" on public.product_images;
create policy "Public read product_images" on public.product_images for select using (true);

drop policy if exists "Public read hero" on public.hero_section;
create policy "Public read hero" on public.hero_section for select using (true);

-- Admin Mutation Access
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all using (public.is_admin());

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all using (public.is_admin());

drop policy if exists "Admins manage product_images" on public.product_images;
create policy "Admins manage product_images" on public.product_images for all using (public.is_admin());

drop policy if exists "Admins manage hero" on public.hero_section;
create policy "Admins manage hero" on public.hero_section for all using (public.is_admin());

-- 7. Triggers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', 'Glam User'), 
    'user'::public.user_role
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 8. Superadmin Setup
DO $$
DECLARE
  new_admin_id uuid := uuid_generate_v4();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@glamabayas.com') THEN
    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      new_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@glamabayas.com', crypt('Admiin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Global Super Admin"}', now(), now(),
      '', '', '', ''
    );
    
    update public.profiles
    set role = 'superadmin'::public.user_role
    where id = new_admin_id;
  ELSE
    update public.profiles
    set role = 'superadmin'::public.user_role
    where email = 'admin@glamabayas.com';
  END IF;
END $$;
