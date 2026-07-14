-- Deduplicate users by normalized email before enforcing uniqueness.
-- Keeps the earliest created user record for each email and remaps any
-- assessment_scores rows to the surviving user.

UPDATE users
SET email = lower(trim(email))
WHERE email IS NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.assessment_scores') IS NOT NULL THEN
    WITH ranked_users AS (
      SELECT
        id,
        email,
        created_at,
        first_value(id) OVER (
          PARTITION BY email
          ORDER BY created_at NULLS LAST, id
        ) AS keeper_id,
        row_number() OVER (
          PARTITION BY email
          ORDER BY created_at NULLS LAST, id
        ) AS row_num
      FROM users
      WHERE email IS NOT NULL
    )
    UPDATE assessment_scores scores
    SET user_id = ranked_users.keeper_id
    FROM ranked_users
    WHERE scores.user_id = ranked_users.id
      AND ranked_users.row_num > 1;
  END IF;
END $$;

WITH ranked_users AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY email
      ORDER BY created_at NULLS LAST, id
    ) AS row_num
  FROM users
  WHERE email IS NOT NULL
)
DELETE FROM users
USING ranked_users
WHERE users.id = ranked_users.id
  AND ranked_users.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
ON users (email);
