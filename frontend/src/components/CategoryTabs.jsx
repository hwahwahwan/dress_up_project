// CategoryTabs — 아이템 카테고리 탭 (상의/하의/신발/모자)
export default function CategoryTabs({ active, onChange, categories, counts }) {
  return (
    <div className="tabs" role="tablist">
      {categories.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.id)}
            className={`tab ${isActive ? 'tab--active' : ''}`}
          >
            <span className="tab__label">{c.label}</span>
            {counts && !!counts[c.id] && (
              <span className="tab__dot" aria-label="착용 중" />
            )}
          </button>
        );
      })}
    </div>
  );
}
