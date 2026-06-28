import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE !== undefined
  ? process.env.NEXT_PUBLIC_API_BASE
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:4000');

function isSCDGenotype(g: string) { return g === 'SS' || g === 'SC'; }

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'users' | 'foods'>('users');

  // User form state
  const [userIdToEdit, setUserIdToEdit] = useState<string | null>(null);
  const [uUsername, setUUsername] = useState('');
  const [uName, setUName] = useState('');
  const [uRole, setURole] = useState('student');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uLevel, setULevel] = useState('100 Level');
  const [uGenotype, setUGenotype] = useState('');
  const [uBloodGroup, setUBloodGroup] = useState('');
  const [uQuery, setUQuery] = useState('');
  const [uRoleFilter, setURoleFilter] = useState<'all'|'student'|'staff'|'clinicians'>('all');
  const [onboardMethod, setOnboardMethod] = useState<'single'|'bulk'>('single');
  const [bulkText, setBulkText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Food form state
  const [foodIdToEdit, setFoodIdToEdit] = useState<string | null>(null);
  const [fName, setFName] = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fCalories, setFCalories] = useState('');
  const [fProtein, setFProtein] = useState('');
  const [fCarbs, setFCarbs] = useState('');
  const [fFat, setFFat] = useState('');
  const [fNotes, setFNotes] = useState('');
  const [fQuery, setFQuery] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('fuo_token');
    const u = localStorage.getItem('fuo_user');
    if (!t || !u) { router.replace('/'); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== 'admin') { router.replace('/'); return; }
    setToken(t);
    setUser(parsed);
  }, []);

  const headers = () => token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const fetcher = (url: string) => axios.get(`${API_BASE}${url}`, headers()).then(r => r.data);

  const { data: allUsers, mutate: mutateUsers } = useSWR(token ? '/api/users' : null, fetcher);
  const { data: foods, mutate: mutateFoods } = useSWR(token ? '/api/foods' : null, fetcher);

  const filteredUsers = Array.isArray(allUsers) ? allUsers.filter((u: any) => {
    const q = uQuery.toLowerCase();
    const match = u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
    if (!match) return false;
    if (uRoleFilter === 'all') return true;
    if (uRoleFilter === 'clinicians') return ['nutritionist','doctor','admin'].includes(u.role);
    return u.role === uRoleFilter;
  }) : [];

  const filteredFoods = Array.isArray(foods) ? foods.filter((f: any) =>
    f.name.toLowerCase().includes(fQuery.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(fQuery.toLowerCase()))
  ) : [];

  function resetUserForm() {
    setUserIdToEdit(null); setUUsername(''); setUName(''); setURole('student');
    setUEmail(''); setUPassword(''); setULevel('100 Level'); setUGenotype(''); setUBloodGroup('');
  }

  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const meta: any = {};
      if (uRole === 'student') meta.level = uLevel;
      if (uGenotype) meta.genotype = uGenotype;
      if (uBloodGroup) meta.bloodGroup = uBloodGroup;
      const payload = { username: uUsername, name: uName, role: uRole, email: uEmail, password: uPassword, meta };
      if (userIdToEdit) {
        await axios.put(`${API_BASE}/api/users/${userIdToEdit}`, payload, headers());
        alert('User updated!');
      } else {
        await axios.post(`${API_BASE}/api/users`, payload, headers());
        alert('User created!');
      }
      resetUserForm();
      mutateUsers();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save user.'); }
  }

  function handleEditUser(u: any) {
    setUserIdToEdit(u.id); setUUsername(u.username); setUName(u.name); setURole(u.role);
    setUEmail(u.email || ''); setUPassword(''); setULevel(u.meta?.level || '100 Level');
    setUGenotype(u.meta?.genotype || ''); setUBloodGroup(u.meta?.bloodGroup || '');
  }

  async function handleDeleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/users/${id}`, headers());
      mutateUsers();
    } catch (err: any) { alert(err.response?.data?.message || 'Delete failed.'); }
  }

  async function handleBulkOnboard(e: React.FormEvent) {
    e.preventDefault();
    setBulkLoading(true);
    try {
      const users = bulkText.split('\n').filter(l => l.trim()).map(line => {
        const [username, name, role, email, password] = line.split(',').map(p => p.trim());
        return { username, name, role: role.toLowerCase(), email: email || '', password: password || 'fuo123' };
      });
      const res = await axios.post(`${API_BASE}/api/users/bulk`, { users }, headers());
      alert(res.data.message || 'Bulk onboard done!');
      setBulkText('');
      mutateUsers();
    } catch (err: any) { alert(err.response?.data?.message || 'Bulk onboard failed.'); }
    setBulkLoading(false);
  }

  function resetFoodForm() {
    setFoodIdToEdit(null); setFName(''); setFCategory(''); setFCalories('');
    setFProtein(''); setFCarbs(''); setFFat(''); setFNotes('');
  }

  async function handleSaveFood(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = { name: fName, category: fCategory, calories: fCalories, protein_g: fProtein, carbs_g: fCarbs, fat_g: fFat, notes: fNotes };
      if (foodIdToEdit) {
        await axios.put(`${API_BASE}/api/foods/${foodIdToEdit}`, payload, headers());
        alert('Food updated!');
      } else {
        await axios.post(`${API_BASE}/api/foods`, payload, headers());
        alert('Food added!');
      }
      resetFoodForm();
      mutateFoods();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to save food.'); }
  }

  async function handleDeleteFood(id: string, name: string) {
    if (!confirm(`Delete "${name}" from catalog?`)) return;
    try {
      await axios.delete(`${API_BASE}/api/foods/${id}`, headers());
      mutateFoods();
    } catch (err: any) { alert('Delete failed.'); }
  }

  if (!user) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>Loading...</div>;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <img src="/fountain University.jpeg" alt="FUO Logo" className="brand-logo" />
          <div>
            <h1 className="brand-title" style={{ fontSize: '1.1rem' }}>⚙️ Admin Console</h1>
            <div className="brand-subtitle">Fountain University Diet App — Administration</div>
          </div>
        </div>
        <nav className="nav-tabs">
          <button onClick={() => router.push('/')} className="tab-btn">← Back to Portal</button>
          <button onClick={() => setSubTab('users')} className={`tab-btn ${subTab === 'users' ? 'active' : ''}`}>👥 Users</button>
          <button onClick={() => setSubTab('foods')} className={`tab-btn ${subTab === 'foods' ? 'active' : ''}`}>🍎 Foods</button>
          <button onClick={() => { localStorage.clear(); router.replace('/'); }} className="tab-btn" style={{ color: 'var(--danger)' }}>🚪 Logout</button>
        </nav>
      </header>

      <main>
        {/* USERS SUB-TAB */}
        {subTab === 'users' && (
          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>👥 Registry ({filteredUsers.length})</h3>
                  <input placeholder="Search name or ID..." value={uQuery} onChange={e => setUQuery(e.target.value)} className="form-input" style={{ maxWidth: '260px', padding: '0.5rem 1rem' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.75rem' }}>
                  {(['all','student','staff','clinicians'] as const).map(r => (
                    <button key={r} onClick={() => setURoleFilter(r)} className={`tab-btn ${uRoleFilter === r ? 'active' : ''}`} style={{ padding: '0.3rem 0.7rem', fontSize: '0.74rem' }}>
                      {r === 'all' ? 'All' : r === 'clinicians' ? 'Clinicians' : r === 'staff' ? 'Staff' : 'Students'}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {filteredUsers.map((u: any) => {
                    const scd = u.meta?.genotype && isSCDGenotype(u.meta.genotype);
                    return (
                      <div key={u.id} className="food-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.1rem', borderColor: scd ? '#fca5a5' : undefined }}>
                        <div>
                          <strong style={{ color: 'var(--dark-bg)' }}>{u.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                            <span>🔑 {u.username}</span>
                            <span>✉️ {u.email || '—'}</span>
                            {u.meta?.genotype && <span style={{ color: scd ? '#dc2626' : '#059669', fontWeight: 700 }}>{scd ? '🩸' : '✅'} {u.meta.genotype}</span>}
                            {u.meta?.bloodGroup && <span style={{ color: '#6366f1' }}>🩺 {u.meta.bloodGroup}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span className="pill pill-neutral" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>{u.role}</span>
                          {scd && <span className="pill" style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', fontSize: '0.62rem' }}>SCD</span>}
                          <button onClick={() => handleEditUser(u)} className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem' }}>✏️</button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem', color: 'var(--danger)', borderColor: '#fecaca' }}>🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside>
              <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                  {userIdToEdit ? '✏️ Edit User' : '👤 Onboarding Portal'}
                </h3>

                {!userIdToEdit && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px dashed var(--light-border)', paddingBottom: '0.75rem' }}>
                    <button onClick={() => setOnboardMethod('single')} className={`btn ${onboardMethod === 'single' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>👤 Single</button>
                    <button onClick={() => setOnboardMethod('bulk')} className={`btn ${onboardMethod === 'bulk' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '0.75rem', height: '36px' }}>📂 Bulk</button>
                  </div>
                )}

                {(onboardMethod === 'single' || userIdToEdit) ? (
                  <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Matric / Staff ID</label>
                      <input value={uUsername} onChange={e => setUUsername(e.target.value)} className="form-input" placeholder="FUO/20/0205" required disabled={!!userIdToEdit} /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Full Name</label>
                      <input value={uName} onChange={e => setUName(e.target.value)} className="form-input" placeholder="John Doe" required /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Role</label>
                      <select value={uRole} onChange={e => setURole(e.target.value)} className="form-input" style={{ height: '40px' }}>
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="nutritionist">Nutritionist</option>
                        <option value="doctor">Doctor</option>
                        <option value="admin">Admin</option>
                      </select></div>
                    {uRole === 'student' && (
                      <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Level</label>
                        <select value={uLevel} onChange={e => setULevel(e.target.value)} className="form-input" style={{ height: '40px' }}>
                          {['100 Level','200 Level','300 Level','400 Level','500 Level','Postgraduate'].map(l => <option key={l}>{l}</option>)}
                        </select></div>
                    )}
                    <div style={{ borderTop: '1px dashed var(--light-border)', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>🩺 Health Profile</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        <div><label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Genotype</label>
                          <select value={uGenotype} onChange={e => setUGenotype(e.target.value)} className="form-input" style={{ height: '38px' }}>
                            <option value="">— Select —</option>
                            <option value="AA">AA (Normal)</option>
                            <option value="AS">AS (Carrier)</option>
                            <option value="SS">SS (Sickle Cell)</option>
                            <option value="SC">SC (Sickle Cell)</option>
                            <option value="AC">AC (Carrier)</option>
                            <option value="CC">CC</option>
                          </select></div>
                        <div><label style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Blood Group</label>
                          <select value={uBloodGroup} onChange={e => setUBloodGroup(e.target.value)} className="form-input" style={{ height: '38px' }}>
                            <option value="">— Select —</option>
                            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
                          </select></div>
                      </div>
                      {uGenotype && isSCDGenotype(uGenotype) && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>
                          🩸 Sickle Cell patient — SCD diet plans will apply.
                        </div>
                      )}
                    </div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Email</label>
                      <input type="email" value={uEmail} onChange={e => setUEmail(e.target.value)} className="form-input" placeholder="user@fuo.edu.ng" /></div>
                    <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{userIdToEdit ? '🔑 New Password (blank = keep)' : '🔑 Password'}</label>
                      <input type="password" value={uPassword} onChange={e => setUPassword(e.target.value)} className="form-input" placeholder="••••••••" required={!userIdToEdit} /></div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{userIdToEdit ? 'Save Changes' : 'Register Account'}</button>
                      {userIdToEdit && <button type="button" className="btn btn-secondary" onClick={resetUserForm}>Cancel</button>}
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleBulkOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Bulk CSV (one per line)</label>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Format: ID, Full Name, Role, [Email], [Password]</span>
                      <textarea rows={10} value={bulkText} onChange={e => setBulkText(e.target.value)} className="form-input" style={{ fontFamily: 'monospace', fontSize: '0.73rem', resize: 'vertical' }} placeholder="FUO/20/0999, Alice Johnson, student, alice@fuo.edu.ng" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }} disabled={bulkLoading}>{bulkLoading ? 'Onboarding...' : '🚀 Execute Bulk Onboard'}</button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* FOODS SUB-TAB */}
        {subTab === 'foods' && (
          <div className="dashboard-layout">
            <div>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>🍎 Foods Catalog ({filteredFoods.length})</h3>
                  <input placeholder="Search foods..." value={fQuery} onChange={e => setFQuery(e.target.value)} className="form-input" style={{ maxWidth: '260px', padding: '0.5rem 1rem' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {filteredFoods.map((f: any) => (
                    <div key={f.id} className="food-card" style={{ padding: '1rem 1.1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ color: 'var(--dark-bg)' }}>{f.name}</strong>
                          <span className="pill pill-neutral" style={{ marginLeft: '0.5rem', fontSize: '0.63rem' }}>{f.category}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button onClick={() => { setFoodIdToEdit(f.id); setFName(f.name); setFCategory(f.category||''); setFCalories(String(f.calories||0)); setFProtein(String(f.protein_g||0)); setFCarbs(String(f.carbs_g||0)); setFFat(String(f.fat_g||0)); setFNotes(f.notes||''); }} className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem' }}>✏️</button>
                          <button onClick={() => handleDeleteFood(f.id, f.name)} className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem', color: 'var(--danger)', borderColor: '#fecaca' }}>🗑️</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span>⚡ {f.calories} kcal</span><span>🥩 {f.protein_g}g</span><span>🌾 {f.carbs_g}g</span><span>🧈 {f.fat_g}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside>
              <div className="detail-sidebar" style={{ position: 'relative', top: 0 }}>
                <h3 style={{ color: 'var(--primary)', borderBottom: '1px solid var(--light-border)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
                  {foodIdToEdit ? '✏️ Edit Food' : '🍎 Add Food'}
                </h3>
                <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Food Name</label>
                    <input value={fName} onChange={e => setFName(e.target.value)} className="form-input" placeholder="e.g. Rice & Beans" required /></div>
                  <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Category</label>
                    <input value={fCategory} onChange={e => setFCategory(e.target.value)} className="form-input" placeholder="e.g. Carb, Protein" required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div><label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Calories (kcal)</label>
                      <input type="number" value={fCalories} onChange={e => setFCalories(e.target.value)} className="form-input" /></div>
                    <div><label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Protein (g)</label>
                      <input type="number" step="0.1" value={fProtein} onChange={e => setFProtein(e.target.value)} className="form-input" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div><label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Carbs (g)</label>
                      <input type="number" step="0.1" value={fCarbs} onChange={e => setFCarbs(e.target.value)} className="form-input" /></div>
                    <div><label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Fat (g)</label>
                      <input type="number" step="0.1" value={fFat} onChange={e => setFFat(e.target.value)} className="form-input" /></div>
                  </div>
                  <div><label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Notes</label>
                    <input value={fNotes} onChange={e => setFNotes(e.target.value)} className="form-input" placeholder="Dietary notes..." /></div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{foodIdToEdit ? 'Save Updates' : 'Add to Catalog'}</button>
                    {foodIdToEdit && <button type="button" className="btn btn-secondary" onClick={resetFoodForm}>Cancel</button>}
                  </div>
                </form>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--light-border)' }}>
        <span style={{ opacity: 0.7 }}>Powered by</span>{' '}
        <strong style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>Dev Spirit</strong>
      </footer>
    </div>
  );
}
