# 👕 옷장 — Dress Up Simulator

> 자료구조(HashMap · Stack · Linked List · Queue)를 C로 직접 구현하고, React 프론트엔드와 HTTP API로 연동한 웹 기반 옷입히기 시뮬레이터입니다.

<br>

## 미리보기

| 아이템 선택 | 코디 완성 |
|:---:|:---:|
| <img width="600" alt="아이템 선택" src="https://github.com/user-attachments/assets/52cb8776-10d0-4ab0-bb42-f7e0e75e3279" /> | <img width="600" alt="코디 완성" src="https://github.com/user-attachments/assets/39015939-941e-49ad-9dfe-d0cfdfaaff60" /> |

<br>

## 팀원 구성

<div align="center">

| **정용환** | **김민수** |
|:---:|:---:|
| [<img src="https://github.com/hwahwahwan.png" width=100>](https://github.com/hwahwahwan) <br> [@hwahwahwan](https://github.com/hwahwahwan) | [<img src="https://github.com/rinio118.png" width=100>](https://github.com/rinio118) <br> [@rinio118](https://github.com/rinio118) |

</div>

<br>

## 개발 환경

- **Backend** : C, libmicrohttpd
- **Frontend** : React 18, Vite
- **버전 및 이슈 관리** : GitHub, GitHub Pull Request
- **협업 방식** : Feature Branch → PR → Merge

<br>

## 채택한 기술

### C + libmicrohttpd
- HashMap, Stack, Linked List, Queue를 직접 구현해 자료구조의 실제 활용을 시연
- libmicrohttpd로 경량 HTTP 서버를 구성해 React와 REST API로 연동

### React + Vite
- 컴포넌트 단위로 분리해 캐릭터 이미지 레이어 합성 UI를 선언적으로 구성
- 이미지 에셋을 프론트에서 직접 서빙해 C 서버 의존도를 최소화 — 백엔드 없이도 UI 개발 가능

<br>

## 프로젝트 구조

```
dress_up_project/
├── backend/
│   ├── src/
│   │   ├── main.c            # 서버 진입점
│   │   ├── server.c          # HTTP 라우팅 + CORS
│   │   ├── outfit.c          # 착용 상태 관리
│   │   ├── hashmap.c         # 자료구조 — HashMap
│   │   ├── stack.c           # 자료구조 — Stack
│   │   ├── linked_list.c     # 자료구조 — Linked List
│   │   └── queue.c           # 자료구조 — Queue
│   ├── include/
│   ├── data/items.json
│   └── Makefile
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api/outfitApi.js   # C 서버 fetch 호출
    │   ├── hooks/useOutfit.js # 착용 상태 + undo 로직
    │   ├── components/        # CharacterView, ItemGrid 등
    │   └── data/items.js      # 아이템 카탈로그 + fit 좌표
    └── public/assets/         # 캐릭터 + 아이템 이미지
```

<br>

## 역할 분담

### 👤 정용환
- React 프론트엔드 전체 구현 (컴포넌트, hooks, API 연결)
- CSS `position: absolute` 이미지 레이어 합성
- GitHub 관리 및 문서 작성

### 👤 김민수
- C 자료구조 구현 (HashMap, Stack, Linked List, Queue)
- libmicrohttpd HTTP 서버 및 API 엔드포인트 구현
- CORS 처리

<br>

## 개발 기간

- **전체** : 2026.05
- 1주차 : 설계, API 스펙 합의, 개발 환경 세팅
- 2주차 : C 자료구조 구현 / React UI 기본 구성
- 3주차 : C HTTP 서버 구현 / React hooks · API 연결
- 4주차 : 프론트-백엔드 통합 테스트 및 버그 수정

<br>

## 주요 기능

### 아이템 착용 / 해제
- 카테고리 탭(상의 · 하의 · 신발 · 모자)에서 아이템 클릭 → 캐릭터에 착용
- 같은 아이템 재클릭 시 해제
- C 백엔드의 **HashMap**으로 O(1) 조회, **Linked List**로 레이어 순서 유지

### Undo (되돌리기)
- 상단 되돌리기 버튼으로 이전 착용 상태 복원
- C 백엔드의 **Stack** 활용 (착용 변경 시 push, Undo 시 pop)

### 전체 초기화
- 초기화 버튼으로 모든 착용 아이템 한 번에 해제

<br>

## 시작하기

### 백엔드

```bash
# macOS
brew install libmicrohttpd

cd backend
make
./server        # http://localhost:8080
```

### 프론트엔드

```bash
cd frontend
npm install
cp .env.example .env
# .env: VITE_API_BASE_URL=http://localhost:8080
npm run dev     # http://localhost:5173
```

> C 서버 없이 UI만 확인하려면 `.env`에서 `VITE_USE_MOCK=true` 설정
