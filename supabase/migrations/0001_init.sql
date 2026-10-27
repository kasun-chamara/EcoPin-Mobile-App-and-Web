-- EcoPin database schema (Supabase / PostgreSQL + PostGIS)
-- Run with: supabase db push   (or paste into the Supabase SQL editor)

create extension if not exists postgis;

-- ---------- Enums ----------
create type user_role   as enum ('citizen', 'driver', 'officer', 'admin');
create type pin_status  as enum ('reported', 'verified', 'assigned', 'on_the_way', 'collected', 'rejected');
create type pin_size    as enum ('few_bags', 'pile', 'truckload');

-- ---------- Councils (local authorities) ----------
create table public.councils (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  name_si     text,
  name_ta     text,
  district    text,
  boundary    geography(MultiPolygon, 4326) not null,
  created_at  timestamptz not null default now()
);
create index councils_boundary_idx on public.councils using gist (boundary);

-- ---------- Profiles (1:1 with auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  role        user_role not null default 'citizen',
  council_id  uuid references public.councils(id),
  language    text not null default 'si' check (language in ('si', 'en', 'ta')),
  truck_no    text,                       -- drivers only
  push_token  text,                       -- Expo push token
  points      integer not null default 0,
  created_at  timestamptz not null default now()
);

-- auto-create a profile when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Pins (garbage reports) ----------
create table public.pins (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null default ('EP-' || lpad((floor(random() * 99999))::text, 5, '0')),
  user_id      uuid references public.profiles(id) on delete set null,
  anonymous    boolean not null default false,
  location     geography(Point, 4326) not null,
  address      text,
  photo_urls   text[] not null default '{}',
  waste_types  text[] not null default '{}',
  size         pin_size not null default 'pile',
  note         text,
  status       pin_status not null default 'reported',
  council_id   uuid references public.councils(id),
  merged_into  uuid references public.pins(id),   -- duplicate merged by an officer
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index pins_location_idx on public.pins using gist (location);
create index pins_status_idx   on public.pins (status);
create index pins_council_idx  on public.pins (council_id);

-- route every new pin to the council whose boundary contains it
create or replace function public.assign_council()
returns trigger language plpgsql as $$
begin
  if new.council_id is null then
    select c.id into new.council_id
    from public.councils c
    where ST_Covers(c.boundary, new.location)
    limit 1;
  end if;
  new.updated_at := now();
  return new;
end; $$;

create trigger pins_assign_council
  before insert or update of location on public.pins
  for each row execute function public.assign_council();

-- ---------- "Me too +1" votes ----------
create table public.pin_votes (
  pin_id     uuid references public.pins(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pin_id, user_id)
);

-- ---------- Assignments (pin -> driver) ----------
create table public.assignments (
  id              uuid primary key default gen_random_uuid(),
  pin_id          uuid not null references public.pins(id) on delete cascade,
  driver_id       uuid not null references public.profiles(id),
  stop_order      integer,
  assigned_by     uuid references public.profiles(id),
  assigned_at     timestamptz not null default now(),
  started_at      timestamptz,
  collected_at    timestamptz,
  after_photo_url text,
  rating          smallint check (rating between 1 and 5)
);
create index assignments_driver_idx on public.assignments (driver_id, collected_at);

-- ---------- Live driver location ----------
create table public.driver_locations (
  driver_id  uuid primary key references public.profiles(id) on delete cascade,
  location   geography(Point, 4326) not null,
  heading    real,
  updated_at timestamptz not null default now()
);

-- ---------- In-app notifications ----------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  pin_id     uuid references public.pins(id) on delete cascade,
  kind       text not null,            -- 'verified' | 'on_the_way' | 'collected'
  title      text not null,
  body       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Badges ----------
create table public.badges (
  id          text primary key,         -- 'first_pin', 'beach_saver', 'streak_4', 'cleaned_10'
  name        text not null,
  description text
);
create table public.user_badges (
  user_id   uuid references public.profiles(id) on delete cascade,
  badge_id  text references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);
insert into public.badges (id, name, description) values
  ('first_pin',   'First pin',    'Pinned your first spot'),
  ('beach_saver', 'Beach saver',  'Pinned a spot near the coast'),
  ('streak_4',    '4-day streak', 'Pinned on 4 days in a row'),
  ('cleaned_10',  '10 cleaned',   '10 of your pins were cleaned');

-- ---------- When a pin is collected: notify reporter + give points ----------
create or replace function public.on_assignment_collected()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_user uuid;
begin
  if new.collected_at is not null and old.collected_at is null then
    update public.pins set status = 'collected', updated_at = now()
      where id = new.pin_id returning user_id into v_user;
    if v_user is not null then
      insert into public.notifications (user_id, pin_id, kind, title, body)
      values (v_user, new.pin_id, 'collected', 'We cleaned it together!',
              'Your pin was collected. Thank you for keeping Sri Lanka clean.');
      update public.profiles set points = points + 20 where id = v_user;
    end if;
  end if;
  return new;
end; $$;

create trigger assignments_collected
  after update of collected_at on public.assignments
  for each row execute function public.on_assignment_collected();

-- ---------- Views ----------
-- pins with lat/lng for the apps (Sri Lanka time for "today")
create or replace view public.pins_view as
select p.*,
       ST_Y(p.location::geometry) as lat,
       ST_X(p.location::geometry) as lng,
       (select count(*) from public.pin_votes v where v.pin_id = p.id) as votes
from public.pins p
where p.merged_into is null;

-- daily cleaned count per council
create or replace view public.daily_stats as
select council_id,
       count(*) filter (where status = 'collected'
         and (updated_at at time zone 'Asia/Colombo')::date = (now() at time zone 'Asia/Colombo')::date) as cleaned_today,
       count(*) filter (where status in ('reported', 'verified', 'assigned', 'on_the_way')) as waiting
from public.pins
where merged_into is null
group by council_id;

-- nearby pins (for the "already pinned 30 m away" card)
create or replace function public.pins_near(lat double precision, lng double precision, radius_m integer default 50)
returns setof public.pins_view language sql stable as $$
  select * from public.pins_view
  where status <> 'collected'
    and ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_m)
  order by ST_Distance(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography);
