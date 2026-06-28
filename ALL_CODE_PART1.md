# Fountain Diet App — All Code (Part 1 of 2)
# Frontend + Styles + Database Schema

---

## 📁 styles/globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --primary: #10b981;
  --primary-hover: #059669;
  --primary-light: #ecfdf5;
  --primary-glow: rgba(16, 185, 129, 0.15);
  --secondary: #06b6d4;
  --secondary-hover: #0891b2;
  --danger: #ef4444;
  --danger-light: #fef2f2;
  --warning: #f59e0b;
  --warning-light: #fffbeb;
  --dark-bg: #0f172a;
  --dark-card: #1e293b;
  --dark-border: #334155;
  --light-bg: #f8fafc;
  --light-card: #ffffff;
  --light-border: #e2e8f0;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background-color: var(--light-bg);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app-container { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

.app-header {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(12px);
  border: 1px solid var(--light-border); padding: 1.25rem 2rem;
  border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);
  margin-bottom: 2rem; transition: var(--transition);
}

.brand-section { display: flex; align-items: center; gap: 1.25rem; }

.brand-logo {
  height: 60px; width: auto; object-fit: contain;
  border-radius: var(--radius-sm); transition: var(--transition);
}
.brand-logo:hover { transform: scale(1.05); }

.brand-title {
  font-size: 1.5rem; font-weight: 700; color: var(--dark-bg);
  background: linear-gradient(135deg, var(--dark-bg) 30%, var(--primary) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.brand-subtitle { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }

.nav-tabs {
  display: flex; gap: 0.5rem; background: var(--light-bg);
  padding: 0.35rem; border-radius: var(--radius-md);
  border: 1px solid var(--light-border);
}

.tab-btn {
  font-family: var(--font-sans); background: transparent; border: none;
  padding: 0.6rem 1.25rem; font-size: 0.95rem; font-weight: 600;
  color: var(--text-secondary); border-radius: var(--radius-sm);
  cursor: pointer; transition: var(--transition);
  display: flex; align-items: center; gap: 0.5rem;
}
.tab-btn:hover { color: var(--primary); }
.tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px var(--primary-glow); }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }

.stat-card {
  background: var(--light-card); border: 1px solid var(--light-border);
  padding: 1.5rem; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
  transition: var(--transition); display: flex; flex-direction: column;
}
.stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--primary); }
.stat-value { font-size: 2.25rem; font-weight: 700; color: var(--primary); margin-bottom: 0.25rem; }
.stat-label { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }

.calculator-box { background: var(--primary-light); border: 1px solid var(--primary-glow); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; }

.dashboard-layout { display: grid; grid-template-columns: 2.5fr 1fr; gap: 2rem; }
@media (max-width: 968px) { .dashboard-layout { grid-template-columns: 1fr; } }

.card {
  background: var(--light-card); border: 1px solid var(--light-border);
  border-radius: var(--radius-md); padding: 1.75rem;
  box-shadow: var(--shadow-sm); transition: var(--transition); margin-bottom: 1.5rem;
}
.card:hover { box-shadow: var(--shadow-md); }

h2 { font-size: 1.75rem; font-weight: 700; color: var(--dark-bg); margin-bottom: 1.25rem; }
h3 { font-size: 1.25rem; font-weight: 600; color: var(--dark-bg); margin-bottom: 0.75rem; }

.search-wrapper { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; width: 100%; }

.form-input {
  font-family: var(--font-sans); flex: 1; padding: 0.75rem 1.25rem;
  font-size: 0.95rem; font-weight: 500; border: 1px solid var(--light-border);
  border-radius: var(--radius-sm); background: white; transition: var(--transition); outline: none;
}
.form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

.btn {
  font-family: var(--font-sans); font-weight: 600; font-size: 0.9rem;
  padding: 0.75rem 1.5rem; border-radius: var(--radius-sm);
  border: 1px solid transparent; cursor: pointer; transition: var(--transition);
  display: inline-flex; align-items: center; gap: 0.5rem;
  justify-content: center; text-decoration: none;
}
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover { background: var(--primary-hover); box-shadow: 0 4px 12px var(--primary-glow); }
.btn-secondary { background: white; color: var(--text-primary); border-color: var(--light-border); }
.btn-secondary:hover { background: var(--light-bg); border-color: var(--text-muted); }

