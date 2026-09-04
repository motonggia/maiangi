create type public.user_role as enum ('STUDENT', 'PARENT', 'ADMIN');
create type public.approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  role public.user_role not null default 'STUDENT',
  phone1 text not null,
  phone2 text,
  school_id text not null,
  class_id text not null,
  child_name text,
  student_id uuid references public.profiles(id) on delete set null,
  parent_id uuid references public.profiles(id) on delete set null,
  approval_status public.approval_status not null default 'PENDING',
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_status_idx on public.profiles(approval_status);
create index profiles_role_idx on public.profiles(role);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, username, full_name, role, phone1, phone2, school_id, class_id, child_name, approval_status
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'STUDENT'),
    coalesce(new.raw_user_meta_data->>'phone1', ''),
    new.raw_user_meta_data->>'phone2',
    coalesce(new.raw_user_meta_data->>'school_id', ''),
    coalesce(new.raw_user_meta_data->>'class_id', ''),
    new.raw_user_meta_data->>'child_name',
    'PENDING'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN' and approval_status = 'APPROVED'
  );
$$;

alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert to authenticated
with check (id = auth.uid());

-- Chỉ Admin đã được duyệt mới có thể xóa tài khoản hoàn toàn khỏi Auth và profiles.
create or replace function public.delete_user_account(target_user_id uuid)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'Chỉ quản trị viên đã được duyệt mới có quyền xóa tài khoản';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Không thể tự xóa tài khoản quản trị viên đang đăng nhập';
  end if;
  delete from auth.users where id = target_user_id;
end;
$$;

revoke all on function public.delete_user_account(uuid) from public;
grant execute on function public.delete_user_account(uuid) to authenticated;
