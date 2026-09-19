-- ----------------------------------------------------------------------------
-- Corrective migration: force storage.buckets.file_size_limit to match the
-- app's advertised limits.
-- ----------------------------------------------------------------------------
-- The bucket inserts in 20260808130000_founder_investor_profile_details.sql
-- and 20260809080000_startups.sql all use `on conflict (id) do nothing`. That
-- makes them safe to re-run, but it also means that if these four buckets
-- were ever created locally with a *different* file_size_limit before those
-- insert statements were finalized (e.g. an early placeholder value, or a
-- bucket created once by hand in Studio), no later edit to those migration
-- files - and no later `npm run dev` - will ever correct the row that's
-- already sitting in storage.buckets. Editing an already-applied migration
-- file doesn't cause Supabase to re-run it; only a fresh apply of this new
-- migration (or a full `supabase db reset`) will.
--
-- This is also why the symptom is silent: the size check happens inside
-- Supabase Storage itself, `uploadError` from `.storage.from(bucket).upload()`
-- was being swallowed into a generic "Couldn't upload..." message with no
-- console.error, so the real "exceeded the maximum allowed size" reason
-- never reached the terminal. That logging has been added alongside this
-- migration (lib/startup/asset-actions.ts, lib/startup/pitch-deck-actions.ts)
-- so any future mismatch like this is visible immediately instead of only
-- showing up as an unexplained UI failure.
--
-- Idempotent: safe to run any number of times.
update storage.buckets set file_size_limit = 5242880  where id = 'avatars';        -- 5MB
update storage.buckets set file_size_limit = 5242880  where id = 'startup-logos';  -- 5MB
update storage.buckets set file_size_limit = 8388608  where id = 'startup-covers'; -- 8MB
update storage.buckets set file_size_limit = 20971520 where id = 'pitch-decks';    -- 20MB
