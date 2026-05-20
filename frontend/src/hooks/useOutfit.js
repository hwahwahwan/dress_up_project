// =============================================================================
// useOutfit — 옷 입히기 상태 훅
// =============================================================================
// docs/folder_structure.md 의 hooks/useOutfit.js 위치.
//
// 상태:
//   equipped : { tops, bottoms, shoes, accessories } → 각 슬롯에 item 객체 or null
//   history  : Stack — [{ prev, next }] 형태, undo 시 pop 하여 prev 복원
//
// 액션:
//   toggleItem(item)       — 같은 슬롯에 같은 id 면 해제, 아니면 착용
//   equip(item)            — 슬롯에 강제 착용 (이전 슬롯 아이템 교체)
//   unequip(category)      — 슬롯 비우기
//   undo()                 — Stack pop → 이전 상태 복원
//   reset()                — 전부 비우기 (history 에 push)
//
// 모든 변경은 prev/next 쌍으로 history Stack 에 push 되어 undo 가능.
// 백엔드 연결 시(USE_MOCK=false)에는 각 변경마다 서버 호출 후 응답으로 동기화.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  equipItem, unequipCategory, undoOutfit, resetOutfit, getOutfit,
  USE_MOCK,
} from '../api/outfitApi.js';
import { SLOTS } from '../data/items.js';

const EMPTY = Object.fromEntries(SLOTS.map((s) => [s, null]));

export default function useOutfit() {
  const [equipped, setEquipped] = useState(EMPTY);
  const [history,  setHistory]  = useState([]);

  // 백엔드 연결 시: mount 후 서버의 현재 outfit 으로 동기화
  useEffect(() => {
    if (USE_MOCK) return;
    getOutfit().then(setEquipped).catch((e) => console.error('[useOutfit] sync:', e));
  }, []);

  // 공통: 새 outfit 으로 전환 + Stack 에 push
  const commit = useCallback((next) => {
    setEquipped((prev) => {
      const same = SLOTS.every((k) => (prev[k]?.id ?? null) === (next[k]?.id ?? null));
      if (!same) setHistory((h) => [...h, { prev, next }]);
      return next;
    });
  }, []);

  // 클릭 시 동작: 같은 슬롯에 같은 아이템이면 해제, 아니면 착용/교체
  const toggleItem = useCallback(async (item) => {
    if (!item) return;
    const slot = item.category;
    const currentInSlot = equipped[slot];
    const willEquip = currentInSlot?.id !== item.id;

    const next = { ...equipped, [slot]: willEquip ? item : null };
    commit(next);

    if (!USE_MOCK) {
      try {
        if (willEquip) {
          await equipItem(item.id);
        } else {
          await unequipCategory(slot);
        }
      } catch (e) {
        console.error('[useOutfit] toggle:', e);
      }
    }
  }, [equipped, commit]);

  const equip = useCallback(async (item) => {
    if (!item) return;
    commit({ ...equipped, [item.category]: item });
    if (!USE_MOCK) {
      try { await equipItem(item.id); } catch (e) { console.error('[useOutfit] equip:', e); }
    }
  }, [equipped, commit]);

  const unequip = useCallback(async (category) => {
    if (!equipped[category]) return;
    commit({ ...equipped, [category]: null });
    if (!USE_MOCK) {
      try { await unequipCategory(category); } catch (e) { console.error('[useOutfit] unequip:', e); }
    }
  }, [equipped, commit]);

  // Stack pop — 직전 변경 되돌리기
  const undo = useCallback(async () => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setEquipped(last.prev);
      return h.slice(0, -1);
    });
    if (!USE_MOCK) {
      try { await undoOutfit(); } catch (e) { console.error('[useOutfit] undo:', e); }
    }
  }, []);

  const reset = useCallback(async () => {
    commit(EMPTY);
    if (!USE_MOCK) {
      try { await resetOutfit(); } catch (e) { console.error('[useOutfit] reset:', e); }
    }
  }, [commit]);

  // 현재 착용 아이템 수
  const equippedCount = SLOTS.filter((k) => equipped[k]).length;

  return {
    equipped,
    history,
    canUndo: history.length > 0,
    equippedCount,
    toggleItem,
    equip,
    unequip,
    undo,
    reset,
  };
}
