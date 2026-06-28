import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import axios from 'axios';
import SickleCellSection from '../components/SickleCellSection';
import NigerianFoodPicker from '../components/NigerianFoodPicker';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE !== undefined
  ? process.env.NEXT_PUBLIC_API_BASE
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? ''
      : 'http://localhost:4000');

export default function Home() {
  const router = useRouter();
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

  // Fetch university users (students/staff) for nutritionist panel
  const { data: allUsers } = useSWR(
    user && (user.role === 'nutritionist' || user.role === 'admin') ? '/api/users' : null,
    authenticatedFetcher
  );

  // Fetch logged in student's diet plans
  const { data: studentPlans } = useSWR(
    user && (user.role === 'student' || user.role === 'doctor') ? `/api/diet/${encodeURIComponent(user.username)}` : null,
    authenticatedFetcher
  );

  // Fetch selected student's plans (for nutritionist detail view)
  const { data: selectedStudentPlans, mutate: mutateSelectedStudentPlans } = useSWR(
    selectedStudent ? `/api/diet/${encodeURIComponent(selectedStudent.username)}` : null,
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
      
      // Auto redirect based on role
      if (loggedUser.role === 'admin') {
        router.push('/admin');
      } else if (loggedUser.role === 'nutritionist') {
        setTab('nutritionist-panel');
      } else {
        setTab('home');
      }
    } catch (err: any) {
      if (!err.response) {
        setLoginError('Could not connect to database server. Please ensure the backend Express app is running (e.g. run "npm run dev" in the backend directory).');
      } else {
        setLoginError(err.response?.data?.message || 'Invalid Matric ID / Staff ID or password.');
      }
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
      setPasswordInput('fuo/20/0205');
    } else if (role === 'nutritionist') {
      setUsernameInput('profsmogunbode');
      setPasswordInput('ogunbode12');
    } else if (role === 'admin') {
      setUsernameInput('kalibest10');
      setPasswordInput('airborne');
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
        `${API_BASE}/api/diet/${encodeURIComponent(selectedStudent.username)}`,
        {
          meals,
          notes: nutritionNotes,
          forSickleCell
        },
        getHeaders()
      );

      alert(`Diet plan successfully published to ${selectedStudent.name}!`);
      
      setBreakfastItem('');
      setLunchItem('');
      setDinnerItem('');
      setSnacksItem('');
      setNutritionNotes('');
      setForSickleCell(false);
      
      mutateSelectedStudentPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish diet plan.');
    }
  }

  // Helper: is this genotype a sickle cell patient?
  function isSCDGenotype(genotype: string) {
    return genotype === 'SS' || genotype === 'SC';
  }

  // If not logged in, render the login page
  if (!token) {
    return (
      <>
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

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.25rem',
        marginTop: '2rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--light-border)',
        letterSpacing: '0.04em'
      }}>
        <span style={{ opacity: 0.7 }}>Powered by</span>{' '}
        <strong style={{
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          letterSpacing: '0.02em'
        }}>Dev Spirit</strong>
      </footer>
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
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
          {isSCDGenotype(user.meta?.genotype || '') && (
            <button 
              onClick={() => setTab('sickle')} 
              className={`tab-btn ${tab === 'sickle' ? 'active' : ''}`}
            >
              🩸 Sickle Cell Diet
            </button>
          )}
          {(user.role === 'nutritionist' || user.role === 'admin') && (
            <button 
              onClick={() => setTab('nutritionist-panel')} 
              className={`tab-btn ${tab === 'nutritionist-panel' ? 'active' : ''}`}
            >
              🥑 Nutritionist Control Panel
            </button>
          )}
          {user.role === 'admin' && (
            <a
              href="/admin"
              className="tab-btn"
              style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: 700 }}
            >
              ⚙️ Admin Console ↗
            </a>
          )}
          <button onClick={handleLogout} className="tab-btn" style={{ color: 'var(--danger)' }}>
            🚪 Logout
          </button>
        </nav>
      </header>

      {/* Main workspace panels */}
      <main>
        {tab === 'home' && (
          <div className="dashboard-layout">
            <div>
              <div className="card">
                <h2>Personalized Nutrition Tally & Prescription</h2>
                
                {Array.isArray(studentPlans) && studentPlans.length > 0 ? (
                  <div>
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

                        {/* Notes */}
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

              <div className="card">
                <h2>Molecular Dietary Shield</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This molecular nutrition portal helps university staff and students prevent cellular dehydration, enhance oxygen delivery, and maximize daily energy. Use the Wellness target calculator to find your perfect metabolic scaling levels!
                </p>
              </div>
            </div>

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
                  <div className="nutrient-row">
                    <span>Role Type</span>
                    <strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{user.role}</strong>
                  </div>
                  {user.role === 'student' && (
                    <div className="nutrient-row">
                      <span>Academic Level</span>
                      <strong style={{ color: 'var(--primary)' }}>{user.meta?.level || '100 Level'}</strong>
                    </div>
                  )}
                  {user.meta?.genotype && (
                    <div className="nutrient-row">
                      <span>Genotype</span>
                      <strong style={{
                        color: isSCDGenotype(user.meta.genotype) ? '#dc2626' : '#059669',
                        fontWeight: 800
                      }}>
                        {user.meta.genotype}
                        {isSCDGenotype(user.meta.genotype) ? ' 🩸' : ' ✅'}
                      </strong>
                    </div>
                  )}
                  {user.meta?.bloodGroup && (
                    <div className="nutrient-row">
                      <span>Blood Group</span>
                      <strong style={{ color: 'var(--primary)' }}>{user.meta.bloodGroup}</strong>
                    </div>
                  )}
                  {user.meta?.genotype && isSCDGenotype(user.meta.genotype) && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.6rem 0.8rem',
                      background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: '8px', fontSize: '0.78rem', color: '#991b1b', fontWeight: 600
                    }}>
                      🩸 Sickle Cell Patient — your diet plans are specially optimized for SCD management.
                    </div>
                  )}
                  {(!user.meta?.genotype) && (
                    <div style={{
                      marginTop: '0.5rem', padding: '0.6rem 0.8rem',
                      background: '#fffbeb', border: '1px solid #fde68a',
                      borderRadius: '8px', fontSize: '0.78rem', color: '#92400e'
                    }}>
                      ⚠️ Genotype not recorded. Contact admin to update your health profile.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {tab === 'sickle' && isSCDGenotype(user.meta?.genotype || '') && <SickleCellSection userRole={user.role} />}

        {tab === 'nutritionist-panel' && (user.role === 'nutritionist' || user.role === 'admin') && (
          <div className="dashboard-layout">
            <div>
              <div className="card">
                <h2>University Student & Staff Registry</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Select a student or staff member below to view their details, check past nutrition prescriptions, or formulate a new dietary plan.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {Array.isArray(allUsers) && allUsers.map((u: any) => {
                    const isSCD = u.meta?.genotype && isSCDGenotype(u.meta.genotype);
                    return (
                      <div 
                        key={u.id} 
                        onClick={() => {
                          setSelectedStudent(u);
                          // Auto-enable SCD mode if patient has SS or SC genotype
                          setForSickleCell(!!isSCD);
                        }}
                        className="food-card"
                        style={{ 
                          cursor: 'pointer', 
                          borderColor: selectedStudent?.id === u.id ? 'var(--primary)' : isSCD ? '#fca5a5' : 'var(--light-border)',
                          background: selectedStudent?.id === u.id ? 'var(--primary-light)' : isSCD ? '#fff5f5' : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                              <span>ID: {u.username}</span>
                              {u.meta?.genotype && (
                                <span style={{ fontWeight: 700, color: isSCD ? '#dc2626' : '#059669' }}>
                                  {isSCD ? '🩸' : '✅'} {u.meta.genotype}
                                </span>
                              )}
                              {u.meta?.bloodGroup && (
                                <span style={{ color: '#6366f1' }}>🩺 {u.meta.bloodGroup}</span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                            <span className="pill pill-neutral" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                            {isSCD && <span className="pill" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontSize: '0.65rem' }}>SCD</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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

            <aside>
              {selectedStudent ? (
                <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                  <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                    🥗 Prescribe Diet Plan
                  </h3>

                  {/* Patient Health Profile Summary */}
                  <div style={{ marginBottom: '1rem', padding: '0.75rem', background: isSCDGenotype(selectedStudent.meta?.genotype || '') ? '#fef2f2' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${isSCDGenotype(selectedStudent.meta?.genotype || '') ? '#fecaca' : '#bbf7d0'}` }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>{selectedStudent.name}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                      {selectedStudent.meta?.genotype ? (
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700,
                          background: isSCDGenotype(selectedStudent.meta.genotype) ? '#fee2e2' : '#dcfce7',
                          color: isSCDGenotype(selectedStudent.meta.genotype) ? '#991b1b' : '#166534',
                          border: `1px solid ${isSCDGenotype(selectedStudent.meta.genotype) ? '#fca5a5' : '#86efac'}`
                        }}>
                          {isSCDGenotype(selectedStudent.meta.genotype) ? '🩸 ' : '✅ '}Genotype: {selectedStudent.meta.genotype}
                        </span>
                      ) : (
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontWeight: 600 }}>⚠️ Genotype Unknown</span>
                      )}
                      {selectedStudent.meta?.bloodGroup && (
                        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd', fontWeight: 600 }}>
                          🩺 {selectedStudent.meta.bloodGroup}
                        </span>
                      )}
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '999px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', textTransform: 'capitalize' }}>
                        {selectedStudent.role}
                      </span>
                    </div>
                    {isSCDGenotype(selectedStudent.meta?.genotype || '') && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.73rem', color: '#991b1b', fontWeight: 600 }}>
                        ⚠️ Sickle Cell Patient — SCD-safe foods auto-filtered
                      </div>
                    )}
                  </div>

                  <form onSubmit={handlePublishDiet} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

                    {/* SCD toggle — auto-enabled for SS/SC, manual for others */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: forSickleCell ? '#ecfdf5' : '#f8fafc', borderRadius: '8px', border: `1px solid ${forSickleCell ? '#a7f3d0' : '#e2e8f0'}` }}>
                      <input
                        type="checkbox"
                        id="sc_opt"
                        checked={forSickleCell}
                        onChange={(e) => setForSickleCell(e.target.checked)}
                        style={{ cursor: 'pointer', accentColor: '#059669' }}
                      />
                      <label htmlFor="sc_opt" style={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', color: forSickleCell ? '#065f46' : '#475569' }}>
                        🩸 Optimize for Sickle Cell Guard
                        {isSCDGenotype(selectedStudent.meta?.genotype || '') && (
                          <span style={{ fontSize: '0.68rem', marginLeft: '0.3rem', color: '#dc2626' }}>(auto)</span>
                        )}
                      </label>
                    </div>

                    <NigerianFoodPicker
                      label="🥣 Breakfast"
                      value={breakfastItem}
                      onChange={setBreakfastItem}
                      scdMode={forSickleCell}
                    />

                    <NigerianFoodPicker
                      label="🍛 Lunch"
                      value={lunchItem}
                      onChange={setLunchItem}
                      scdMode={forSickleCell}
                    />

                    <NigerianFoodPicker
                      label="🍲 Dinner"
                      value={dinnerItem}
                      onChange={setDinnerItem}
                      scdMode={forSickleCell}
                    />

                    <NigerianFoodPicker
                      label="🍎 Healthy Snack"
                      value={snacksItem}
                      onChange={setSnacksItem}
                      scdMode={forSickleCell}
                    />

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        🩺 Clinical Notes / Therapeutic Prescriptions
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Write therapeutic advice, e.g. Take 3 liters of water."
                        value={nutritionNotes}
                        onChange={(e) => setNutritionNotes(e.target.value)}
                        className="form-input"
                        style={{ fontFamily: 'inherit', resize: 'vertical' }}
                      />
                    </div>



                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                      Publish Personalized Plan
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  🥑 Click on any student or staff member in the registry on the left to begin formulating custom dietary plans!
                </div>
              )}
            </aside>
          </div>
        )}

      </main>
      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '1.25rem 1rem',
        marginTop: '1rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--light-border)',
        letterSpacing: '0.04em'
      }}>
        <span style={{ opacity: 0.7 }}>Powered by</span>{' '}
        <strong style={{
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800,
          letterSpacing: '0.02em'
        }}>Dev Spirit</strong>
      </footer>
    </div>
  );
}
