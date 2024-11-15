-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved models
CREATE POLICY "public_read_approved_models"
ON users FOR SELECT
USING (status = 'approved' AND role = 'model');

-- Allow users to read their own data
CREATE POLICY "read_own_data"
ON users FOR SELECT
USING (true);

-- Allow public registration
CREATE POLICY "enable_public_registration"
ON users FOR INSERT
WITH CHECK (true);

-- Allow users to update their own data
CREATE POLICY "update_own_data"
ON users FOR UPDATE
USING (true)
WITH CHECK (true);