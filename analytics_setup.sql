-- ==========================================
-- Admin Analytics Schema (Orders & Carts)
-- ==========================================

-- 1. Orders Table
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete set null,
    customer_name text not null,
    customer_email text not null,
    total_amount numeric not null,
    status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
    shipping_address jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Order Items Table
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders on delete cascade,
    product_id uuid references public.products on delete set null,
    quantity integer not null default 1,
    size text,
    price_at_time numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Product Analytics Table (For highly carted / viewed products tracking)
create table if not exists public.product_analytics (
    id uuid default uuid_generate_v4() primary key,
    product_id uuid references public.products on delete cascade,
    event_type text not null check (event_type in ('view', 'add_to_cart')),
    user_id uuid references auth.users on delete set null, -- Optional: track logged in users
    session_id text, -- Optional: track anonymous users
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.product_analytics enable row level security;

-- 5. RLS Policies

-- Users can view their own orders
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders
    for select using (auth.uid() = user_id);

-- Admins can view and manage all orders
drop policy if exists "Admins manage all orders" on public.orders;
create policy "Admins manage all orders" on public.orders
    for all using (public.is_admin());

-- Users can view their own order items
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = order_items.order_id
            and orders.user_id = auth.uid()
        )
    );

-- Admins can view and manage all order items
drop policy if exists "Admins manage all order items" on public.order_items;
create policy "Admins manage all order items" on public.order_items
    for all using (public.is_admin());

-- Anyone can insert into product analytics (views/carts)
drop policy if exists "Public insert analytics" on public.product_analytics;
create policy "Public insert analytics" on public.product_analytics
    for insert with check (true);

-- Only admins can read product analytics
drop policy if exists "Admins read analytics" on public.product_analytics;
create policy "Admins read analytics" on public.product_analytics
    for select using (public.is_admin());


-- 6. Helper functions for Analytics Dashboard

-- Drop the old version of the function if it exists to prevent PostgREST ambiguity (PGRST203)
drop function if exists public.get_sales_overview(text);

-- Get Sales Overview (Daily/Weekly/Monthly/Custom)
create or replace function public.get_sales_overview(time_range text, start_date date default null, end_date date default null)
returns table (
    period text,
    total_sales numeric,
    order_count bigint
) as $$
begin
    if time_range = 'custom' and start_date is not null and end_date is not null then
        return query
        select 
            to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as period,
            sum(total_amount) as total_sales,
            count(id) as order_count
        from public.orders
        where created_at::date >= start_date and created_at::date <= end_date
        group by 1
        order by 1;
    elsif time_range = 'daily' then
        return query
        select 
            to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as period,
            sum(total_amount) as total_sales,
            count(id) as order_count
        from public.orders
        where created_at >= now() - interval '30 days'
        group by 1
        order by 1;
    elsif time_range = 'weekly' then
        return query
        select 
            to_char(date_trunc('week', created_at), 'YYYY-WW') as period,
            sum(total_amount) as total_sales,
            count(id) as order_count
        from public.orders
        where created_at >= now() - interval '12 weeks'
        group by 1
        order by 1;
    else -- monthly
        return query
        select 
            to_char(date_trunc('month', created_at), 'YYYY-MM') as period,
            sum(total_amount) as total_sales,
            count(id) as order_count
        from public.orders
        where created_at >= now() - interval '12 months'
        group by 1
        order by 1;
    end if;
end;
$$ language plpgsql security definer;

-- Get High Demand Products
create or replace function public.get_high_demand_products(limit_num int default 5)
returns table (
    product_id uuid,
    product_name text,
    total_quantity_sold bigint,
    total_revenue numeric
) as $$
begin
    return query
    select 
        p.id,
        p.name,
        sum(oi.quantity) as total_quantity_sold,
        sum(oi.quantity * oi.price_at_time) as total_revenue
    from public.order_items oi
    join public.products p on p.id = oi.product_id
    join public.orders o on o.id = oi.order_id
    group by p.id, p.name
    order by total_quantity_sold desc
    limit limit_num;
end;
$$ language plpgsql security definer;

-- Get Highly Carted Products
create or replace function public.get_highly_carted_products(limit_num int default 5)
returns table (
    product_id uuid,
    product_name text,
    cart_count bigint
) as $$
begin
    return query
    select 
        p.id,
        p.name,
        count(pa.id) as cart_count
    from public.product_analytics pa
    join public.products p on p.id = pa.product_id
    where pa.event_type = 'add_to_cart'
    group by p.id, p.name
    order by cart_count desc
    limit limit_num;
end;
$$ language plpgsql security definer;
