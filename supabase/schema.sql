-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS subscription_history CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS profile_views CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
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
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_url TEXT NOT NULL,
  payment_id TEXT,
  payment_status VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_history table
CREATE TABLE subscription_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  curtidor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  curtido_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curtidor_id, curtido_id)
);

-- Create favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, profile_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_views table
CREATE TABLE profile_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_likes_curtido ON likes(curtido_id);
CREATE INDEX idx_likes_curtidor ON likes(curtidor_id);
CREATE INDEX idx_favorites_profile ON favorites(profile_id);
CREATE INDEX idx_messages_users ON messages(sender_id, receiver_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_dates ON subscriptions(start_date, end_date);
CREATE INDEX idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_dates ON subscription_history(created_at);
CREATE INDEX idx_profile_views_profile ON profile_views(profile_id);
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_date ON profile_views(viewed_at);