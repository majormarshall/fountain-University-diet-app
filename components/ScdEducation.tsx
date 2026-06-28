import React, { useState } from 'react';

const sections = [
  {
    emoji: '🩸',
    title: 'What is Sickle Cell Disease?',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    content: (
      <p style={{ lineHeight: 1.8, color: '#374151' }}>
        Sickle Cell Disease (SCD) is a <strong>genetic condition</strong> where red blood cells become rigid
        and block small blood vessels, causing oxygen delivery problems. It is inherited and can lead to
        various health issues throughout life.
      </p>
    )
  },
  {
    emoji: '⚠️',
    title: 'Signs & Symptoms',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    content: (
      <div style={{ lineHeight: 1.8, color: '#374151' }}>
        <p><strong>Early symptoms in babies may include:</strong></p>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li>Yellowing of the skin and eyes (jaundice)</li>
          <li>Feeling tired or baby crying more than usual</li>
          <li>Painful swelling in the hands and feet</li>
        </ul>
        <p><strong>Other symptoms may include:</strong></p>
        <ul style={{ paddingLeft: '1.25rem' }}>
          <li>Looking pale</li>
          <li>Dark urine</li>
          <li>Painful erection in boys (priapism)</li>
          <li>Frequent pain episodes</li>
          <li>Slow growth</li>
          <li>Stroke</li>
          <li>Swollen stomach</li>
        </ul>
      </div>
    )
  },
  {
    emoji: '🏥',
    title: 'When to Go to Hospital IMMEDIATELY',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    content: (
      <div style={{ lineHeight: 1.8, color: '#374151' }}>
        <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>Seek emergency care when there is:</p>
        <ul style={{ paddingLeft: '1.25rem' }}>
          <li>High temperature (&gt;38°C)</li>
          <li>Difficulty in breathing</li>
          <li>Chest pain</li>
          <li>Abdominal (stomach) swelling</li>
          <li>Sudden eye problems</li>
          <li>Severe headache</li>
          <li>Sudden limb weakness or loss of feeling</li>
          <li>Seizure</li>
          <li>Penile erection lasting more than four hours</li>
          <li>Sudden weakness or pain anywhere in body</li>
        </ul>
      </div>
    )
  },
  {
    emoji: '💊',
    title: 'If In Pain — What To Do',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    content: (
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: '#374151' }}>
        <li>Drink a lot of water</li>
        <li>Rest</li>
        <li>Apply warm compress on affected joint</li>
        <li>Take a painkiller if pain is mild at home</li>
        <li>Go to hospital if pain is worse or severe</li>
      </ul>
    )
  },
  {
    emoji: '🔗',
    title: 'Complications',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    content: (
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: '#374151' }}>
        <li>Frequent infections</li>
        <li>Bone damage</li>
        <li>Leg ulcers</li>
        <li>Gallstones</li>
        <li>Eye damage</li>
        <li>Kidney damage</li>
      </ul>
    )
  },
  {
    emoji: '🧬',
    title: 'How is SCD Inherited?',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    content: (
      <div style={{ lineHeight: 1.8, color: '#374151' }}>
        <p>SCD is inherited when a person receives <strong>two hemoglobin S genes</strong>, one from each parent.</p>
        <p style={{ marginTop: '0.75rem' }}>Those with only <strong>one hemoglobin S gene</strong> and one normal gene have <em>sickle cell trait</em> — generally remaining healthy but able to pass the gene to their children.</p>
        <div style={{ marginTop: '1rem', background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid #a5f3fc' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0891b2' }}>Inheritance Pattern when both parents carry sickle cell trait:</p>
          <ul style={{ paddingLeft: '1.25rem' }}>
            <li>25% chance — No sickle cell (normal)</li>
            <li>50% chance — Sickle cell trait (carrier)</li>
            <li>25% chance — Sickle cell disease (SCD)</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    emoji: '⚡',
    title: 'Things That Can Trigger Crises',
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    content: (
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: '#374151' }}>
        <li><strong>Extreme temperature:</strong> Too cold or too hot weather</li>
        <li><strong>High altitude:</strong> Traveling to high places with less oxygen</li>
        <li><strong>Cold water:</strong> Swimming in cold water</li>
        <li><strong>Dehydration:</strong> Not drinking enough liquid</li>
        <li><strong>Poor diet:</strong> Not eating balanced meals</li>
        <li><strong>Infections:</strong> Getting sick, especially bacterial infections</li>
        <li><strong>Physical & emotional stress:</strong> Intense activity or feeling overwhelmed</li>
      </ul>
    )
  },
  {
    emoji: '💉',
    title: 'Treatment Options',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    content: (
      <div style={{ lineHeight: 1.8, color: '#374151' }}>
        <p>Sickle Cell Disease lasts a lifetime. The only cure is a <strong>bone marrow transplant</strong>, which is hard to access in Nigeria.</p>
        <p style={{ marginTop: '0.75rem' }}><strong>Medicines that help manage SCD:</strong></p>
        <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
          <li><strong>Hydroxyurea</strong> — reduces complications and pain crises</li>
          <li><strong>Voxelotor</strong> — decreases sickling of cells</li>
          <li><strong>Crizanlizumab-tmca</strong> — lessens pain episodes</li>
        </ul>
        <p><strong>Blood transfusions</strong> are also used to treat anemia and certain complications.</p>
      </div>
    )
  },
  {
    emoji: '🛡️',
    title: 'Preventing Complications',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    content: (
      <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: '#374151' }}>
        <li>See your doctor regularly (every 3–12 months depending on age)</li>
        <li>Stay active</li>
        <li>Eat a balanced diet; avoid junk foods and candy</li>
        <li>Drink 2–3 litres of water daily; get 7–8 hours of sleep</li>
        <li>Wash hands often and maintain good hygiene</li>
        <li>Stay up to date on vaccines; use mosquito nets</li>
        <li>Take folic acid tonic daily</li>
        <li>Avoid blood transfusions unless prescribed by a specialist</li>
        <li>Get your eyes checked regularly</li>
      </ul>
    )
  },
  {
    emoji: '❌',
    title: 'Myths About Sickle Cell Disease',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    content: (
      <div style={{ lineHeight: 1.8, color: '#374151' }}>
        {[
          {
            myth: 'Babies with SCD do not live past 21 years',
            fact: 'Many children with SCD now survive to adulthood. The average life expectancy for a sickle cell patient in Nigeria is 52.9 years. With good care, a person with SCD can live as long as an average Nigerian. The oldest SCD patient in Africa known is 67 years.'
          },
          {
            myth: 'SCD patients cannot work professionally',
            fact: 'There are doctors, lawyers, bankers, and engineers living with SCD. With good care and support, sickle cell patients can thrive in tough professions.'
          },
          {
            myth: 'SCD is a contagious blood-borne disease',
            fact: 'SCD is a genetic condition present at birth. You cannot get SCD from contact with someone who has it. Children can only have SCD if both parents carry an abnormal hemoglobin gene.'
          },
          {
            myth: 'People with SCD are immune to malaria',
            fact: 'SCD patients are NOT immune to malaria. They need to take antimalarial drugs regularly as prophylaxis. People with sickle cell trait (HbAS) may have some resistance, not those with full SCD.'
          },
          {
            myth: 'SCD patients exaggerate pain for drug access',
            fact: 'There is no evidence of increased drug abuse in SCD. Pain is the most common symptom and often does not respond to over-the-counter medicines. Higher doses develop due to tolerance, not abuse.'
          },
          {
            myth: 'Sickle cell trait is a mild form of SCD',
            fact: 'Sickle cell trait is fundamentally different from SCD. People with sickle cell trait only inherit one abnormal gene and usually experience no symptoms of SCD.'
          }
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: '1.25rem', background: 'white', borderRadius: '8px', padding: '1rem', border: '1px solid #ddd6fe' }}>
            <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.25rem' }}>
              ❌ MYTH: {item.myth}
            </p>
            <p style={{ color: '#059669', fontWeight: 600, marginBottom: '0.25rem' }}>✅ FACT:</p>
            <p>{item.fact}</p>
          </div>
        ))}
      </div>
    )
  }
];

export default function ScdEducation() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.25rem' }}>🩸 Sickle Cell Disease — Education Centre</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Comprehensive clinical information for students, patients, and healthcare workers at Fountain University.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sections.map((sec, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: '12px',
                border: `1px solid ${isOpen ? sec.border : 'var(--light-border)'}`,
                background: isOpen ? sec.bg : 'white',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              {/* Header */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '1rem', color: isOpen ? sec.color : '#1e293b' }}>
                  <span style={{ fontSize: '1.3rem' }}>{sec.emoji}</span>
                  {sec.title}
                </span>
                <span style={{ fontSize: '1.2rem', color: sec.color, fontWeight: 700, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▾
                </span>
              </button>

              {/* Body */}
              {isOpen && (
                <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #a7f3d0', fontSize: '0.82rem', color: '#065f46' }}>
        📋 <strong>Clinical Note:</strong> This education material is based on established medical guidelines for Sickle Cell Disease management. Always consult a certified haematologist or physician for personalised treatment.
      </div>
    </div>
  );
}
