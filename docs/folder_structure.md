# 프로젝트 폴더 구조

```
music-player/
├── backend/                  # C 백엔드 (자료구조 + HTTP 서버)
│   ├── src/
│   │   ├── main.c            # 진입점, 서버 실행
│   │   ├── deque.c           # 이전/다음 곡 덱 구현 (핵심)
│   │   ├── queue.c           # 재생목록 큐 구현 (확장용)
│   │   ├── playlist.c        # 재생목록 관련 API 로직
│   │   └── server.c          # libmicrohttpd HTTP 서버 설정
│   ├── include/
│   │   ├── deque.h
│   │   ├── queue.h
│   │   ├── playlist.h
│   │   └── server.h
│   ├── data/
│   │   ├── songs.json        # 곡 메타데이터 (제목, 아티스트, 파일명)
│   │   ├── 01_song.mp3       # 실제 음악 파일 1
│   │   ├── 02_song.mp3       # 실제 음악 파일 2
│   │   ├── 03_song.mp3       # 실제 음악 파일 3
│   │   ├── 04_song.mp3       # 실제 음악 파일 4
│   │   └── 05_song.mp3       # 실제 음악 파일 5
│   └── Makefile
│
├── frontend/                 # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Player.jsx    # 재생 컨트롤 (재생/정지/이전/다음)
│   │   │   └── Playlist.jsx  # 재생목록 표시 (확장용)
│   │   └── api/
│   │       └── musicApi.js   # C 서버 fetch() 호출 함수 모음
│   └── package.json
│
├── docs/                     # 문서
│   ├── folder_structure.md   # 이 파일
│   └── 자료구조기말_프로젝트/  # 교수님 제공 가이드
│
└── README.md
```

## API 엔드포인트 (C 서버 기준)

| Method | Endpoint     | 설명            | 자료구조 |
|--------|--------------|-----------------|---------|
| GET    | /current          | 현재 곡 정보 조회  | Deque   |
| POST   | /next             | 다음 곡으로 이동   | Deque   |
| POST   | /prev             | 이전 곡으로 이동   | Deque   |
| GET    | /playlist         | 재생목록 조회      | Queue (확장) |
| GET    | /data/{파일명}     | 음악 파일 서빙     | -       |

## 자료구조 역할

| 자료구조 | 용도 | 단계 |
|---------|------|------|
| Deque   | 이전/다음 곡 양방향 이동 | 필수 |
| Queue   | 재생목록 순서 관리        | 확장 |