$$;

-- ---------- Row level security ----------
alter table public.profiles         enable row level security;
alter table public.pins             enable row level security;
alter table public.pin_votes        enable row level security;
alter table public.assignments      enable row level security;
alter table public.driver_locations enable row level security;
alter table public.notifications    enable row level security;
alter table public.councils         enable row level security;
alter table public.user_badges      enable row level security;
alter table public.badges           enable row level security;

create or replace function public.my_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create policy "councils readable"   on public.councils    for select using (true);
create policy "badges readable"     on public.badges      for select using (true);

create policy "own profile read"    on public.profiles for select using (id = auth.uid() or public.my_role() in ('officer', 'admin'));
create policy "own profile update"  on public.profiles for update using (id = auth.uid());

create policy "pins readable"       on public.pins for select using (true);
create policy "citizens create pins" on public.pins for insert with check (user_id = auth.uid());
create policy "officers update pins" on public.pins for update using (public.my_role() in ('officer', 'admin', 'driver'));

create policy "votes read"          on public.pin_votes for select using (true);
create policy "votes insert own"    on public.pin_votes for insert with check (user_id = auth.uid());

create policy "assignments read"    on public.assignments for select
  using (driver_id = auth.uid() or public.my_role() in ('officer', 'admin')
         or exists (select 1 from public.pins p where p.id = pin_id and p.user_id = auth.uid()));
create policy "officers assign"     on public.assignments for insert with check (public.my_role() in ('officer', 'admin'));
create policy "driver updates own"  on public.assignments for update using (driver_id = auth.uid() or public.my_role() in ('officer', 'admin'));

create policy "driver location read"  on public.driver_locations for select using (true);
create policy "driver location write" on public.driver_locations for all using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy "own notifications"   on public.notifications for select using (user_id = auth.uid());
create policy "mark read"           on public.notifications for update using (user_id = auth.uid());

create policy "own badges"          on public.user_badges for select using (true);

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.driver_locations, public.pins, public.notifications;

-- ---------- Storage bucket for photos ----------
insert into storage.buckets (id, name, public) values ('pin-photos', 'pin-photos', true)
on conflict (id) do nothing;

create policy "anyone reads pin photos" on storage.objects for select using (bucket_id = 'pin-photos');
create policy "signed-in users upload"  on storage.objects for insert with check (bucket_id = 'pin-photos' and auth.role() = 'authenticated');

-- driver position as lat/lng (used by the citizen "truck on the way" card)
create or replace function public.driver_latlng(p_driver uuid)
returns json language sql stable as $$
  select json_build_object('lat', ST_Y(location::geometry), 'lng', ST_X(location::geometry))
  from public.driver_locations where driver_id = p_driver;
$$;
