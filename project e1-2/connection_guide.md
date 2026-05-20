# 프론트엔드 ↔ 백엔드 연결 가이드

## 구조 요약

```
React (localhost:5173)  →  fetch()  →  C 서버 (localhost:8080)
```

두 서버를 동시에 띄워야 전체 기능 정상 작동.  
단, 이미지가 프론트에 있어서 **UI 개발은 C 서버 없이도 가능** (아래 참고).

---

## 공동 정의 필요 사항

### 1. API 스펙

| Method | Endpoint | 설명 | 응답 |
|--------|----------|------|------|
| `GET` | `/items` | 전체 아이템 목록 | 아이템 배열 |
| `GET` | `/items/:category` | 카테고리별 아이템 | 아이템 배열 |
| `GET` | `/outfit` | 현재 착용 상태 | outfit 객체 |
| `POST` | `/equip/:id` | 아이템 착용 | 착용 후 outfit 객체 |
| `POST` | `/unequip/:category` | 카테고리 아이템 해제 | 해제 후 outfit 객체 |
| `POST` | `/undo` | 이전 착용 상태로 복원 | 이전 outfit 객체 |
| `POST` | `/reset` | 전체 초기화 | 빈 outfit 객체 |

**GET /items 응답 형식:**
```json
[
  { "id": 1, "name": "흰 티셔츠", "category": "tops",    "filename": "tops/001.png" },
  { "id": 2, "name": "청바지",    "category": "bottoms", "filename": "bottoms/001.png" }
]
```

**GET /outfit 응답 형식:**
```json
{
  "tops":        { "id": 1, "name": "흰 티셔츠", "filename": "tops/001.png" },
  "bottoms":     { "id": 2, "name": "청바지",    "filename": "bottoms/001.png" },
  "shoes":       null,
  "accessories": null
}
```

---

### 2. 아이템 이미지 파일명 규칙

`items.json`의 `filename` 필드와 프론트 이미지 경로가 일치해야 함.

```
items.json  →  "filename": "tops/001.png"
프론트 파일  →  public/assets/items/tops/001.png
프론트 코드  →  <img src={`/assets/items/${item.filename}`} />
```

파일명 포맷: `카테고리/숫자3자리.png` 로 통일 (`tops/001.png`, `bottoms/003.png` 등)

---

### 3. CORS + 포트

프론트가 `localhost:5173`, C 서버가 `localhost:8080` — 브라우저가 다른 출처로 차단.  
**백엔드가** 모든 응답에 아래 헤더 추가 필수:

```c
MHD_add_response_header(response, "Access-Control-Allow-Origin",  "*");
MHD_add_response_header(response, "Access-Control-Allow-Methods", "GET, POST");
MHD_add_response_header(response, "Access-Control-Allow-Headers", "Content-Type");
```

> OPTIONS preflight 요청도 처리해야 POST가 정상 작동함

---

## 독립 개발 가능한 부분

| 백엔드 독자 개발 | 프론트 독자 개발 |
|----------------|----------------|
| 자료구조 구현 (HashMap, Stack 등) | UI 컴포넌트, 스타일 |
| items.json 파싱 로직 | 착용 상태 로직 (`useOutfit.js`) |
| Makefile | 아이템 이미지 에셋 준비 |

---

## 프론트가 C 서버 없이 개발 가능한 이유

음악 플레이어는 mp3 파일을 C 서버가 직접 서빙했기 때문에 백엔드 없이는 재생 자체가 불가능했음.  
옷입히기는 이미지 파일이 프론트 `public/`에 있으므로 **화면 구성과 착용 로직을 C 서버 없이 먼저 완성**할 수 있음.

```
음악 플레이어: mp3 → C 서버에 있음 → 백엔드 없으면 재생 불가
옷입히기:     이미지 → 프론트 public/에 있음 → 백엔드 없어도 화면 동작
```

백엔드 완성 전에는 `outfitApi.js` 대신 아이템 목록을 코드 안에 임시 배열로 정의하면 됨:

```js
// outfitApi.js — 백엔드 연결 전 임시 데이터
export const getItems = () => Promise.resolve([
  { id: 1, name: "흰 티셔츠", category: "tops",    filename: "tops/001.png" },
  { id: 2, name: "청바지",    category: "bottoms", filename: "bottoms/001.png" },
]);
```

백엔드 완성 후 `Promise.resolve(...)` 부분만 `fetch()`로 교체.

---

## C 백엔드가 실제로 담당하는 것

화면 렌더링은 React가 처리하므로, **C 백엔드의 핵심 역할은 자료구조 구현 시연**:

| 기능 | 자료구조 | 시연 포인트 |
|------|---------|-----------|
| 아이템 O(1) 조회 | HashMap | `equip/:id` 호출 시 |
| Undo/Redo | Stack | `undo` 호출 시 스택 pop |
| 착용 레이어 순서 유지 | Linked List | outfit 응답의 순서 |
| 최근 착용 히스토리 | Queue | 히스토리 기능 (확장) |

---

## 서버 실행 방법

```bash
# 백엔드
cd backend && make && ./server

# 프론트엔드
cd frontend && npm run dev
```

---

## 개발 순서 권장

1. API 스펙 + 파일명 규칙 합의 (지금 이 단계)
2. 프론트: 임시 데이터로 UI 완성
3. 백엔드: 자료구조 + HTTP 서버 구현
4. 프론트 `outfitApi.js`에서 임시 데이터 → 실제 `fetch()` 교체
5. 통합 테스트
