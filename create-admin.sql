-- Create admin user with hashed password (88449596)
INSERT INTO users (
  email,
  senha,
  nome,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  'admin@onlydiamonds.com',
  '0a3a0e4f516c47e5b10e848073c5f1c9', -- Hashed version of '88449596'
  'Admin',
  'admin',
  'approved',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;