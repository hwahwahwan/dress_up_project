# Dress Up — Frontend (React + Vite)

자료구조 기말 프로젝트 — 옷입히기 시뮬레이터의 프론트엔드.
C 백엔드와 HTTP 로 통신하는 React 앱.

## 폴더 구조

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example          ← .env 로 복사해서 사용
└── src/
    ├── main.jsx          ← React 진입점
    ├── App.jsx           ← 루트 (useOutfit 훅 보유, props 로 전달)
    ├── index.css         ← 전역 스타일
    ├── data/
    │   └── items.js      ← 아이템 카탈로그 + fit (캐릭터 위 좌표/크기)
    ├── api/
    │   └── outfitApi.js  ← C 서버 fetch 호출 (유일한 fetch 위치)
    ├── hooks/
    │   └── useOutfit.js  ← 착용 상태 + Stack 기반 undo
    └── components/
        ├── CharacterView.jsx  ← 캐릭터 + 옷 레이어 합성 (position:absolute)
        ├── CategoryTabs.jsx   ← 카테고리 탭 (상의/하의/신발/모자)
        ├── ItemGrid.jsx       ← 아이템 그리드
        ├── ItemCard.jsx       ← 그리드 한 칸 (썸네일 + 이름)
        └── Controls.jsx       ← Undo / Reset 버튼

public/
└── assets/
    ├── character/base.png
    └── items/
        ├── tops/         001.png ~ 005.png
        ├── bottoms/      001.png ~ 005.png
        ├── shoes/        001.png ~ 005.png
        └── accessories/  001.png ~ 005.png
```

## 시작

```bash
cd frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

## 환경변수 (`frontend/.env`)

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true       # 백엔드 없을 때만, 백엔드 띄우면 false
```

- `VITE_USE_MOCK=true` → `src/data/items.js` 의 mock 카탈로그로 동작 (서버 없이 UI 검증 가능)
- `VITE_USE_MOCK=false` → 모든 API 호출이 C 서버로 향함

## 아이템 좌표 튜닝

각 옷 이미지는 비율이 제각각이라 캐릭터 위에 얹을 때 위치/크기를 일일이 맞춰야 한다.
값은 `src/data/items.js` 의 `fit: { top, width, dx }` 필드:

- `top`   — 캔버스 상단부터 px (0 = 캔버스 맨 위)
- `width` — 이미지 가로폭 px (높이는 비율 유지하여 자동)
- `dx`    — 좌우 미세 보정 px (생략 시 0, 가로 중앙 정렬)

## 자료구조 매핑 (overview.md 와 일치)

| 자료구조        | 프론트 대응 위치 |
|-----------------|------------------|
| **HashMap**     | `data/items.js` 의 `ITEMS_BY_ID` (id → item 객체 O(1) 조회) |
| **Stack**       | `hooks/useOutfit.js` 의 `history` 배열 (push/pop) |
| **Linked List** | `data/items.js` 의 `LAYER_ORDER` (렌더 z-순서) |
| **Queue**       | (확장 — 최근 착용 히스토리 표시 시 추가) |

## API 매핑 (connection_guide.md)

| Method | Endpoint | 프론트 함수 |
|--------|----------|-------------|
| GET    | `/items`             | `getItems()` |
| GET    | `/items/:category`   | `getItemsByCategory(cat)` |
| GET    | `/outfit`            | `getOutfit()` |
| POST   | `/equip/:id`         | `equipItem(id)` |
| POST   | `/unequip/:category` | `unequipCategory(cat)` |
| POST   | `/undo`              | `undoOutfit()` |
| POST   | `/reset`             | `resetOutfit()` |

이미지 파일은 프론트의 `public/assets/` 에서 직접 서빙되므로 C 서버를 거치지 않음.

## 백엔드 연동 체크리스트 (백엔드 담당자)

- [ ] `items.json` 의 `filename` 필드와 `public/assets/items/` 의 실제 파일명 일치
- [ ] 모든 응답에 CORS 헤더 (`Access-Control-Allow-Origin: *`)
- [ ] OPTIONS preflight 처리 (POST 요청용)
- [ ] `/equip/:id` 시 Stack 에 이전 outfit push, HashMap 으로 id 조회
- [ ] `/undo` 시 Stack pop → 이전 outfit 반환
