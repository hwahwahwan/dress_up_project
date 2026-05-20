# 옷입히기 시뮬레이터 — 프로젝트 개요

## 기본 정보

| 항목 | 내용 |
|------|------|
| 과목 | 자료구조 1분반 |
| 주제 | 옷입히기 시뮬레이터 |
| 팀 구성 | 2명 |
| 언어 | C (백엔드) + React (프론트엔드) |

---

## 기술 스택

| 파트 | 기술 | 역할 |
|------|------|------|
| 백엔드 | C + libmicrohttpd | 자료구조 구현 + HTTP API 서버 |
| 프론트엔드 | React | UI + 이미지 레이어 합성으로 캐릭터 표시 |
| 연결 방식 | HTTP (fetch) | React → C 서버 API 호출 |

> 이미지 파일은 프론트 `public/`에 있음 — C 서버는 아이템 정보와 착용 상태만 관리

---

## 구현 기능

### 필수 기능
- 캐릭터 표시 (베이스 이미지 + 착용 아이템 레이어 합성)
- 카테고리별 아이템 목록 표시 (상의 / 하의 / 신발 / 악세서리)
- 아이템 클릭 → 착용 / 재클릭 → 해제

### 확장 기능
- Undo — 이전 착용 상태로 되돌리기 (Stack 활용)
- 전체 초기화
- 최근 착용 히스토리 (Queue 활용)

---

## 자료구조 구성

| 자료구조 | 구현 방식 | 용도 | 단계 |
|---------|---------|------|------|
| HashMap | 배열 + 체이닝 | 아이템 ID → 데이터, O(1) 조회 | 필수 |
| Stack | 연결 리스트 기반 | Undo/Redo 착용 이력 관리 | 확장 |
| Linked List | 단방향 연결 리스트 | 착용 레이어 순서 유지 (렌더링 순서) | 필수 |
| Queue | 연결 리스트 기반 | 최근 착용 히스토리 | 확장 |

### 자료구조 연동 방식

```
[HashMap]   아이템 ID → 아이템 데이터     (클릭 시 O(1) 조회)
     ↓
[Linked List]  바디 → 상의 → 하의 → 신발 → 악세서리
                              (레이어 순서대로 렌더링)

[Stack]     착용 변경 이력 push/pop      (Undo 기능)
            [ outfit3 ]  ← top
            [ outfit2 ]
            [ outfit1 ]

[Queue]     최근 착용 히스토리 (최근 N개 유지)
```

### 시간복잡도

| 연산 | 복잡도 |
|------|--------|
| 아이템 ID로 조회 | O(1) |
| 착용 / 해제 | O(1) |
| Undo | O(1) |
| 레이어 순서 렌더링 | O(n) — 레이어 수 |

---

## API 엔드포인트

| Method | Endpoint | 설명 | 자료구조 |
|--------|----------|------|---------|
| GET | /items | 전체 아이템 목록 | HashMap |
| GET | /items/:category | 카테고리별 아이템 | HashMap |
| GET | /outfit | 현재 착용 상태 | Linked List |
| POST | /equip/:id | 아이템 착용 | HashMap + Stack |
| POST | /unequip/:category | 카테고리 해제 | Stack |
| POST | /undo | 이전 착용 상태 복원 | Stack |
| POST | /reset | 전체 초기화 | Stack |

---

## 프론트엔드 코드 구조

레이어별(Layered) 구조 — 역할 단위로 폴더 분리

```
src/
├── components/   CharacterView.jsx, ItemGrid.jsx, Controls.jsx   ← UI만 담당
├── hooks/        useOutfit.js                                     ← 착용 상태/로직 분리
└── api/          outfitApi.js                                     ← 서버 호출만 담당
```

- `hooks/useOutfit.js` 에 착용 상태(`equipped`), equip/unequip/undo 로직 모음
- `App.jsx` 에서 훅 호출 후 props로 컴포넌트에 전달
- 컴포넌트는 props 받아서 렌더링만 → UI 코드가 단순해짐

> 백엔드(C)는 기능별(Feature-based) 구조 — `hashmap.c`, `stack.c`, `linked_list.c` 자료구조 단위로 분리

---

## 이미지 레이어 합성 방식

캐릭터 위에 아이템 이미지를 CSS `position: absolute`로 겹쳐서 표시:

```
┌────────────────────┐
│  base.png (캐릭터) │  ← position: relative 컨테이너
│  tops/001.png      │  ← position: absolute, top: 0, left: 0
│  bottoms/003.png   │  ← position: absolute, top: 0, left: 0
│  shoes/002.png     │  ← position: absolute, top: 0, left: 0
└────────────────────┘
```

### 이미지 규격

| 항목 | 규격 |
|------|------|
| 캔버스 크기 | 모든 이미지 동일한 크기 (예: 400 x 600px) |
| 포맷 | PNG (투명 배경 필수) |
| 저장 위치 | `frontend/public/assets/items/카테고리/` |

> 이미지 크기가 달라도 CSS `width: 400px; height: 600px; object-fit: contain` 으로 강제 적용 가능

### items.json 형식

```json
[
  {
    "id": 1,
    "name": "흰 티셔츠",
    "category": "tops",
    "filename": "tops/001.png"
  },
  {
    "id": 2,
    "name": "청바지",
    "category": "bottoms",
    "filename": "bottoms/001.png"
  }
]
```

---

## 팀 역할 분담

| 역할 | 담당 업무 |
|------|---------|
| 백엔드 | C 자료구조 구현 (HashMap, Stack, Linked List, Queue) + libmicrohttpd HTTP 서버 + CORS 처리 |
| 프론트엔드 | React UI + 이미지 레이어 합성 + hooks 상태 관리 + GitHub / 문서 관리 |

---

## 파일 관리

| 파일 종류 | 저장 위치 | 서빙 방식 |
|---------|---------|---------|
| 아이템 메타데이터 (.json) | `backend/data/items.json` | C 서버 `GET /items` |
| 캐릭터 / 아이템 이미지 (.png) | `frontend/public/assets/` | React 정적 파일 |

- 이미지: 프론트에서 직접 관리 (UI 자산, C 서버 불필요)
- `items.json`의 `filename` 필드 → React가 `/assets/items/${filename}` 경로로 참조

---

## 평가 항목 대응

| 평가 항목 | 대응 |
|---------|------|
| 자료구조 구현 및 알고리즘 정확성 | HashMap, Stack, Linked List, Queue 직접 구현 |
| 기능 완성도 | 착용/해제/Undo/카테고리 필터/초기화 |
| 코드 수준 | 모듈별 파일 분리, 헤더 파일 관리 |
| 팀 협업 | GitHub branch → PR → merge 흐름 |
| 창의성 | C+React 연동, 이미지 레이어 합성, Undo 기능 |
| 발표 및 시연 | 실제 동작하는 옷입히기 시뮬레이터 시연 |
