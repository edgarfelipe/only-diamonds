-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to approved models
CREATE POLICY "Public read access to approved models"
ON users FOR SELECT
USING (
  status = 'approved' AND 
  role = 'model'
);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public insert for registration
CREATE POLICY "Allow public registration"
ON users FOR INSERT
WITH CHECK (
  role IN ('user', 'model', 'admin')
);

-- Allow admin operations
CREATE POLICY "Admin operations"
ON users
FOR ALL
USING (
  email = 'admin@onlydiamonds.com' OR
  role = 'admin'
);