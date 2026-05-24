-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) CHECK (role IN ('student', 'staff', 'nutritionist', 'doctor', 'admin')) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP WITH TIME ZONE,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create food_items table
CREATE TABLE IF NOT EXISTS food_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  calories NUMERIC DEFAULT 0,
  protein_g NUMERIC DEFAULT 0,
  carbs_g NUMERIC DEFAULT 0,
  fat_g NUMERIC DEFAULT 0,
  notes TEXT
);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  meals JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  for_sickle_cell BOOLEAN DEFAULT FALSE
);

-- Create sickle_foods table (used by Next.js API and frontend)
CREATE TABLE IF NOT EXISTS sickle_foods (
  id VARCHAR(255) PRIMARY KEY,
  food_name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  short_desc TEXT,
  recommended_for_sickle_cell BOOLEAN DEFAULT FALSE,
  caution BOOLEAN DEFAULT FALSE,
  nutrients JSONB DEFAULT '{}'::jsonb,
  molecular_benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sickle_meal_logs table (used by Next.js API and frontend)
CREATE TABLE IF NOT EXISTS sickle_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  food_id VARCHAR(255) REFERENCES sickle_foods(id) ON DELETE CASCADE,
  serving_size VARCHAR(50),
  calories NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
