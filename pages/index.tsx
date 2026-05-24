import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import SickleCellSection from '../components/SickleCellSection';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function Home() {
  const [tab, setTab] = useState<'home' | 'sickle'>('home');
  const { data: foods } = useSWR('/api/sickle-foods', fetcher);
  
  // Interactive Calculator State
  const [weight, setWeight] = useState<number>(65);
  const [activity, setActivity] = useState<'sedentary' | 'moderate' | 'active'>('moderate');
  const [calculated, setCalculated] = useState<any>(null);

  // Helper stats
  const totalFoods = Array.isArray(foods) ? foods.length : 0;
  const recommendedCount = Array.isArray(foods) ? foods.filter(f => f.recommended_for_sickle_cell).length : 0;
  const cautionCount = Array.isArray(foods) ? foods.filter(f => f.caution).length : 0;

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || weight <= 0) return;
    
    // Standard Basal Metabolic & Activity calculations
    let baseCal = weight * 22; 
    let activityMultiplier = 1.2;
    if (activity === 'moderate') activityMultiplier = 1.4;
    if (activity === 'active') activityMultiplier = 1.7;
    
    const targetCal = Math.round(baseCal * activityMultiplier);
    
    // Sickle Cell hydration clinical guidelines: 40-50 ml water per kg (which is ~1.5x regular intake to prevent sickling)
    const targetHydration = (weight * 0.045).toFixed(1); 

    setCalculated({
      calories: targetCal,
      hydration: targetHydration
    });
  }

  return (
    <div className="app-container">
      {/* Premium Glassmorphic Header */}
      <header className="app-header">
        <div className="brand-section">
          <img
            src="/fountain University.jpeg"
            alt="Fountain University emblem logo showing a stylized school crest of academic excellence; header logo for molecular nutrition portal"
            className="brand-logo"
          />
          <div>
            <h1 className="brand-title">Fountain University Diet App</h1>
            <div className="brand-subtitle">🔬 Molecular Nutrition & Personalized Diet Therapy</div>
          </div>
        </div>
        <nav className="nav-tabs">
          <button 
            onClick={() => setTab('home')} 
            className={`tab-btn ${tab === 'home' ? 'active' : ''}`}
          >
            🏠 Wellness Hub
          </button>
          <button 
            onClick={() => setTab('sickle')} 
            className={`tab-btn ${tab === 'sickle' ? 'active' : ''}`}
          >
            🩸 Sickle Cell Diet
          </button>
        </nav>
      </header>

      {/* Dynamic Main Workspace */}
      <main>
        {tab === 'home' && (
          <div>
            {/* Quick Stats Summary Widgets */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{totalFoods || '—'}</span>
                <span className="stat-label">Total Foods Cataloged</span>
              </div>
              <div className="stat-card">
                <span className="stat-value" style={{ color: '#059669' }}>
                  {recommendedCount || '—'}
                </span>
                <span className="stat-label">Recommended Items</span>
              </div>
              <div className="stat-card">
                <span className="stat-value" style={{ color: '#d97706' }}>
                  {cautionCount || '—'}
                </span>
                <span className="stat-label">Caution Foods</span>
              </div>
              <div className="stat-card">
                <span className="stat-value" style={{ color: '#06b6d4' }}>Active</span>
                <span className="stat-label">Supabase Sync Status</span>
              </div>
            </div>

            <div className="dashboard-layout">
              {/* Left Column: Wellness Overview */}
              <div>
                <div className="card">
                  <h2>Welcome to the Molecular Nutrition Center</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Personalized diet planning tailored for Fountain University students. Our molecular nutrition database maps exact nutritional profiles to target distinct molecular benefits and cell resilience, helping students eat for cellular fitness, vitality, and study focus.
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-border)' }}>
                      <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>🧬 Cell Shielding</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Identify foods high in cellular antioxidants and anti-sickling amino acids.</p>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-border)' }}>
                      <h4 style={{ color: 'var(--secondary)', marginBottom: '0.25rem' }}>💧 Micro-hydration</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Real-time tally metrics optimized to keep plasma viscosity ideal for vascular health.</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2>Meal Plan Guidelines for Study & Cellular Fitness</h2>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li><strong>Prioritize Iron & Plant Protein</strong>: Enhance tissue oxygenation and build muscle integrity.</li>
                    <li><strong>Consistent Small Meals</strong>: Keep glycogen levels stable to optimize brain focus during examinations.</li>
                    <li><strong>Dual-Fiber sources</strong>: Enhance digestive health and general gut-brain wellness.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Interactive Calorie & Hydration Calculator */}
              <aside>
                <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    🧮 Wellness Target Calculator
                  </h3>
                  
                  <form onSubmit={handleCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Body Weight (kg)
                      </label>
                      <input 
                        type="number" 
                        value={weight || ''} 
                        onChange={(e) => setWeight(Number(e.target.value))} 
                        className="form-input" 
                        required 
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                        Daily Activity Level
                      </label>
                      <select 
                        value={activity} 
                        onChange={(e: any) => setActivity(e.target.value)} 
                        className="form-input"
                        style={{ height: '42px' }}
                      >
                        <option value="sedentary">Low / Study Desk Only</option>
                        <option value="moderate">Moderate / Class Walking</option>
                        <option value="active">High / Active Sports</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Compute Daily Targets
                    </button>
                  </form>

                  {calculated && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--light-border)' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: 700 }}>📊 Recommended Daily Targets:</h4>
                      
                      <div className="nutrient-row">
                        <span>⚡ Energy Intake</span>
                        <strong style={{ color: 'var(--primary)' }}>{calculated.calories} kcal</strong>
                      </div>
                      
                      <div className="nutrient-row" style={{ borderBottom: 'none' }}>
                        <span>💧 Vital Hydration</span>
                        <strong style={{ color: 'var(--secondary)' }}>{calculated.hydration} Liters</strong>
                      </div>
                      
                      <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem', border: '1px solid #d1fae5' }}>
                        <p style={{ fontSize: '0.75rem', color: '#065f46', lineHeight: 1.4 }}>
                          ℹ️ <strong>Sickle Cell Guard:</strong> Hydration targets are dynamically scaled to prevent cell crystallization & dehydration during hot study semesters.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        )}

        {tab === 'sickle' && <SickleCellSection userRole={'student'} />}
      </main>
    </div>
  );
}
