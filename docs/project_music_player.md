---
name: 자료구조 기말 프로젝트 - 음악 플레이어 시뮬레이터
description: 자료구조 기말 팀 프로젝트 상세 내용 및 결정사항
type: project
originSessionId: 3dbc64fc-5ae0-41f1-a92c-822275513196
---
## 프로젝트 개요
- 주제: 음악 플레이어 시뮬레이터
- 팀 구성: 2명 (정용환 포함)
- 제출 과목: 자료구조 1분반

## 기술 스택 (교수님 허락 완료)
- **Backend**: C언어 — Stack, Queue, Deque 자료구조 구현 + libmicrohttpd로 HTTP API 서버
- **Frontend**: React — 이쁜 UI, fetch()로 C 서버 API 호출
- 음악 재생: React `<audio>` 태그로 처리 (C에서는 곡 정보만 관리)

## 자료구조 역할 분담
| 기능 | 자료구조 |
|------|---------|
| 재생목록 (순서대로 재생) | 큐 (Queue) |
| 이전/다음 곡 이동 | 덱 (Deque) |
| 최근 재생 기록 | 스택 (Stack) |
| 셔플 후 되돌리기 | 스택 (Stack) |

## C API 엔드포인트 (예정)
- `GET /playlist` — 재생목록 조회
- `POST /next` — 다음 곡
- `POST /prev` — 이전 곡
- `GET /history` — 재생 기록

## 팀 역할 분담
- 1명: Backend — C 자료구조 구현 + libmicrohttpd HTTP 서버
- 1명: Frontend — React UI + GitHub/README 문서 관리

## 교수님 제공 파일 구조 (가이드북 기준)
- 권장 폴더: src/, include/, docs/, data/
- GitHub 협업: branch → PR → merge 흐름

**Why:** 교수님이 C로 명시했으나 프론트엔드에 한해 다른 언어 허락하심 (2026-05-11)
**How to apply:** C 백엔드 구현 질문은 libmicrohttpd + 자료구조 중심으로, UI는 React 기준으로 답변
