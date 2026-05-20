// =============================================================================
// outfitApi.js — C 백엔드와의 통신 레이어 (프론트 측 유일한 fetch 위치)
// =============================================================================
// 모든 컴포넌트/훅은 fetch 를 직접 호출하지 말고 여기 함수만 import 한다.
//
// 응답 형식은 docs/connection_guide.md 와 동일:
//   GET  /items           → [ { id, name, category, filename }, ... ]
//   GET  /items/:category → 위와 동일하지만 필터링됨
//   GET  /outfit          → { tops, bottoms, shoes, accessories } (각 슬롯 item or null)
//   POST /equip/:id       → 변경된 outfit 객체
//   POST /unequip/:cat    → 변경된 outfit 객체
//   POST /undo            → 이전 outfit 객체
//   POST /reset           → 빈 outfit 객체
//
// .env 설정 (frontend/.env):
//   VITE_API_BASE_URL=http://localhost:8080
//   VITE_USE_MOCK=true        # 백엔드 없을 때만, 백엔드 띄우면 false
// =============================================================================

import { ITEMS, ITEMS_BY_ID, SLOTS } from '../data/items.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// ─── public API ─────────────────────────────────────────────────────────────

// GET /items — 전체 아이템 목록
export async function getItems() {
  if (USE_MOCK) return ITEMS;
  const r = await fetch(`${BASE_URL}/items`);
  return r.json();
}

// GET /items/:category — 카테고리별 필터링
export async function getItemsByCategory(category) {
  if (USE_MOCK) return ITEMS.filter((i) => i.category === category);
  const r = await fetch(`${BASE_URL}/items/${category}`);
  return r.json();
}

// GET /outfit — 현재 착용 상태 조회 (mount 시 동기화용)
export async function getOutfit() {
  if (USE_MOCK) return Object.fromEntries(SLOTS.map((s) => [s, null]));
  const r = await fetch(`${BASE_URL}/outfit`);
  return r.json();
}

// POST /equip/:id — 아이템 착용 (HashMap O(1) lookup + Stack push)
export async function equipItem(id) {
  if (USE_MOCK) return ITEMS_BY_ID[id] || null;
  const r = await fetch(`${BASE_URL}/equip/${id}`, { method: 'POST' });
  return r.json();
}

// POST /unequip/:category — 카테고리 해제 (Stack push)
export async function unequipCategory(category) {
  if (USE_MOCK) return null;
  const r = await fetch(`${BASE_URL}/unequip/${category}`, { method: 'POST' });
  return r.json();
}

// POST /undo — 이전 outfit 으로 복원 (Stack pop)
export async function undoOutfit() {
  if (USE_MOCK) return null; // mock 에선 useOutfit 이 로컬 스택으로 처리
  const r = await fetch(`${BASE_URL}/undo`, { method: 'POST' });
  return r.json();
}

// POST /reset — 전체 초기화
export async function resetOutfit() {
  if (USE_MOCK) return Object.fromEntries(SLOTS.map((s) => [s, null]));
  const r = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return r.json();
}

// 아이템 이미지 URL (프론트 public/assets 에서 직접 서빙 — C 서버 무관)
export function getItemImageUrl(filename) {
  return `/assets/items/${filename}`;
}

export function getCharacterImageUrl() {
  return '/assets/character/base.png';
}
