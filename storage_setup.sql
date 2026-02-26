-- ==========================================
-- Glam Abaya Storage Configuration
-- ==========================================

-- 1. Create the bucket if it doesn't exist
-- Note: 'storage' is a protected schema in Supabase
insert into storage.buckets (id, name, public)
select 'glam_assets', 'glam_assets', true
where not exists (
    select 1 from storage.buckets where id = 'glam_assets'
);

-- 2. Setup RLS Policies for Storage
-- We use public.is_admin() which we already defined in our main schema

-- Allow public viewing of images
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects
  for select using (bucket_id = 'glam_assets');

-- Allow admins to upload and manage images
drop policy if exists "Admin Upload Access" on storage.objects;
create policy "Admin Upload Access" on storage.objects
  for insert with check (
    bucket_id = 'glam_assets' 
    and (select public.is_admin())
  );

drop policy if exists "Admin Update Access" on storage.objects;
create policy "Admin Update Access" on storage.objects
  for update using (
    bucket_id = 'glam_assets' 
    and (select public.is_admin())
  );

drop policy if exists "Admin Delete Access" on storage.objects;
create policy "Admin Delete Access" on storage.objects
  for delete using (
    bucket_id = 'glam_assets' 
    and (select public.is_admin())
  );
