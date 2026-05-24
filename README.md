# Fountain University Diet App (Next.js + Supabase starter)

## What you get
- Next.js app (TypeScript-ready) with frontend scaffold integrated with Sickle Cell features.
- API routes that speak to Supabase (GET/POST/PATCH endpoints) for `sickle_foods` and `sickle_meal_logs`.
- `sickle_foods_seed.json` included for seeding your Supabase table.
- Instructions to run locally and deploy.

## Local setup
1. Copy this project locally.
2. Create a Supabase project and a table `sickle_foods` (see schema in README section below).
3. Add environment variables in `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY (server-side only)
4. Install dependencies: `npm install`
5. Run: `npm run dev`

## Supabase table schema (suggested)
CREATE TABLE sickle_foods (
  id TEXT PRIMARY KEY,
  food_name TEXT NOT NULL,
  category TEXT,
  short_desc TEXT,
  recommended_for_sickle_cell BOOLEAN DEFAULT false,
  caution BOOLEAN DEFAULT false,
  nutrients JSONB,
  molecular_benefits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE sickle_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  food_id TEXT REFERENCES sickle_foods(id),
  serving_size TEXT,
  calories FLOAT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

Seed the `sickle_foods` table using `sickle_foods_seed.json`.
