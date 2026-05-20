// Controls — Undo / Reset 버튼
// equippedCount 는 헤더 우측에 같이 보여주기 위해 prop 으로 받음
export default function Controls({ onUndo, onReset, canUndo, equippedCount = 0 }) {
  return (
    <div className="controls">
      <span className="controls__count">
        착용 <strong>{equippedCount}</strong>
      </span>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className="btn btn--ghost"
        title="이전 상태로 되돌리기 (Stack pop)"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path
            d="M3 8.5 L6 5.5 M3 8.5 L6 11.5 M3 8.5 L11 8.5 Q13.5 8.5 13.5 6 Q13.5 3.5 11 3.5"
            fill="none" stroke="currentColor" strokeWidth="1.4"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        되돌리기
      </button>
      <button
        type="button"
        onClick={onReset}
        className="btn btn--ghost"
        title="전부 해제"
      >
        전체 초기화
      </button>
    </div>
  );
}
