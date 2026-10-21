-- KOOS research survey — tables, security and grants.
-- INF-10. Run once, in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Creates identical structures in two schemas:
--   public   -> production data   (koos-ayo.com)
--   staging  -> preview and local (PR previews, localhost)
--
-- SECURITY MODEL (deliberate, do not "fix" this later):
--   * RLS is enabled on every table and NO POLICIES EXIST.
--     With RLS on and no policy, every role subject to RLS is denied everything.
--   * Only the server writes, using the Supabase SECRET key (service_role),
--     which bypasses RLS. That key never reaches the browser.
--   * anon and authenticated are explicitly revoked, so even a leaked
--     publishable key can do nothing at all - not read, not write.
--
-- PRIVACY MODEL:
--   research_responses and research_contacts share NO key, no foreign key and
--   no timestamp precise enough to correlate them. research_contacts stores a
--   DATE, not a timestamp, on purpose. This is the promise the questionnaire's
--   privacy box makes to respondents. Never add a link between these tables.

create schema if not exists staging;

do $$
declare
  target_schema text;
begin
  foreach target_schema in array array['public', 'staging']
  loop

    ----------------------------------------------------------------------------
    -- Answers. One row per respondent. Partial rows are kept on purpose so that
    -- drop-off is measurable (consent is taken at Q1 before anything is stored).
    ----------------------------------------------------------------------------
    execute format($fmt$
      create table if not exists %I.research_responses (
        id             uuid        primary key default gen_random_uuid(),
        submitted_at   timestamptz not null default now(),
        updated_at     timestamptz not null default now(),
        survey_version text        not null default 'v3',
        completed      boolean     not null default false,
        last_section   smallint    not null default 0,
        answers        jsonb       not null default '{}'::jsonb
      );
    $fmt$, target_schema);

    execute format(
      'comment on table %I.research_responses is %L',
      target_schema,
      'Anonymous survey answers. Never store IP, user agent, or anything linking to research_contacts.'
    );

    ----------------------------------------------------------------------------
    -- Follow-up emails. Kept apart from answers. DATE not timestamp, so a row
    -- here cannot be matched to a response by submission time.
    ----------------------------------------------------------------------------
    execute format($fmt$
      create table if not exists %I.research_contacts (
        id         uuid primary key default gen_random_uuid(),
        created_on date not null default current_date,
        email      text not null,
        follow_up  text not null check (follow_up in ('yes', 'maybe'))
      );
    $fmt$, target_schema);

    execute format(
      'comment on table %I.research_contacts is %L',
      target_schema,
      'Follow-up emails only. No response id, no timestamp. Must never be joinable to research_responses.'
    );

    -- Useful for analysis; neither index weakens the separation above.
    execute format(
      'create index if not exists research_responses_completed_idx on %I.research_responses (completed, last_section)',
      target_schema
    );

    ----------------------------------------------------------------------------
    -- Lock both tables. RLS on + zero policies = denied for every RLS-subject
    -- role. The server's secret key bypasses RLS and is the only writer.
    ----------------------------------------------------------------------------
    execute format('alter table %I.research_responses enable row level security', target_schema);
    execute format('alter table %I.research_contacts  enable row level security', target_schema);

    execute format('revoke all on %I.research_responses from anon, authenticated', target_schema);
    execute format('revoke all on %I.research_contacts  from anon, authenticated', target_schema);

    ----------------------------------------------------------------------------
    -- A non-public schema has no default grants, so service_role must be given
    -- access explicitly or every preview deploy fails with "permission denied".
    ----------------------------------------------------------------------------
    execute format('grant usage on schema %I to service_role', target_schema);
    execute format('grant all on %I.research_responses to service_role', target_schema);
    execute format('grant all on %I.research_contacts  to service_role', target_schema);

  end loop;
end
$$;

-- Keep the anon role out of the staging schema entirely.
revoke all on schema staging from anon, authenticated;

-- ---------------------------------------------------------------------------
-- VERIFY (INF-13). Run these after the migration.
--
--   -- Expect exactly 4 rows, all with rowsecurity = true:
--   select schemaname, tablename, rowsecurity
--   from pg_tables
--   where tablename in ('research_responses','research_contacts');
--
--   -- Expect ZERO rows. Any row here means something can reach the data.
--   select * from pg_policies
--   where tablename in ('research_responses','research_contacts');
--
-- Then: Project Settings -> API -> Exposed schemas -> add "staging" (INF-11).
-- Skipping that step makes every preview deploy fail with
-- "The schema must be one of the following: public".
-- ---------------------------------------------------------------------------
