-- ============================================================================
-- Sprint 5 (revision): Investor pitch-deck viewing
-- ============================================================================
-- Follow-up to 20260811090000_investor_discovery.sql: that migration let
-- investors read published *startup rows*; this one extends the same
-- idea to the pitch deck *file* sitting in the private `pitch-decks`
-- bucket, so `getPitchDeckSignedUrl()` (lib/queries/startup.ts) can
-- succeed for an investor rather than only for the owning founder.
--
-- Nothing about founders' own access changes - additive, same as
-- before.
-- ============================================================================

-- Objects live at `{founder_id}/{startup_id}/{file}.pdf`
-- (lib/startup/pitch-deck-actions.ts), so `storage.foldername(name)`
-- gives us both ids to check against the `startups` row itself:
--   [1] founder_id - who uploaded it
--   [2] startup_id - which startup it belongs to
-- Both are re-checked against the `startups` table (not just trusted
-- from the path) so a fabricated path can't be used to reach a deck
-- that isn't actually attached to a published startup.
create policy "Investors can read pitch decks for published startups"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pitch-decks'
    and exists (
      select 1
      from public.startups s
      where s.id::text = (storage.foldername(name))[2]
        and s.founder_id::text = (storage.foldername(name))[1]
        and s.status = 'published'
    )
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'investor'
    )
  );

comment on policy "Investors can read pitch decks for published startups" on storage.objects is
  'Sprint 5 revision. Lets an investor''s session generate a signed URL '
  'for a published startup''s deck (view, not a public/permanent link - '
  'still 5 minutes, still regenerated fresh every time, see '
  'getPitchDeckSignedUrl). Draft-startup decks are never reachable this '
  'way regardless of the path guessed.';
