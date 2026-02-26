-- Create influencers table
create table if not exists public.influencers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    video_url text,
    thumbnail_url text,
    is_active boolean default true,
    display_order int default 0,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.influencers enable row level security;

-- Policies
drop policy if exists "Influencers are viewable by everyone" on public.influencers;
create policy "Influencers are viewable by everyone"
on public.influencers for select
using (true);

drop policy if exists "Admins can manage influencers" on public.influencers;
create policy "Admins can manage influencers"
on public.influencers for all
using (public.is_admin())
with check (public.is_admin());

-- Add sample data (optional, but helpful for testing)
-- insert into public.influencers (name, video_url, thumbnail_url, display_order)
-- values ('Sample Influencer', 'https://example.com/video.mp4', 'https://placehold.co/400x600', 1);
