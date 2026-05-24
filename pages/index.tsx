import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import SickleCellSection from '../components/SickleCellSection';
const fetcher = (url: string) => axios.get(url).then(r => r.data);
export default function Home() {
  const [tab, setTab] = useState<'home'|'sickle'>('home');
  const { data } = useSWR('/api/sickle-foods', fetcher);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <img
            src="/fountain University.jpeg"
            alt="Fountain University logo and app header showing a stylized fountain emblem next to the text Fountain University Diet App, subtitle Molecular nutrition & personalized diet; header used in a web application, conveys a professional and welcoming tone"
            style={{ height:48 }}
          />
          <div>
            <h1>Fountain University Diet App</h1>
            <div style={{ color:'#666' }}>Molecular nutrition & personalized diet</div>
          </div>
        </div>
        <nav>
          <button onClick={() => setTab('home')} style={{ marginRight:8 }}>Home</button>
          <button onClick={() => setTab('sickle')}>Sickle Cell Diet</button>
        </nav>
      </header>

      <main style={{ marginTop:24 }}>
        {tab === 'home' && (
          <div>
            <h2>Welcome — demo home</h2>
            <p>This starter includes a Sickle Cell diet section integrated with Supabase-ready API routes.</p>
            <p>Seeded foods count: {Array.isArray(data) ? data.length : 'loading...'}</p>
          </div>
        )}

        {tab === 'sickle' && <SickleCellSection userRole={'student'} />}
      </main>
    </div>
  );
}
