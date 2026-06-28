import React, { useState, useMemo } from 'react';
import { NIGERIAN_FOODS, CATEGORIES, SCD_RATING_COLORS, NigerianFood, SCDRating } from '../lib/nigerianFoods';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  scdMode?: boolean; // if true, show SCD filter and ratings prominently
}

export default function NigerianFoodPicker({ label, value, onChange, scdMode = false }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [scdFilter, setScdFilter] = useState(false);

  const filtered = useMemo(() => {
    return NIGERIAN_FOODS.filter(f => {
      const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.ingredients.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'All' || f.category === catFilter;
      const matchScd = !scdFilter || (f.scdRating && f.scdRating !== 'Limit' && f.scdRating !== 'Avoid');
      return matchSearch && matchCat && matchScd;
    });
  }, [search, catFilter, scdFilter]);

  function select(food: NigerianFood) {
    onChange(food.name);
    setOpen(false);
    setSearch('');
  }

  const ratingBadge = (rating: SCDRating) => {
    if (!rating) return null;
    const c = SCD_RATING_COLORS[rating] || {};
    return (
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.45rem',
        borderRadius: '999px', background: c.bg, color: c.text,
        border: `1px solid ${c.border}`, whiteSpace: 'nowrap'
      }}>
        {rating === 'Excellent' ? '⭐ Excellent' :
         rating === 'Recommended' ? '✅ Recommended' :
         rating === 'Moderate' ? '⚠️ Moderate' :
         rating === 'Limit' ? '🔶 Limit' : '❌ Avoid'}
      </span>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', padding: '0.55rem 0.85rem', textAlign: 'left',
          background: 'white', border: '1.5px solid var(--light-border)',
          borderRadius: 'var(--radius-sm)', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.875rem', color: value ? '#1e293b' : '#94a3b8',
          transition: 'border-color 0.15s'
        }}
      >
        <span>{value || '— Select Nigerian food —'}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 999, background: 'white',
          border: '1.5px solid var(--light-border)', borderRadius: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.14)', overflow: 'hidden',
          maxHeight: '420px', display: 'flex', flexDirection: 'column'
        }}>
          {/* Search */}
          <div style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
            <input
              autoFocus
              placeholder="Search food or ingredient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.4rem 0.7rem', borderRadius: '6px',
                border: '1px solid #e2e8f0', fontSize: '0.82rem', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem 0.75rem', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} type="button" onClick={() => setCatFilter(cat)} style={{
                padding: '0.2rem 0.55rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '999px',
                border: '1px solid', cursor: 'pointer',
                background: catFilter === cat ? 'var(--primary)' : 'white',
                color: catFilter === cat ? 'white' : 'var(--text-secondary)',
                borderColor: catFilter === cat ? 'var(--primary)' : '#e2e8f0',
              }}>
                {cat === 'All' ? `All (${NIGERIAN_FOODS.length})` :
                 cat === 'Swallows & Grains' ? '🍚 Swallows' :
                 cat === 'Soups & Stews' ? '🍲 Soups' :
                 cat === 'Fruits' ? '🍎 Fruits' : '🥚 Others'}
              </button>
            ))}
            {/* SCD toggle */}
            <button type="button" onClick={() => setScdFilter(f => !f)} style={{
              padding: '0.2rem 0.55rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '999px',
              border: '1px solid', cursor: 'pointer', marginLeft: 'auto',
              background: scdFilter ? '#ecfdf5' : 'white',
              color: scdFilter ? '#065f46' : 'var(--text-secondary)',
              borderColor: scdFilter ? '#a7f3d0' : '#e2e8f0',
            }}>
              🩸 SCD Safe Only
            </button>
          </div>

          {/* Food list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No foods match your search/filter.
              </div>
            ) : (
              filtered.map((food, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => select(food)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.6rem 0.85rem',
                    background: value === food.name ? '#eff6ff' : 'transparent',
                    border: 'none', borderBottom: '1px solid #f8fafc',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.15rem',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (value !== food.name) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (value !== food.name) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{food.name}</span>
                    {food.scdRating && ratingBadge(food.scdRating)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    <span style={{ fontStyle: 'italic' }}>{food.ingredients}</span>
                    {food.scdNote && (
                      <span style={{ marginLeft: '0.4rem', color: '#059669' }}>— {food.scdNote}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '0.4rem 0.75rem', borderTop: '1px solid #f1f5f9', background: '#fafafa', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>{filtered.length} foods shown</span>
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>
              Clear selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
