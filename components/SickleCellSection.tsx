import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function SickleCellSection({ userRole = 'student' }: { userRole?: 'student'|'admin' }) {
  const { data: foods, mutate } = useSWR('/api/sickle-foods', fetcher);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<any>(null);

  if (!foods) return <div>Loading...</div>;

  const filtered = foods.filter((f: any) => !query || f.food_name.toLowerCase().includes(query.toLowerCase()));

  async function toggleRecommend(id: string) {
    await axios.patch(`/api/sickle-foods/${id}`, { recommended_for_sickle_cell: !(foods.find((x:any)=>x.id===id)?.recommended_for_sickle_cell) });
    mutate();
  }

  async function addToMeal(food: any) {
    await axios.post('/api/sickle-meal-logs', { user_id: 'demo-user', food_id: food.id, serving_size: '1', calories: food.nutrients?.calories || 0 });
    alert('Added to meal (demo)');
  }

  return (
    <div>
      <h2>Sickle Cell Warrior Diet</h2>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input placeholder="Search foods..." value={query} onChange={(e)=>setQuery(e.target.value)} />
        <button onClick={()=>{ const blob = new Blob([JSON.stringify(foods, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); window.open(url); }}>Export JSON</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
        <div>
          {filtered.map((f:any)=>(
            <div key={f.id} style={{ border:'1px solid #eee', padding:12, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:600 }}>{f.food_name}</div>
                  <div style={{ fontSize:12, color:'#666' }}>{f.category}</div>
                </div>
                <div>
                  {f.recommended_for_sickle_cell ? <span style={{ background:'#dbf5e6', padding:'2px 6px', borderRadius:6 }}>Recommended</span> : f.caution ? <span style={{ background:'#fff4db', padding:'2px 6px', borderRadius:6 }}>Caution</span> : <span style={{ background:'#f3f4f6', padding:'2px 6px', borderRadius:6 }}>Neutral</span>}
                </div>
              </div>

              <div style={{ marginTop:8 }}>{f.short_desc}</div>

              <div style={{ marginTop:8, display:'flex', justifyContent:'space-between' }}>
                <div>Calories: {f.nutrients?.calories ?? '—'}</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>setSelected(f)}>Details</button>
                  <button onClick={()=>addToMeal(f)}>Add to meal</button>
                  {userRole==='admin' && <label><input type="checkbox" checked={!!f.recommended_for_sickle_cell} onChange={()=>toggleRecommend(f.id)} /> Recommend</label>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside style={{ border:'1px solid #eee', padding:12 }}>
          <h4>Quick actions</h4>
          <button onClick={async ()=>{ const newFood = { id: `new_${Date.now()}`, food_name:'New Food (demo)', category:'Uncategorized', nutrients:{} }; await axios.post('/api/sickle-foods', newFood); mutate(); }}>Create (demo)</button>
          <button onClick={()=>{ const blob = new Blob([JSON.stringify(foods, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); window.open(url); }}>Download seed</button>

          {selected && <>
            <div style={{ marginTop:12 }}>
              <h5>{selected.food_name}</h5>
              <div style={{ fontSize:13 }}>{selected.short_desc}</div>
              <pre style={{ background:'#f7f7f7', padding:8 }}>{JSON.stringify(selected.nutrients, null, 2)}</pre>
              <button onClick={()=>addToMeal(selected)}>Add to meal</button>
            </div>
          </>}
        </aside>
      </div>
    </div>
  );
}
