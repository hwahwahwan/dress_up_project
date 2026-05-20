import { useState, useEffect, useRef } from 'react';
import { SLOTS, resolveFit } from '../data/items.js';

export default function FitEditor({ equipped, fitOverrides, onFitChange }) {
  const activeSlots = SLOTS.filter((s) => equipped[s]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);

  useEffect(() => {
    const filled = SLOTS.find((s) => equipped[s]);
    if (filled && !activeSlot) setActiveSlot(filled);
  }, [equipped]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  const item = activeSlot ? equipped[activeSlot] : null;
  const fit = item ? resolveFit(item, fitOverrides) : {};

  function update(key, val) {
    if (!item) return;
    onFitChange(item.id, { ...fit, [key]: Number(val) });
  }

  async function saveAll() {
    try {
      await Promise.all(activeSlots.map((s) => {
        const it = equipped[s];
        const f = resolveFit(it, fitOverrides);
        const fitToSave = { top: f.top ?? 0, width: f.width ?? 100 };
        if (f.dx != null && f.dx !== 0) fitToSave.dx = f.dx;
        return fetch('/api/save-fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: it.id, fit: fitToSave }),
        });
      }));
      setCopied(true);
      copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('저장 실패: ' + e.message);
    }
  }

  if (activeSlots.length === 0) {
    return (
      <div style={panelStyle}>
        <div style={{ color: '#888', fontSize: 13 }}>옷을 먼저 입혀주세요</div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>FIT EDITOR</div>

      {/* 슬롯 탭 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {activeSlots.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSlot(s)}
            style={{
              padding: '4px 10px', borderRadius: 999, fontSize: 12, border: 'none',
              background: activeSlot === s ? '#d97757' : '#eee',
              color: activeSlot === s ? '#fff' : '#333',
              cursor: 'pointer', fontWeight: activeSlot === s ? 700 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {item && (
        <>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>{item.name}</div>

          {/* top 슬라이더 */}
          <label style={labelStyle}>
            top
            <span style={valStyle}>{fit.top ?? 0}</span>
          </label>
          <input type="range" min={0} max={520} value={fit.top ?? 0}
            onChange={(e) => update('top', e.target.value)} style={sliderStyle} />

          {/* width 슬라이더 */}
          <label style={labelStyle}>
            width
            <span style={valStyle}>{fit.width ?? 100}</span>
          </label>
          <input type="range" min={50} max={350} value={fit.width ?? 100}
            onChange={(e) => update('width', e.target.value)} style={sliderStyle} />

          {/* dx 슬라이더 — accessories(좌우 이동) / shoes(발 간격) */}
          {(activeSlot === 'accessories' || activeSlot === 'shoes') && (
            <>
              <label style={labelStyle}>
                {activeSlot === 'shoes' ? '발 간격' : 'dx (좌우)'}
                <span style={valStyle}>{fit.dx ?? (activeSlot === 'shoes' ? 38 : 0)}</span>
              </label>
              <input type="range"
                min={activeSlot === 'shoes' ? 10 : -80}
                max={activeSlot === 'shoes' ? 80 : 80}
                value={fit.dx ?? (activeSlot === 'shoes' ? 38 : 0)}
                onChange={(e) => update('dx', e.target.value)} style={sliderStyle} />
            </>
          )}

          {/* 숫자 직접 입력 */}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input type="number" value={fit.top ?? 0}
              onChange={(e) => update('top', e.target.value)}
              style={numInputStyle} placeholder="top" />
            <input type="number" value={fit.width ?? 100}
              onChange={(e) => update('width', e.target.value)}
              style={numInputStyle} placeholder="width" />
            {(activeSlot === 'accessories' || activeSlot === 'shoes') && (
              <input type="number" value={fit.dx ?? (activeSlot === 'shoes' ? 38 : 0)}
                onChange={(e) => update('dx', e.target.value)}
                style={numInputStyle} placeholder="dx" />
            )}
          </div>
        </>
      )}

      <button onClick={saveAll} style={{
        marginTop: 14, width: '100%', padding: '8px 0', borderRadius: 8,
        background: copied ? '#5b8a5f' : '#2a261f', color: '#fff',
        fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer',
      }}>
        {copied ? '✓ 저장됨!' : '💾 items.js에 저장'}
      </button>
    </div>
  );
}

const panelStyle = {
  position: 'fixed', top: 80, right: 20, width: 220,
  background: '#fff', border: '1.5px solid #ddd',
  borderRadius: 14, padding: '16px 18px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 9999,
};
const labelStyle = {
  display: 'flex', justifyContent: 'space-between',
  fontSize: 12, color: '#444', marginBottom: 4, fontWeight: 600,
};
const valStyle = {
  fontVariantNumeric: 'tabular-nums', color: '#d97757', fontWeight: 700,
};
const sliderStyle = { width: '100%', marginBottom: 12, accentColor: '#d97757' };
const numInputStyle = {
  flex: 1, padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd',
  fontSize: 12, textAlign: 'center',
};
