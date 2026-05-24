import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import SickleCellSection from '../components/SickleCellSection';

const API_BASE = 'http://localhost:4000';

export default function Home() {
  const [tab, setTab] = useState<'home' | 'sickle' | 'nutritionist-panel'>('home');
  
  // User Session State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Login Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Nutritionist Planning States
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [forSickleCell, setForSickleCell] = useState(false);
  const [breakfastItem, setBreakfastItem] = useState('');
  const [lunchItem, setLunchItem] = useState('');
  const [dinnerItem, setDinnerItem] = useState('');
  const [snacksItem, setSnacksItem] = useState('');

  // Load token on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('fuo_token');
    const savedUser = localStorage.getItem('fuo_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // SWR Helpers with Auth Headers
  const getHeaders = () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const authenticatedFetcher = (url: string) => 
    axios.get(`${API_BASE}${url}`, getHeaders()).then(r => r.data);

  // Fetch standard foods & university users (students/staff)
  const { data: foods } = useSWR('/api/foods', authenticatedFetcher);
  const { data: allUsers, mutate: mutateUsers } = useSWR(
    user?.role === 'nutritionist' || user?.role === 'admin' ? '/api/users' : null, 
    authenticatedFetcher
  );

  // Fetch logged in student's diet plans
  const { data: studentPlans, mutate: mutateStudentPlans } = useSWR(
    user && (user.role === 'student' || user.role === 'doctor') ? `/api/diet/${user.username}` : null,
    authenticatedFetcher
  );

  // Fetch selected student's plans (for nutritionist detail view)
  const { data: selectedStudentPlans, mutate: mutateSelectedStudentPlans } = useSWR(
    selectedStudent ? `/api/diet/${selectedStudent.username}` : null,
    authenticatedFetcher
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        username: usernameInput,
        password: passwordInput
      });
      const { token: jwtToken, user: loggedUser } = res.data;
      
      localStorage.setItem('fuo_token', jwtToken);
      localStorage.setItem('fuo_user', JSON.stringify(loggedUser));
      
      setToken(jwtToken);
      setUser(loggedUser);
      
      // Auto redirect to nutritionist panel if role fits
      if (loggedUser.role === 'nutritionist' || loggedUser.role === 'admin') {
        setTab('nutritionist-panel');
      } else {
        setTab('home');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Invalid username (matric/staff ID) or password.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('fuo_token');
    localStorage.removeItem('fuo_user');
    setToken(null);
    setUser(null);
    setTab('home');
    setSelectedStudent(null);
  }

  // Quick Demo Logins Helper
  function fillDemo(role: 'student' | 'nutritionist' | 'admin') {
    if (role === 'student') {
      setUsernameInput('FUO/20/0205');
      setPasswordInput('student123');
    } else if (role === 'nutritionist') {
      setUsernameInput('profsmogunbode');
      setPasswordInput('ogunbode12');
    } else if (role === 'admin') {
      setUsernameInput('bello');
      setPasswordInput('Ayomide12');
    }
  }

  // Publish a custom diet plan
  async function handlePublishDiet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;

    const meals = [
      { name: 'Breakfast', items: [{ food: breakfastItem || 'Custom Item' }] },
      { name: 'Lunch', items: [{ food: lunchItem || 'Custom Item' }] },
      { name: 'Dinner', items: [{ food: dinnerItem || 'Custom Item' }] },
      { name: 'Snacks', items: [{ food: snacksItem || 'Custom Item' }] }
    ];

    try {
      await axios.post(
        `${API_BASE}/api/diet/${selectedStudent.username}`,
        {
          meals,
          notes: nutritionNotes,
          forSickleCell
        },
        getHeaders()
      );

      alert(`Diet plan successfully published to ${selectedStudent.name}!`);
      
      // Reset inputs
      setBreakfastItem('');
      setLunchItem('');
      setDinnerItem('');
      setSnacksItem('');
      setNutritionNotes('');
      setForSickleCell(false);
      
      // Re-fetch plans
      mutateSelectedStudentPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish diet plan.');
    }
  }

  // If not logged in, render the beautiful portal login page
  if (!token) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="/fountain University.jpeg"
              alt="Fountain University circular emblem"
              style={{ height: '70px', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}
            />
            <h1 className="brand-title" style={{ fontSize: '1.75rem' }}>University Nutrition Portal</h1>
            <p className="brand-subtitle">Sign in with your Matric Number or Staff ID</p>
          </div>

          {loginError && (
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, border: '1px solid #fee2e2' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Matric Number / Staff ID
              </label>
              <input
                type="text"
                placeholder="e.g. FUO/20/0205"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Portal Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Secure Login
            </button>
          </form>

          {/* Quick Demo Assist Widgets */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--light-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>QUICK DEMO ACCELERATORS:</span>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button onClick={() => fillDemo('student')} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                👤 Student
              </button>
              <button onClick={() => fillDemo('nutritionist')} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                🥑 Nutritionist
              </button>
              <button onClick={() => fillDemo('admin')} className="btn btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                ⚙️ Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render authenticated portal workspace
  return (
    <div className="app-container">
      {/* Dynamic Header */}
      <header className="app-header">
        <div className="brand-section">
          <img
            src="/fountain University.jpeg"
            alt="Fountain University logo"
            className="brand-logo"
          />
          <div>
            <h1 className="brand-title">Fountain University Diet App</h1>
            <div className="brand-subtitle">
              Active Session: <strong>{user.name}</strong> ({user.role.toUpperCase()})
            </div>
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
          {(user.role === 'nutritionist' || user.role === 'admin') && (
            <button 
              onClick={() => setTab('nutritionist-panel')} 
              className={`tab-btn ${tab === 'nutritionist-panel' ? 'active' : ''}`}
            >
              🥑 Nutritionist Control Panel
            </button>
          )}
          <button onClick={handleLogout} className="tab-btn" style={{ color: 'var(--danger)' }}>
            🚪 Logout
          </button>
        </nav>
      </header>

      {/* Main Tabbed Area */}
      <main>
        {tab === 'home' && (
          <div className="dashboard-layout">
            
            {/* Student/Staff Personalized Prescription View */}
            <div>
              <div className="card">
                <h2>Personalized Nutrition Tally & Prescription</h2>
                
                {Array.isArray(studentPlans) && studentPlans.length > 0 ? (
                  <div>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Here is your official diet plan, custom formulated for you by our university nutritionist. Follow this plan to keep your metabolic levels and hydration optimal.
                    </p>

                    {studentPlans.map((plan: any) => (
                      <div key={plan.id} style={{ border: '1px solid var(--primary-glow)', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                            📅 Prescribed: {new Date(plan.date).toLocaleDateString()}
                          </span>
                          {plan.forSickleCell && (
                            <span className="pill pill-success" style={{ border: '1px solid #a7f3d0' }}>🩸 Optimized for Sickle Cell Guard</span>
                          )}
                        </div>

                        {/* Visual Weekly Grid of Assigned Meals */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                          {plan.meals?.map((meal: any, idx: number) => (
                            <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--light-border)' }}>
                              <h4 style={{ color: 'var(--dark-bg)', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                                {meal.name}
                              </h4>
                              {meal.items?.map((item: any, i: number) => (
                                <div key={i} style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                  🍽️ {item.food}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>

                        {/* Nutritionist prescription notes */}
                        {plan.notes && (
                          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--light-border)' }}>
                            <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--dark-bg)', marginBottom: '0.25rem' }}>
                              🩺 Clinical Prescription / Nutritionist Instructions:
                            </h5>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', paddingLeft: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
                              "{plan.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                    🥣 <strong>No personalized diets assigned yet.</strong><br/>
                    Our university nutritionist has not published a customized diet plan for your account yet. You can explore standard wellness information or cataloged foods in the tabs above!
                  </div>
                )}
              </div>

              {/* General App Info Section */}
              <div className="card">
                <h2>Molecular Dietary Shield</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This molecular nutrition portal helps university staff and students prevent cellular dehydration, enhance oxygen delivery, and maximize daily energy. Use the Wellness target calculator to find your perfect metabolic scaling levels!
                </p>
              </div>
            </div>

            {/* General App Right Widget */}
            <aside>
              <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                <h3>🏫 Student / Staff Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                  <div className="nutrient-row">
                    <span>Full Name</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div className="nutrient-row">
                    <span>ID / Username</span>
                    <strong>{user.username}</strong>
                  </div>
                  <div className="nutrient-row" style={{ borderBottom: 'none' }}>
                    <span>Role Type</span>
                    <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong>
                  </div>
                </div>
              </div>
            </aside>

          </div>
        )}

        {tab === 'sickle' && <SickleCellSection userRole={user.role} />}

        {tab === 'nutritionist-panel' && (user.role === 'nutritionist' || user.role === 'admin') && (
          <div className="dashboard-layout">
            
            {/* Left Column: All Students/Staff list */}
            <div>
              <div className="card">
                <h2>University Student & Staff Registry</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Select a student or staff member below to view their details, check past nutrition prescriptions, or formulate a new dietary plan.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {Array.isArray(allUsers) && allUsers.map((u: any) => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedStudent(u)}
                      className="food-card"
                      style={{ 
                        cursor: 'pointer', 
                        borderColor: selectedStudent?.id === u.id ? 'var(--primary)' : 'var(--light-border)',
                        background: selectedStudent?.id === u.id ? 'var(--primary-light)' : 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {u.username}</div>
                        </div>
                        <span className="pill pill-neutral" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selection Detail & Past Prescriptions */}
              {selectedStudent && (
                <div className="card">
                  <h2>Diet History for {selectedStudent.name}</h2>
                  
                  {Array.isArray(selectedStudentPlans) && selectedStudentPlans.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedStudentPlans.map((plan: any) => (
                        <div key={plan.id} style={{ border: '1px solid var(--light-border)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <span>📅 Published: {new Date(plan.date).toLocaleString()}</span>
                            {plan.forSickleCell && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>🩸 Sickle Cell Guard</span>}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {plan.meals?.map((m: any, idx: number) => (
                              <div key={idx} style={{ background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>{m.name}</span>
                                <strong style={{ fontSize: '0.85rem' }}>{m.items?.[0]?.food || '—'}</strong>
                              </div>
                            ))}
                          </div>
                          {plan.notes && (
                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                              Notes: "{plan.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No active diet plans assigned to {selectedStudent.name} yet. Use the planner on the right to assign one!
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Nutritionist Planning Drawer */}
            <aside>
              {selectedStudent ? (
                <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                  <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                    🥗 Prescribe Diet Plan
                  </h3>
                  <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Formulating diet for: <strong>{selectedStudent.name}</strong>
                  </div>

                  <form onSubmit={handlePublishDiet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Meal dropdown selectors */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🥣 Breakfast Option</label>
                      <select 
                        value={breakfastItem} 
                        onChange={(e) => setBreakfastItem(e.target.value)} 
                        className="form-input"
                        style={{ height: '40px' }}
                      >
                        <option value="">-- Select Food --</option>
                        {foods?.map((f: any) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        <option value="Hibiscus tea & whole toast">Moringa Tea & Toast</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🍛 Lunch Option</label>
                      <select 
                        value={lunchItem} 
                        onChange={(e) => setLunchItem(e.target.value)} 
                        className="form-input"
                        style={{ height: '40px' }}
                      >
                        <option value="">-- Select Food --</option>
                        {foods?.map((f: any) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        <option value="Jollof Rice & Steamed Fish">Jollof Rice & Steamed Fish</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🍲 Dinner Option</label>
                      <select 
                        value={dinnerItem} 
                        onChange={(e) => setDinnerItem(e.target.value)} 
                        className="form-input"
                        style={{ height: '40px' }}
                      >
                        <option value="">-- Select Food --</option>
                        {foods?.map((f: any) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        <option value="Egusi Soup & Pounded Yam">Egusi Soup & Pounded Yam</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>🍎 Healthy Snacks Option</label>
                      <select 
                        value={snacksItem} 
                        onChange={(e) => setSnacksItem(e.target.value)} 
                        className="form-input"
                        style={{ height: '40px' }}
                      >
                        <option value="">-- Select Food --</option>
                        {foods?.map((f: any) => <option key={f.id} value={f.name}>{f.name}</option>)}
                        <option value="Fresh Orange & Walnut">Fresh Orange & Walnut</option>
                      </select>
                    </div>

                    {/* Prescription / Clinical Notes */}
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        🩺 Clinical Notes / Therapeutic Prescriptions
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Write dynamic therapeutic advice here, e.g. Take 3 liters of water. Supplement with Omega-3."
                        value={nutritionNotes}
                        onChange={(e) => setNutritionNotes(e.target.value)}
                        className="form-input"
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        id="sc_opt" 
                        checked={forSickleCell} 
                        onChange={(e) => setForSickleCell(e.target.checked)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="sc_opt" style={{ cursor: 'pointer', fontWeight: 600 }}>
                        Optimize for Sickle Cell Guard
                      </label>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Publish Personalized Plan
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  🥑 Click on any student or staff member in the registry on the left to begin formulating and publishing custom dietary plans!
                </div>
              )}
            </aside>

          </div>
        )}
      </main>
    </div>
  );
}
