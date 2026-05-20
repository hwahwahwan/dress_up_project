// =============================================================================
// items.js — 백엔드 items.json 과 동일한 형식의 아이템 카탈로그
// =============================================================================
// 백엔드(C 서버)가 GET /items 로 반환할 데이터.
// 백엔드 연결 전에는 outfitApi.js 에서 이 배열을 그대로 mock 응답으로 사용.
//
// fit 필드 = 프론트 전용. 캐릭터 캔버스(400×600) 위에서 이 아이템이 그려질
// 위치/크기. 백엔드는 이 필드 무시 — 캐릭터 안에 옷을 위치시키는 건
// 순전히 UI 레이어 책임.
//
//   fit.top   : 캔버스 px (상단 기준)
//   fit.width : 캔버스 px (이미지 가로폭, 높이는 비율 유지하여 자동)
//   fit.dx    : 좌우 미세 보정(px). 기본값 0 — 가로 정렬은 캔버스 가운데.
// =============================================================================

export const ITEMS = [
  // ─── TOPS (상의) ─── 어깨(180) 기준, 이미지 자연 비율
  { id: 1, name: '흰 티셔츠',     category: 'tops', filename: 'tops/001.png',
    fit: { top: 115, width: 140 } },
  { id: 2, name: '네이비 후드',   category: 'tops', filename: 'tops/002.png',
    fit: { top: 103, width: 149 } },
  { id: 3, name: '체크 셔츠',     category: 'tops', filename: 'tops/003.png',
    fit: { top: 107, width: 168 } },
  { id: 4, name: '회색 스웻셔츠', category: 'tops', filename: 'tops/004.png',
    fit: { top: 108, width: 148 } },
  { id: 5, name: '가죽 자켓',     category: 'tops', filename: 'tops/005.png',
    fit: { top: 105, width: 149 } },

  // ─── BOTTOMS (하의) ─── 허리(295) 기준, canvas overflow:hidden 으로 하단 클리핑
  { id: 6,  name: '청바지',           category: 'bottoms', filename: 'bottoms/001.png',
    fit: { top: 239, width: 91 } },
  { id: 7,  name: '검정 슬랙스',      category: 'bottoms', filename: 'bottoms/002.png',
    fit: { top: 247, width: 102 } },
  { id: 8,  name: '카키 카고 반바지', category: 'bottoms', filename: 'bottoms/003.png',
    fit: { top: 253, width: 128 } },
  { id: 9,  name: '올리브 슬랙스',    category: 'bottoms', filename: 'bottoms/004.png',
    fit: { top: 242, width: 95 } },
  { id: 10, name: '회색 조거팬츠',    category: 'bottoms', filename: 'bottoms/005.png',
    fit: { top: 239, width: 114 } },

  // ─── SHOES (신발) ─── 좌우 분리 이미지. dx = 각 발이 중앙에서 떨어진 거리(px)
  { id: 11, name: '브라운 부츠',  category: 'shoes', filename: 'shoes/1_left.png', filename_r: 'shoes/1_right.png',
    fit: { top: 429, width: 40, dx: 34 } },
  { id: 12, name: '로퍼',         category: 'shoes', filename: 'shoes/2_left.png', filename_r: 'shoes/2_right.png',
    fit: { top: 440, width: 40, dx: 34 } },
  { id: 13, name: '러닝화',       category: 'shoes', filename: 'shoes/3_left.png', filename_r: 'shoes/3_right.png',
    fit: { top: 438, width: 40, dx: 33 } },
  { id: 14, name: '흰 스니커즈',  category: 'shoes', filename: 'shoes/4_left.png', filename_r: 'shoes/4_right.png',
    fit: { top: 443, width: 40, dx: 35 } },
  { id: 15, name: '슬리퍼',       category: 'shoes', filename: 'shoes/5_left.png', filename_r: 'shoes/5_right.png',
    fit: { top: 439, width: 45, dx: 34 } },

  // ─── ACCESSORIES (모자) ─── 머리 상단(39) 기준
  { id: 16, name: '빨강 캡',     category: 'accessories', filename: 'accessories/001.png',
    fit: { top: 36, width: 68, dx: -9 } },
  { id: 17, name: '회색 비니',   category: 'accessories', filename: 'accessories/002.png',
    fit: { top: 27, width: 60 } },
  { id: 18, name: '검정 페도라', category: 'accessories', filename: 'accessories/003.png',
    fit: { top: 33, width: 72 } },
  { id: 19, name: '버킷햇',      category: 'accessories', filename: 'accessories/004.png',
    fit: { top: 33, width: 75, dx: -3 } },
  { id: 20, name: '뉴스보이 캡', category: 'accessories', filename: 'accessories/005.png',
    fit: { top: 37, width: 70 } },
];

// 슬롯 이름 목록 — 여러 파일에서 공유하는 단일 출처
export const SLOTS = ['tops', 'bottoms', 'shoes', 'accessories'];

// UI 에서 쓰는 카테고리 메타 (탭 표시명 + 순서)
export const CATEGORIES = [
  { id: 'tops',        label: '상의' },
  { id: 'bottoms',     label: '하의' },
  { id: 'shoes',       label: '신발' },
  { id: 'accessories', label: '모자' },
];

// 레이어 z-order: 신발 먼저 → 하의(신발 윗부분 덮음) → 상의(바지 허리 덮음) → 모자
export const LAYER_ORDER = ['shoes', 'bottoms', 'tops', 'accessories'];

// id → item 룩업 (HashMap 의 프론트 대응; O(1) 조회)
export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

// 아이템의 fit 값 결정 (override → item.fit → 빈 객체 순서)
export function resolveFit(item, overrides = {}) {
  return overrides[item.id] || item.fit || {};
}
