-- Create admin user with hashed password (admin123)
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
  '7c4a8d09ca3762af61e59520943dc26494f8941b', -- Hashed version of 'admin123'
  'Admin',
  'admin',
  'approved',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;