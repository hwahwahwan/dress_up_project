// ItemCard — 옷장의 아이템 한 칸
//   - 썸네일 + 이름
//   - 착용 중이면 체크 표시 + 강조 보더
//   - 클릭 시 onSelect(item) → useOutfit.toggleItem 으로 라우팅

import { getItemImageUrl } from '../api/outfitApi.js';

export default function ItemCard({ item, isEquipped, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className={`item-card ${isEquipped ? 'item-card--on' : ''}`}
      aria-pressed={isEquipped}
      title={isEquipped ? `해제하기 — ${item.name}` : `착용하기 — ${item.name}`}
    >
      <div className="item-card__thumb">
        <img
          src={getItemImageUrl(item.filename)}
          alt={item.name}
          draggable={false}
        />
        {isEquipped && (
          <span className="item-card__check" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path
                d="M3.5 8.5 L6.5 11.5 L12.5 5"
                fill="none" stroke="currentColor" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <span className="item-card__name">{item.name}</span>
    </button>
  );
}
