alter table public.workout_sets
  add column if not exists profile text not null default 'ashay'
  check (profile in ('ashay', 'girlfriend'));

alter table public.measurements
  add column if not exists profile text not null default 'ashay'
  check (profile in ('ashay', 'girlfriend'));

create index if not exists workout_sets_user_profile_date_idx
  on public.workout_sets(user_id, profile, performed_at desc);

create index if not exists measurements_user_profile_date_idx
  on public.measurements(user_id, profile, measured_at desc);
