// =============================================================================
// CharacterView — 캐릭터 베이스 + 착용 아이템 레이어 합성
// =============================================================================
// 단일 캔버스 (CSS 400×600 기준) 위에 베이스 이미지와 각 슬롯의 옷 이미지를
// position:absolute 로 겹쳐 그린다. 각 아이템의 fit 데이터(top, width)는
// items.js 의 fit 필드를 그대로 사용.
//
// 렌더 순서 = LAYER_ORDER (overview.md 의 Linked List 순서)
//   base → 상의 → 하의 → 신발 → 모자(악세서리)
// 이 순서로 그리면 모자/신발이 가장 위에 올라가 시각적으로 자연스럽다.
// =============================================================================

// shoes → bottoms → tops → accessories 순서로 레이어
// (shoes 먼저 깔고, bottoms가 신발 윗부분 덮고, tops가 바지 허리 위로 덮임)
import { LAYER_ORDER, resolveFit } from '../data/items.js';
import { getCharacterImageUrl, getItemImageUrl } from '../api/outfitApi.js';

const CANVAS_W = 400;
const CANVAS_H = 520;

function makeLayerStyle(f, dxOverride, zIndex) {
  return {
    top:       f.top   != null ? `${f.top}px`   : '50%',
    width:     f.width != null ? `${f.width}px` : '40%',
    left:      `calc(50% + ${dxOverride}px)`,
    transform: 'translateX(-50%)',
    zIndex,
  };
}

export default function CharacterView({ equipped, fitOverrides = {} }) {
  return (
    <div
      className="char-canvas"
      style={{ width: CANVAS_W, height: CANVAS_H }}
    >
      {/* 베이스 캐릭터 */}
      <img
        src={getCharacterImageUrl()}
        alt="character"
        className="char-base"
        draggable={false}
      />

      {/* 착용 옷 레이어 */}
      {LAYER_ORDER.map((slot, i) => {
        const item = equipped[slot];
        if (!item) return null;
        const f = resolveFit(item, fitOverrides);
        const z = 10 + i;

        // 좌우 분리 신발
        if (item.filename_r) {
          const dx = f.dx ?? 38;
          return [
            <img key={`${slot}-L`} src={getItemImageUrl(item.filename)}   alt={`${item.name} L`}
              className="char-layer" draggable={false} style={makeLayerStyle(f, -dx, z)} />,
            <img key={`${slot}-R`} src={getItemImageUrl(item.filename_r)} alt={`${item.name} R`}
              className="char-layer" draggable={false} style={makeLayerStyle(f, dx, z)} />,
          ];
        }

        return (
          <img key={slot} src={getItemImageUrl(item.filename)} alt={item.name}
            className="char-layer" draggable={false}
            style={makeLayerStyle(f, f.dx || 0, z)} />
        );
      })}
    </div>
  );
}

