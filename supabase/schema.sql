-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  idade INTEGER,
  genero VARCHAR(50),
  localizacao TEXT,
  foto_perfil TEXT,
  fotos TEXT[],
  videos TEXT[],
  documento TEXT,
  bio TEXT,
  whatsapp TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  role VARCHAR(50) DEFAULT 'user',
  altura VARCHAR(10),
  medidas VARCHAR(50),
  atende TEXT,
  horario TEXT,
  idiomas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rest of the schema remains the same
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  curtidor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  curtido_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curtidor_id, curtido_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_likes_curtido ON likes(curtido_id);
CREATE INDEX IF NOT EXISTS idx_likes_curtidor ON likes(curtidor_id);
CREATE INDEX IF NOT EXISTS idx_favorites_profile ON favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);