.pill { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
.pill-success { background: #dbf5e6; color: #065f46; }
.pill-warning { background: var(--warning-light); color: #92400e; }
.pill-neutral { background: #f1f5f9; color: #475569; }

.food-card { background: white; border: 1px solid var(--light-border); border-radius: var(--radius-md); padding: 1.5rem; margin-bottom: 1rem; transition: var(--transition); }
.food-card:hover { transform: translateX(4px); border-color: var(--primary); box-shadow: var(--shadow-md); }
.food-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.food-title { font-size: 1.15rem; font-weight: 600; color: var(--dark-bg); }
.food-category { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
.food-desc { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; }
.food-meta { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--light-border); padding-top: 0.75rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

.detail-sidebar {
  position: sticky; top: 2rem; background: white;
  border: 1px solid var(--light-border); border-radius: var(--radius-md);
  padding: 1.5rem; box-shadow: var(--shadow-sm);
  max-height: calc(100vh - 4rem); overflow-y: auto;
}

.nutrient-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed var(--light-border); font-size: 0.9rem; }
.nutrient-bar-container { width: 100%; height: 6px; background: var(--light-bg); border-radius: 3px; overflow: hidden; margin-top: 0.25rem; }
.nutrient-bar { height: 100%; background: var(--primary); border-radius: 3px; }

.meal-log-list { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
.meal-log-item { display: flex; justify-content: space-between; align-items: center; background: var(--light-bg); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-size: 0.875rem; }
```

---

## 📁 pages/_app.tsx

```tsx
import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
```

---

## 📁 lib/supabaseClient.ts

```ts
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check .env.local');
}

// Resilience: If database URL (postgresql://) was placed in NEXT_PUBLIC_SUPABASE_URL,
// parse the project reference to resolve the correct HTTPS REST API URL!
if (supabaseUrl.startsWith('postgresql://')) {
  const match = supabaseUrl.match(/@db\.(.+?)\.supabase\.co/);
  if (match && match[1]) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  } else {
    throw new Error('Supabase URL is set to a postgres connection string but could not extract project reference.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 📁 supabase_schema.sql

```sql
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
```

---

## 📁 supabase_setup_and_seed.sql

```sql
-- ============================================================
-- FOUNTAIN UNIVERSITY DIET APP — FULL SETUP (Schema + Seed)
-- Paste this entire file into Supabase SQL Editor and click Run
-- https://supabase.com/dashboard/project/ckzzaqzkmozozgmejbpz/sql/new
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  meals JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  for_sickle_cell BOOLEAN DEFAULT FALSE
);

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

CREATE TABLE IF NOT EXISTS sickle_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  food_id VARCHAR(255) REFERENCES sickle_foods(id) ON DELETE CASCADE,
  serving_size VARCHAR(50),
  calories NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED: sickle_foods
INSERT INTO sickle_foods (id, food_name, category, short_desc, recommended_for_sickle_cell, caution, nutrients, molecular_benefits)
VALUES
  ('ugu','Ugu (Pumpkin Leaves)','Vegetable','High in iron, folate and antioxidants—excellent for blood support.',true,false,'{"calories":40,"protein":3.2,"iron":"High","folate":"High","hydrationScore":4,"antiInflammatoryScore":4}','["beta-carotene","polyphenols","iron-dense","vitamin C"]'),
  ('zobo','Zobo (Hibiscus Drink, unsweetened)','Drink','Hydrating and antioxidant-rich.',true,false,'{"calories":15,"protein":0,"iron":"Low","folate":"Low","hydrationScore":5,"antiInflammatoryScore":4}','["anthocyanins","vitamin C"]'),
  ('moi_moi','Moi Moi','Legume','Steamed bean pudding — gentle on digestion and iron-supportive.',true,false,'{"calories":250,"protein":12,"iron":"Medium","folate":"Medium","hydrationScore":3,"antiInflammatoryScore":3}','["plant protein","iron","folate"]'),
  ('dodo_fried','Plantain (Dodo - Fried)','Snack','High oil content — limit for inflammation reasons.',false,true,'{"calories":350,"protein":2,"iron":"Low","folate":"Low","hydrationScore":1,"antiInflammatoryScore":1}','[]')
ON CONFLICT (id) DO NOTHING;
```

---

## 📁 sickle_foods_seed.json

```json
[
  {
    "id": "ugu",
    "food_name": "Ugu (Pumpkin Leaves)",
    "category": "Vegetable",
    "short_desc": "High in iron, folate and antioxidants—excellent for blood support.",
    "recommended_for_sickle_cell": true,
    "caution": false,
    "nutrients": { "calories": 40, "protein": 3.2, "iron": "High", "folate": "High", "hydrationScore": 4, "antiInflammatoryScore": 4 },
    "molecular_benefits": ["beta-carotene", "polyphenols", "iron-dense", "vitamin C"]
  },
  {
    "id": "zobo",
    "food_name": "Zobo (Hibiscus Drink, unsweetened)",
    "category": "Drink",
    "short_desc": "Hydrating and antioxidant-rich.",
    "recommended_for_sickle_cell": true,
    "caution": false,
    "nutrients": { "calories": 15, "protein": 0, "iron": "Low", "folate": "Low", "hydrationScore": 5, "antiInflammatoryScore": 4 },
    "molecular_benefits": ["anthocyanins", "vitamin C"]
  },
  {
    "id": "moi_moi",
    "food_name": "Moi Moi",
    "category": "Legume",
    "short_desc": "Steamed bean pudding — gentle on digestion and iron-supportive.",
    "recommended_for_sickle_cell": true,
    "caution": false,
    "nutrients": { "calories": 250, "protein": 12, "iron": "Medium", "folate": "Medium", "hydrationScore": 3, "antiInflammatoryScore": 3 },
    "molecular_benefits": ["plant protein", "iron", "folate"]
  },
  {
    "id": "dodo_fried",
    "food_name": "Plantain (Dodo - Fried)",
    "category": "Snack",
    "short_desc": "High oil content — limit for inflammation reasons.",
    "recommended_for_sickle_cell": false,
    "caution": true,
    "nutrients": { "calories": 350, "protein": 2, "iron": "Low", "folate": "Low", "hydrationScore": 1, "antiInflammatoryScore": 1 },
    "molecular_benefits": []
  }
]
```

---

## 📁 .env.local (root)

```env
NEXT_PUBLIC_SUPABASE_URL=https://ckzzaqzkmozozgmejbpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrenphcXprbW96b3pnbWVqYnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODIyMTUsImV4cCI6MjA5NTE1ODIxNX0.gmRUAZJaGADPFEJAkWUt6MwIeS2wOMbDsl5zwAh4aSg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrenphcXprbW96b3pnbWVqYnB6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTU4MjIxNSwiZXhwIjoyMDk1MTU4MjE1fQ.RxaKMBpCQ4a1xMj4oDE70s1Fpt2VM8oVavmuRgs4XUw

NEXT_PUBLIC_API_BASE=

# Backend / Express variables
JWT_SECRET=052be788f9177901d5200d75a38654f7cf9edf9d39ebd64217c9bdd28777d5a9672f08fc5d5bf39451705cb88b20c2b90794e521e16f81b9e1dd108a64db9e7f
JWT_EXPIRES_IN=7d
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=nutrition@fuo.edu.ng
FRONTEND_URL=https://fountain-university-diet-app.vercel.app
```

---

## 📁 next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

---

## 📁 package.json (root)

```json
{
  "name": "fountain-diet-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@sendgrid/mail": "^8.1.6",
    "@supabase/supabase-js": "^2.43.4",
    "axios": "^1.4.0",
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "next": "^14.2.33",
    "nodemailer": "^7.0.11",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "recharts": "^2.6.2",
    "swr": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "19.2.7",
    "typescript": "^5.4.4"
  }
}
```

---

## 📁 pages/api/[[...route]].js

```js
const app = require('../../backend/index');

export const config = {
  api: {
    bodyParser: false,       // Let Express parse the body
    externalResolver: true,  // Tell Next.js that Express is handling the response
  },
};

export default function handler(req, res) {
  return app(req, res);
}
```

---

## 📁 pages/api/sickle-foods/index.ts

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const q = (req.query.q as string) || ''
    try {
      let query = supabase.from('sickle_foods').select('*')
      if (q) query = query.ilike('food_name', `%${q}%`)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    const body = req.body
    const { data, error } = await supabase.from('sickle_foods').insert([body]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
```

---

## 📁 pages/api/sickle-foods/[id].ts

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    const changes = req.body
    const { data, error } = await supabase
      .from('sickle_foods')
      .update(changes)
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }
  res.setHeader('Allow', ['PATCH'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
```

---

## 📁 pages/api/sickle-meal-logs/index.ts

```ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side writes to meal logs
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { user_id, food_id, serving_size, calories } = req.body
  const { data, error } = await supabaseService
    .from('sickle_meal_logs')
    .insert([{ user_id, food_id, serving_size, calories }])
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}
```
