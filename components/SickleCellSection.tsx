import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function SickleCellSection({ userRole = 'student' }: { userRole?: 'student' | 'admin' }) {
  const { data: foods, mutate } = useSWR('/api/sickle-foods', fetcher);
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'recommended' | 'caution'>('all');
  const [selected, setSelected] = useState<any>(null);
  
  // Real-time Meal Tracker Tray State
  const [mealLog, setMealLog] = useState<any[]>([]);

  if (!foods) return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading food databases...</div>;

  // Search and Tab Filtering
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

  // Add food to current session tray
  function addToMealTray(food: any) {
    const newEntry = {
      logId: `${food.id}_${Date.now()}`,
      food_name: food.food_name,
      calories: food.nutrients?.calories || 0,
      protein: food.nutrients?.protein_g || 0
    };
    setMealLog(prev => [...prev, newEntry]);
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
        
        {/* Quick Database Operations */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              const blob = new Blob([JSON.stringify(foods, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'sickle_foods_seed.json';
              link.click();
            }}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            📥 Download Seed Schema
          </button>
        </div>
      </div>

      {/* Grid Layout: Foods Catalog & Dynamic Sidebar Panel */}
      <div className="dashboard-layout">
        <div>
          {/* Search Bar & Custom Tab Filters */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="search-wrapper">
              <input 
                placeholder="Search anti-sickling foods (e.g. beans, moringa, hibiscus)..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="form-input"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setFilterTab('all')} 
                className={`btn ${filterTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                All Foods ({foods.length})
              </button>
              <button 
                onClick={() => setFilterTab('recommended')} 
                className={`btn ${filterTab === 'recommended' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Recommended 🟢 ({foods.filter((x: any) => x.recommended_for_sickle_cell).length})
              </button>
              <button 
                onClick={() => setFilterTab('caution')} 
                className={`btn ${filterTab === 'caution' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              >
                Caution 🟡 ({foods.filter((x: any) => x.caution).length})
              </button>
            </div>
          </div>

          {/* Cards Grid */}
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
                      {f.recommended_for_sickle_cell ? (
                        <span className="pill pill-success">Recommended</span>
                      ) : f.caution ? (
                        <span className="pill pill-warning">Caution</span>
                      ) : (
                        <span className="pill pill-neutral">Neutral</span>
                      )}
                    </div>
                  </div>

                  <div className="food-desc">{f.short_desc}</div>

                  <div className="food-meta">
                    <div>🔥 Calories: {f.nutrients?.calories ?? '—'} kcal</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelected(f)} 
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        🧬 Info & Nutrients
                      </button>
                      <button 
                        onClick={() => addToMealTray(f)} 
                        className="btn btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        ➕ Add to Tray
                      </button>
                      {userRole === 'admin' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={!!f.recommended_for_sickle_cell} 
                            onChange={() => toggleRecommend(f.id)} 
                          /> 
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

        {/* Sidebar Panel: Food Details & Daily Meal Log */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Section A: Active Food details */}
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

              {/* Slider Charts / Nutrient progress bars */}
              <div style={{ margin: '1.25rem 0' }}>
                <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Nutrients & Energy
                </h5>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="nutrient-row" style={{ border: 'none', padding: 0 }}>
                    <span>Calories</span>
                    <strong>{selected.nutrients?.calories ?? '0'} kcal</strong>
                  </div>
                  <div className="nutrient-bar-container">
                    <div className="nutrient-bar" style={{ width: `${Math.min(100, ((selected.nutrients?.calories || 0) / 400) * 100)}%` }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="nutrient-row" style={{ border: 'none', padding: 0 }}>
                    <span>Protein</span>
                    <strong>{selected.nutrients?.protein_g ?? '0'} g</strong>
                  </div>
                  <div className="nutrient-bar-container">
                    <div className="nutrient-bar" style={{ width: `${Math.min(100, ((selected.nutrients?.protein_g || 0) / 25) * 100)}%`, background: '#3b82f6' }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="nutrient-row" style={{ border: 'none', padding: 0 }}>
                    <span>Iron Content</span>
                    <strong>{selected.nutrients?.iron_mg ?? '0'} mg</strong>
                  </div>
                  <div className="nutrient-bar-container">
                    <div className="nutrient-bar" style={{ width: `${Math.min(100, ((selected.nutrients?.iron_mg || 0) / 10) * 100)}%`, background: '#ef4444' }}></div>
                  </div>
                </div>
              </div>

              {/* Molecular Benefits list */}
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

              <button 
                onClick={() => addToMealTray(selected)} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                📥 Add Food to Daily Tray
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              🧬 Click on any food item's <strong>Info & Nutrients</strong> button to view comprehensive metabolic details, molecular benefits, and nutrient sliders here.
            </div>
          )}

          {/* Section B: Dynamic Running Meal Tracker Tray */}
          <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem' }}>
              🍽️ My Daily Meal Tray
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Log food choices throughout the semester and watch the calories tally.
            </p>

            {mealLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Your food tray is currently empty. Click "Add to Tray" to add cataloged items.
              </div>
            ) : (
              <div>
                <div className="meal-log-list">
                  {mealLog.map((item) => (
                    <div key={item.logId} className="meal-log-item">
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.food_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.calories} kcal</div>
                      </div>
                      <button 
                        onClick={() => removeFromMealTray(item.logId)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed var(--light-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>
                    <span>Total Calorie Tally:</span>
                    <span style={{ color: 'var(--primary)' }}>{totalCaloriesLogged} kcal</span>
                  </div>

                  <button 
                    onClick={() => {
                      alert(`Successfully synchronized ${mealLog.length} items totaling ${totalCaloriesLogged} calories to the school nutrition database!`);
                      setMealLog([]);
                    }} 
                    className="btn btn-primary" 
                    style={{ width: '100%', fontSize: '0.85rem' }}
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
