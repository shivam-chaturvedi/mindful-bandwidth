-- Normalize existing emails before adding a uniqueness constraint.
UPDATE users
SET email = lower(trim(email))
WHERE email IS NOT NULL;

ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
ON users (email);

CREATE TABLE IF NOT EXISTS assessment_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stress integer NOT NULL CHECK (stress BETWEEN 0 AND 100),
  self_control integer NOT NULL CHECK (self_control BETWEEN 0 AND 100),
  time_management integer NOT NULL CHECK (time_management BETWEEN 0 AND 100),
  financial_security integer NOT NULL CHECK (financial_security BETWEEN 0 AND 100),
  social_connection integer NOT NULL CHECK (social_connection BETWEEN 0 AND 100),
  overall integer NOT NULL CHECK (overall BETWEEN 0 AND 100),
  raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for everyone on assessment_scores" ON assessment_scores
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE VIEW latest_user_scores AS
SELECT
  u.id AS user_id,
  u.name,
  u.email,
  s.stress,
  s.self_control,
  s.time_management,
  s.financial_security,
  s.social_connection,
  s.overall,
  s.created_at AS submitted_at
FROM users u
JOIN LATERAL (
  SELECT *
  FROM assessment_scores scores
  WHERE scores.user_id = u.id
  ORDER BY scores.created_at DESC
  LIMIT 1
) s ON true;

CREATE OR REPLACE VIEW average_assessment_scores AS
SELECT
  round(avg(stress)::numeric, 2) AS avg_stress,
  round(avg(self_control)::numeric, 2) AS avg_self_control,
  round(avg(time_management)::numeric, 2) AS avg_time_management,
  round(avg(financial_security)::numeric, 2) AS avg_financial_security,
  round(avg(social_connection)::numeric, 2) AS avg_social_connection,
  round(avg(overall)::numeric, 2) AS avg_overall,
  count(*)::bigint AS total_submissions,
  count(DISTINCT user_id)::bigint AS total_users
FROM assessment_scores;
