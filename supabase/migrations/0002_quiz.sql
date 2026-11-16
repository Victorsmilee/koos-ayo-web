-- KOOS onboarding quiz ("Your pattern") - table, security and grants.
-- Run once, in the Supabase SQL Editor. Idempotent: safe to re-run.
--
-- Creates the same structure in both schemas:
--   public   -> production data   (koos-ayo.com)
--   staging  -> preview and local (PR previews, localhost)
--
-- SECURITY MODEL: identical to 0001_research.sql, and for the same reasons.
--   * RLS is enabled and NO POLICIES EXIST, so every role subject to RLS is
--     denied everything.
--   * Only the server writes, with the Supabase SECRET key (service_role),
--     which bypasses RLS. That key never reaches the browser.
--   * anon and authenticated are explicitly revoked, so a leaked publishable
--     key can do nothing at all.
--   Never add an anon policy to this table.
--
-- WHY IT IS SEPARATE FROM research_responses
--   Different activity, different lawful basis, different retention. The study
--   is anonymous research under consent; this is onboarding someone who is on
--   their way to an account. Mixing them would put survey answers and funnel
--   answers in one table with one retention rule, and the survey's promise of
--   anonymity is the thing that would break.
--
-- WHAT IS NOT HERE
--   No email column. The address is collected on the result screen only if
--   someone chooses to give it, and it lands in research_contacts' successor
--   rather than beside the answers, for the same reason the survey keeps the
--   two apart: an answer set with an address attached is no longer anonymous,
--   and nothing in this table should be able to name anyone.
--
--   No IP address, no user agent, no referrer. The ad network already knows
--   where the click came from; we do not need to.

create schema if not exists staging;

do $$
declare
  target_schema text;
begin
  foreach target_schema in array array['public', 'staging']
  loop

    ----------------------------------------------------------------------------
    -- One row per visitor who starts the quiz. Partial rows are kept on
    -- purpose, exactly as the survey keeps them: where people stop is the most
    -- useful thing a funnel can tell you, and it cannot be recovered later.
    --
    -- `claim_token` is how a completed quiz is attached to an account after
    -- sign-up. It is a random uuid held in the visitor's browser, never derived
    -- from anything about them, and it carries no meaning on its own.
    ----------------------------------------------------------------------------
    execute format($fmt$
      create table if not exists %I.quiz_responses (
        id            uuid        primary key default gen_random_uuid(),
        started_at    timestamptz not null default now(),
        updated_at    timestamptz not null default now(),
        quiz_version  text        not null default 'quiz-v1',
        completed     boolean     not null default false,
        last_question smallint    not null default 0,
        answers       jsonb       not null default '{}'::jsonb,
        result_path   text,
        claim_token   uuid        not null default gen_random_uuid(),
        claimed_at    timestamptz
      );
    $fmt$, target_schema);

    -- Looked up once, when someone signs up and their quiz is attached.
    execute format($fmt$
      create unique index if not exists quiz_responses_claim_token_idx
        on %I.quiz_responses (claim_token);
    $fmt$, target_schema);

    -- Drop-off reporting reads this; without it every report is a seq scan.
    execute format($fmt$
      create index if not exists quiz_responses_started_at_idx
        on %I.quiz_responses (started_at);
    $fmt$, target_schema);

    execute format($fmt$
      alter table %I.quiz_responses enable row level security;
    $fmt$, target_schema);

    -- Belt and braces. RLS with no policy already denies these roles; revoking
    -- the grants means a future policy added by mistake still grants nothing.
    execute format($fmt$
      revoke all on %I.quiz_responses from anon, authenticated;
    $fmt$, target_schema);

  end loop;
end
$$;
