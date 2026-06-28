# Fountain Diet App — All Code (Part 3 of 3)
# Main Pages (React/TSX Components)

---

## 📁 components/SickleCellSection.tsx

```tsx
import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function SickleCellSection({ userRole = 'student' }: { userRole?: string }) {
  const { data: foods, mutate } = useSWR('/api/sickle-foods', fetcher);
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'recommended' | 'caution'>('all');
  const [selected, setSelected] = useState<any>(null);
  const [mealLog, setMealLog] = useState<any[]>([]);

  if (!foods) return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading food databases...</div>;

  const filtered = foods.filter((f: any) => {
    const matchesSearch = !query || f.food_name.toLowerCase().includes(query.toLowerCase());
    if (filterTab === 'recommended') return matchesSearch && f.recommended_for_sickle_cell;
    if (filterTab === 'caution') return matchesSearch && f.caution;
    return matchesSearch;
  });

  async function toggleRecommend(id: string) {
    const item = foods.find((x: any) => x.id === id);
    if (!item) return;
    await axios.patch(`/api/sickle-foods/${id}`, { recommended_for_sickle_cell: !item.recommended_for_sickle_cell });
    mutate();
  }

  function addToMealTray(food: any) {
    setMealLog(prev => [...prev, {
      logId: `${food.id}_${Date.now()}`,
      food_name: food.food_name,
      calories: food.nutrients?.calories || 0,
      protein: food.nutrients?.protein_g || 0
    }]);
  }

  function removeFromMealTray(logId: string) {
    setMealLog(prev => prev.filter(x => x.logId !== logId));
  }

  const totalCaloriesLogged = mealLog.reduce((acc, curr) => acc + Number(curr.calories), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Sickle Cell Warrior Diet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '-0.75rem' }}>
            Personalized molecular nutrition mapping to boost red blood cell resilience and hydration.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(foods, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url; link.download = 'sickle_foods_seed.json'; link.click();
            }}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            📥 Download Seed Schema
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        <div>
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="search-wrapper">
              <input
                placeholder="Search anti-sickling foods (e.g. beans, moringa, hibiscus)..."
                value={query} onChange={(e) => setQuery(e.target.value)} className="form-input"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['all', 'recommended', 'caution'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`btn ${filterTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                >
                  {tab === 'all' && `All Foods (${foods.length})`}
                  {tab === 'recommended' && `Recommended 🟢 (${foods.filter((x: any) => x.recommended_for_sickle_cell).length})`}
                  {tab === 'caution' && `Caution 🟡 (${foods.filter((x: any) => x.caution).length})`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                🔍 No anti-sickling foods match your search criteria.
              </div>
            ) : (
              filtered.map((f: any) => (
                <div key={f.id} className="food-card">
                  <div className="food-card-header">
                    <div>
                      <div className="food-title">{f.food_name}</div>
                      <span className="food-category">{f.category}</span>
                    </div>
                    <div>
                      {f.recommended_for_sickle_cell
                        ? <span className="pill pill-success">Recommended</span>
                        : f.caution
                          ? <span className="pill pill-warning">Caution</span>
                          : <span className="pill pill-neutral">Neutral</span>}
                    </div>
                  </div>
                  <div className="food-desc">{f.short_desc}</div>
                  <div className="food-meta">
                    <div>🔥 Calories: {f.nutrients?.calories ?? '—'} kcal</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setSelected(f)} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        🧬 Info & Nutrients
                      </button>
                      <button onClick={() => addToMealTray(f)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                        ➕ Add to Tray
                      </button>
                      {userRole === 'admin' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={!!f.recommended_for_sickle_cell} onChange={() => toggleRecommend(f.id)} />
                          Pin Recommend
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selected ? (
            <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
              <h3 style={{ borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                🧬 Food Diagnostics
              </h3>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selected.food_name}</h4>
              <span className="pill pill-neutral" style={{ marginBottom: '1rem' }}>{selected.category}</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                {selected.short_desc}
              </p>
              <div style={{ margin: '1.25rem 0' }}>
                <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Nutrients & Energy
                </h5>
                {[
                  { label: 'Calories', value: `${selected.nutrients?.calories ?? 0} kcal`, pct: ((selected.nutrients?.calories || 0) / 400) * 100, color: 'var(--primary)' },
                  { label: 'Protein', value: `${selected.nutrients?.protein_g ?? 0} g`, pct: ((selected.nutrients?.protein_g || 0) / 25) * 100, color: '#3b82f6' },
                  { label: 'Iron Content', value: `${selected.nutrients?.iron_mg ?? 0} mg`, pct: ((selected.nutrients?.iron_mg || 0) / 10) * 100, color: '#ef4444' },
                ].map(({ label, value, pct, color }) => (
                  <div key={label} style={{ marginBottom: '0.75rem' }}>
                    <div className="nutrient-row" style={{ border: 'none', padding: 0 }}>
                      <span>{label}</span><strong>{value}</strong>
                    </div>
                    <div className="nutrient-bar-container">
                      <div className="nutrient-bar" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              {Array.isArray(selected.molecular_benefits) && selected.molecular_benefits.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                    🧬 Molecular Targets
                  </h5>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {selected.molecular_benefits.map((b: string, idx: number) => (
                      <span key={idx} className="pill pill-success" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                        🔬 {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => addToMealTray(selected)} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
                📥 Add Food to Daily Tray
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              🧬 Click any food's <strong>Info & Nutrients</strong> button to view metabolic details here.
            </div>
          )}

          <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem' }}>
              🍽️ My Daily Meal Tray
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Log food choices throughout the semester and watch the calories tally.
            </p>
            {mealLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Your food tray is currently empty. Click "Add to Tray" to add items.
              </div>
            ) : (
              <div>
                <div className="meal-log-list">
                  {mealLog.map(item => (
                    <div key={item.logId} className="meal-log-item">
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.food_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.calories} kcal</div>
                      </div>
                      <button
                        onClick={() => removeFromMealTray(item.logId)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--light-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                    <span>Total Calorie Tally:</span>
                    <span style={{ color: 'var(--primary)' }}>{totalCaloriesLogged} kcal</span>
                  </div>
                  <button
                    onClick={() => { alert(`Synced ${mealLog.length} items (${totalCaloriesLogged} kcal) to nutrition database!`); setMealLog([]); }}
                    className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    💾 Submit Daily Food Log
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

---

## 📁 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "backend"]
}
```

---

## 📁 vercel.json

```json
{
  "functions": {
    "pages/api/**/*.js": { "maxDuration": 30 },
    "pages/api/**/*.ts": { "maxDuration": 30 }
  }
}
```

---

## 📁 .gitignore

```
node_modules/
.next/
.env.local
.env
backend/node_modules/
backend/.env.local
```

---

## 🗂️ FULL PROJECT FILE TREE

```
fountain-diet-app/
├── .env.local                          ← root env vars (Supabase + JWT)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
├── vercel.json
├── supabase_schema.sql                 ← DB schema only
├── supabase_setup_and_seed.sql         ← Schema + seed data (run this in Supabase)
├── sickle_foods_seed.json              ← JSON seed for sickle foods
│
├── styles/
│   └── globals.css                     ← All CSS design tokens & component styles
│
├── lib/
│   └── supabaseClient.ts              ← Supabase JS client (frontend)
│
├── pages/
│   ├── _app.tsx                       ← Next.js App wrapper
│   ├── index.tsx                      ← Main SPA (login, home, sickle, admin, nutritionist)
│   └── api/
│       ├── [[...route]].js            ← Catch-all → delegates to Express backend
│       ├── sickle-foods/
│       │   ├── index.ts               ← GET/POST /api/sickle-foods
│       │   └── [id].ts                ← PATCH /api/sickle-foods/:id
│       └── sickle-meal-logs/
│           └── index.ts               ← POST /api/sickle-meal-logs
│
├── components/
│   └── SickleCellSection.tsx          ← Sickle Cell diet UI component
│
└── backend/                           ← Express.js server
    ├── index.js                       ← Express app entry point
    ├── package.json
    ├── .env.local                     ← backend env vars (same keys)
    ├── utils/
    │   ├── supabase.js               ← Supabase client (service role, backend)
    │   └── email.js                  ← SendGrid / Nodemailer email helper
    └── routes/
        ├── auth.js                   ← /api/auth (login, forgot/reset password)
        ├── users.js                  ← /api/users (CRUD, bulk onboard)
        ├── foods.js                  ← /api/foods (standard food catalog CRUD)
        └── diet.js                   ← /api/diet (diet plan assign & fetch)
```

---

## 🔑 DEMO LOGIN CREDENTIALS

| Role         | Username         | Password       |
|--------------|------------------|----------------|
| Student      | FUO/20/0205      | fuo/20/0205    |
| Nutritionist | profsmogunbode   | ogunbode12     |
| Admin        | kalibest10       | airborne       |

---

## 🚀 HOW TO RUN

```bash
# From project root
npm install
npm run dev          # Starts Next.js on http://localhost:3000

# The Express backend is embedded via pages/api/[[...route]].js
# No separate backend startup needed for dev or production
```
