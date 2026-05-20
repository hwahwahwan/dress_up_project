// ItemGrid — 카테고리로 필터링된 아이템들을 그리드로 표시
import ItemCard from './ItemCard.jsx';

export default function ItemGrid({ items, equipped, onSelect }) {
  if (!items.length) {
    return <div className="grid-empty">아이템이 없습니다.</div>;
  }
  return (
    <div className="grid">
      {items.map((item) => {
        const eq = equipped[item.category];
        return (
          <ItemCard
            key={item.id}
            item={item}
            isEquipped={eq?.id === item.id}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
