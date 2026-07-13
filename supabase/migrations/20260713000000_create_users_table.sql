-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all operations for everyone" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);
