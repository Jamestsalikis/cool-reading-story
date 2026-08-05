-- ============================================================================
-- App security lockdown  (Phase 4 — RLS audit remediation)
-- ============================================================================
-- Context: once the native app talks to Supabase directly with the anon key +
-- user JWT, these are the only things stopping a user from bypassing the paywall.
-- The `app-generate` edge function does all privileged writes as the SERVICE ROLE
-- (which bypasses these grants), so the app path keeps working after this runs.
--
-- ⚠️  SEQUENCING — DO NOT APPLY BLINDLY:
-- The Next.js /api routes on the web currently perform counter/subscription
-- writes as the caller's `authenticated` role (lib/subscription.ts +
-- generate-story / generate-sequel routes). Applying sections 1 & 2 below will
-- break those web routes until their privileged writes are switched to a
-- service-role client (lib/supabase/admin.ts). Apply order:
--   (a) migrate the web /api counter/subscription writes to the service role, OR
--       accept that the web app on THIS project stops writing counters, then
--   (b) run this migration.
-- Production web uses a different Supabase project, so applying this on staging
-- only affects staging web testing.
-- ============================================================================

-- ── 1. [HIGH] Entitlement RPCs must not be client-callable ───────────────────
-- These SECURITY DEFINER functions mutate paywall counters / grant entitlements.
-- Only the edge function (service role) should call them.
-- NOTE: EXECUTE is granted to PUBLIC by default, and anon/authenticated inherit
-- it via PUBLIC — so `revoke ... from anon, authenticated` alone is a NO-OP.
-- Must revoke from PUBLIC, then re-grant only to service_role.
do $$
declare fn text;
begin
  foreach fn in array array[
    'public.grant_extra_book_today(uuid)',
    'public.increment_extra_child_slots(uuid)',
    'public.decrement_extra_child_slots(uuid)',
    'public.decrement_free_stories(uuid)',
    'public.increment_stories_today(uuid)',
    'public.increment_stories_this_month(uuid)'
  ]
  loop
    execute 'revoke execute on function '||fn||' from public, anon, authenticated';
    execute 'grant execute on function '||fn||' to service_role';
  end loop;
end $$;

-- ── 2. [HIGH] user_subscriptions: clients may only write has_seen_tour ───────
-- Row scoping stays via existing RLS (auth.uid() = user_id). Column privileges
-- stop a client from writing status / counters (e.g. self-upgrading to subscribed).
revoke update on public.user_subscriptions from authenticated;
grant  update (has_seen_tour) on public.user_subscriptions to authenticated;

-- ── 3. [MED] story-images bucket: writes are service-role only ───────────────
-- Images are generated + uploaded by the generate-story-images edge function
-- (service role, which bypasses RLS). Remove the broad authenticated write access.
drop policy if exists "Authenticated users can upload story images" on storage.objects;
drop policy if exists "Authenticated users can update story images" on storage.objects;

-- ── 4. [LOW] story-images: stop clients listing every file ───────────────────
-- Public object URLs keep working without a broad SELECT/listing policy. Replace
-- the listing policy with nothing (public URLs are served by the storage CDN).
drop policy if exists "Public read story images" on storage.objects;
-- (If direct anonymous object reads via the REST list endpoint are ever needed,
--  re-add a narrower policy. Rendering <img src=publicUrl> does NOT need one.)

-- ── 5. [enforcement] Free-user child limit, server-side ──────────────────────
-- The "free users get 1 child" gate currently lives in client code
-- (lib/supabase/child-client.ts) and is therefore bypassable. Enforce it in the
-- database so it holds regardless of client.
create or replace function public.enforce_free_child_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin boolean;
  max_children int;
  existing int;
begin
  select exists(
    select 1 from admin_emails a
    join auth.users u on u.email = a.email
    where u.id = new.parent_id
  ) into is_admin;
  if is_admin then return new; end if;

  select 1 + coalesce(
    (select extra_child_slots from user_subscriptions where user_id = new.parent_id), 0)
    into max_children;

  select count(*) from children where parent_id = new.parent_id into existing;

  if existing >= max_children then
    raise exception 'extra_child_required' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_free_child_limit on public.children;
create trigger trg_enforce_free_child_limit
  before insert on public.children
  for each row execute function public.enforce_free_child_limit();

-- Trigger-only functions must not be REST-callable (triggers fire regardless of
-- EXECUTE grants, so revoking from the API roles is safe).
revoke execute on function public.handle_new_user()          from public, anon, authenticated;
revoke execute on function public.enforce_free_child_limit() from public, anon, authenticated;

-- ── 6. [LOW] Auth: enable leaked-password protection ─────────────────────────
-- Not SQL — enable in Supabase Dashboard → Authentication → Policies:
--   "Leaked password protection" (checks HaveIBeenPwned).
