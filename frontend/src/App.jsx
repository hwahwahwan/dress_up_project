// =============================================================================
// App — 루트 컴포넌트
// =============================================================================
// useOutfit 훅 하나로 상태를 관리하고, 자식 컴포넌트에 props 로 내려준다.
// (Context 없이 단순한 props drilling — overview.md 권장)
// =============================================================================

import { useEffect, useMemo, useState } from 'react';
import useOutfit from './hooks/useOutfit.js';
import { getItems, USE_MOCK } from './api/outfitApi.js';
import { CATEGORIES } from './data/items.js';
import CharacterView from './components/CharacterView.jsx';
import CategoryTabs from './components/CategoryTabs.jsx';
import ItemGrid from './components/ItemGrid.jsx';
import Controls from './components/Controls.jsx';
import FitEditor from './components/FitEditor.jsx';

const EDIT_MODE = new URLSearchParams(window.location.search).has('edit');

export default function App() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeCat, setActive]  = useState('tops');
  const [fitOverrides, setFitOverrides] = useState({});
  const outfit = useOutfit();

  function handleFitChange(itemId, newFit) {
    setFitOverrides((prev) => ({ ...prev, [itemId]: newFit }));
  }

  useEffect(() => {
    let alive = true;
    getItems()
      .then((list) => { if (alive) { setItems(list); setLoading(false); } })
      .catch((e) => { console.error('[App] getItems:', e); setLoading(false); });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => i.category === activeCat),
    [items, activeCat]
  );

  // 카테고리별 착용 여부 (탭 우측 도트 표시용)
  const slotFilled = useMemo(() => ({
    tops:        !!outfit.equipped.tops,
    bottoms:     !!outfit.equipped.bottoms,
    shoes:       !!outfit.equipped.shoes,
    accessories: !!outfit.equipped.accessories,
  }), [outfit.equipped]);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__logo" aria-hidden="true">👕</span>
          <h1 className="app__title">옷장</h1>
          <span className="app__sub">— Dress Up Simulator</span>
        </div>
        <Controls
          onUndo={outfit.undo}
          onReset={outfit.reset}
          canUndo={outfit.canUndo}
          equippedCount={outfit.equippedCount}
        />
      </header>

      <main className="app__main">
        {/* 캐릭터 카드 */}
        <section className="card card--char">
          <div className="card__label">미리보기</div>
          <CharacterView equipped={outfit.equipped} fitOverrides={fitOverrides} />
        </section>

        {/* 옷장 카드 */}
        <section className="card card--wardrobe">
          <div className="card__head">
            <div className="card__label">옷장</div>
            <span className="card__hint">아이템을 눌러 입혀보세요</span>
          </div>
          <CategoryTabs
            active={activeCat}
            onChange={setActive}
            categories={CATEGORIES}
            counts={slotFilled}
          />
          {loading ? (
            <div className="grid-empty">로딩 중…</div>
          ) : (
            <ItemGrid
              items={filtered}
              equipped={outfit.equipped}
              onSelect={outfit.toggleItem}
            />
          )}
        </section>
      </main>

      {EDIT_MODE && (
        <FitEditor
          equipped={outfit.equipped}
          fitOverrides={fitOverrides}
          onFitChange={handleFitChange}
        />
      )}

      <footer className="app__footer">
        {USE_MOCK
          ? '백엔드 미연결 — mock 데이터로 동작 중 (.env 의 VITE_USE_MOCK=false 로 전환)'
          : '백엔드 연결됨'}
      </footer>
    </div>
  );
}
